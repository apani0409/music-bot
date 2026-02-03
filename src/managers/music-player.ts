/**
 * Music Player - Handle audio playback with optimized streaming
 */

import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayer,
  AudioPlayerStatus,
  VoiceConnection,
  VoiceConnectionStatus,
  entersState,
  AudioResource,
} from '@discordjs/voice';
import { VoiceBasedChannel } from 'discord.js';
import { spawn } from 'child_process';
import { Track } from '../types';
import { queueManager } from './queue-manager';
import { rateLimitHandler } from '../utils/rate-limit';

export class MusicPlayer {
  private players: Map<string, AudioPlayer>;
  private connections: Map<string, VoiceConnection>;

  constructor() {
    this.players = new Map();
    this.connections = new Map();
  }

  /**
   * Join voice channel and setup player
   */
  public async joinChannel(
    channel: VoiceBasedChannel,
    guildId: string
  ): Promise<VoiceConnection> {
    // Check if already connected
    const existingConnection = this.connections.get(guildId);
    if (existingConnection) {
      return existingConnection;
    }

    // Create voice connection
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      // adapterCreator typing can vary depending on discord.js/@discordjs/voice versions
      // cast to any to avoid incompatibilities between library minor versions
      adapterCreator: (channel.guild.voiceAdapterCreator as unknown) as any,
    });

    // Setup connection error handlers
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5000),
        ]);
      } catch (error) {
        console.error('[Music Player] Connection lost, cleaning up');
        this.cleanup(guildId);
      }
    });

    connection.on('error', (error) => {
      console.error('[Music Player] Connection error:', error);
      this.cleanup(guildId);
    });

    this.connections.set(guildId, connection);

    // Create audio player if not exists
    if (!this.players.has(guildId)) {
      this.createPlayer(guildId);
    }

    return connection;
  }

  /**
   * Create audio player for guild
   */
  private createPlayer(guildId: string): AudioPlayer {
    const player = createAudioPlayer();

    // Handle player state changes
    player.on(AudioPlayerStatus.Idle, () => {
      console.log(`[Music Player] Player idle for guild ${guildId}`);
      queueManager.setPlaying(guildId, false);
      
      // Play next track automatically
      this.playNext(guildId).catch((error) => {
        console.error('[Music Player] Error playing next track:', error);
      });
    });

    player.on(AudioPlayerStatus.Playing, () => {
      console.log(`[Music Player] Now playing for guild ${guildId}`);
      queueManager.setPlaying(guildId, true);
      queueManager.setPaused(guildId, false);
    });

    player.on(AudioPlayerStatus.Paused, () => {
      console.log(`[Music Player] Paused for guild ${guildId}`);
      queueManager.setPaused(guildId, true);
    });

    player.on('error', (error) => {
      console.error('[Music Player] Player error:', error);
      queueManager.setPlaying(guildId, false);
      
      // Try to play next track on error
      this.playNext(guildId).catch((err) => {
        console.error('[Music Player] Error recovering from player error:', err);
      });
    });

    this.players.set(guildId, player);

    // Subscribe player to connection
    const connection = this.connections.get(guildId);
    if (connection) {
      connection.subscribe(player);
    }

    return player;
  }

  /**
   * Play a track
   */
  public async play(guildId: string, track: Track): Promise<void> {
    const player = this.players.get(guildId);
    if (!player) {
      throw new Error('Player not initialized');
    }

    try {
      // Create audio resource with retry logic
      const resource = await rateLimitHandler.executeWithRetry(
        async () => {
          return await this.createAudioResource(track.url);
        },
        {
          maxAttempts: 3,
          delayMs: 1000,
          backoffMultiplier: 2,
          maxDelayMs: 5000,
          onRetry: (attempt) => {
            console.warn(`[Music Player] Retry ${attempt} for ${track.title}`);
          },
        },
        `play-${guildId}-${track.url ?? 'undefined'}`
      );

      player.play(resource);
      queueManager.setPlaying(guildId, true);
    } catch (error) {
      console.error('[Music Player] Error playing track:', error);
      throw error;
    }
  }

  /**
   * Create audio resource from URL using yt-dlp
   */
  private async createAudioResource(url: string): Promise<AudioResource> {
    if (!url) {
      const err = new TypeError('Invalid or empty track URL');
      console.error('[Music Player] createAudioResource called with invalid URL');
      throw err;
    }

    try {
      console.log(`[Music Player] Creating stream for URL: ${url}`);

      // Use yt-dlp to get audio stream
      // yt-dlp handles YouTube decryption and auth tokens automatically
      return new Promise((resolve, reject) => {
        const proc = spawn('yt-dlp', [
          '-f', 'bestaudio[ext=m4a]/bestaudio',
          '-o', '-',
          '--no-warnings',
          '--no-playlist',
          '-q',
          url,
        ]);

        let hasError = false;

        proc.stderr.on('data', (data) => {
          const msg = data.toString();
          if (msg.includes('ERROR') || msg.includes('error')) {
            hasError = true;
            console.error('[Music Player] yt-dlp stderr:', msg);
          }
        });

        proc.on('error', (err) => {
          console.error('[Music Player] yt-dlp spawn error:', err);
          reject(err);
        });

        proc.on('exit', (code) => {
          if (code !== 0 && !hasError) {
            reject(new Error(`yt-dlp exited with code ${code}`));
          }
        });

        try {
          console.log(`[Music Player] Got yt-dlp stream, creating audio resource`);
          const resource = createAudioResource(proc.stdout as any, {
            inlineVolume: true,
          });
          resolve(resource);
        } catch (err) {
          reject(err);
        }
      });
    } catch (error) {
      console.error('[Music Player] Error creating audio resource:', error);
      throw error;
    }
  }

  /**
   * Play next track in queue
   */
  public async playNext(guildId: string): Promise<void> {
    const nextTrack = queueManager.getNextTrack(guildId);
    
    if (!nextTrack) {
      console.log(`[Music Player] Queue empty for guild ${guildId}`);
      queueManager.setPlaying(guildId, false);
      return;
    }

    console.log(`[Music Player] Playing next: ${nextTrack.title}`);
    await this.play(guildId, nextTrack);
  }

  /**
   * Pause playback
   */
  public pause(guildId: string): boolean {
    const player = this.players.get(guildId);
    if (!player) return false;

    const paused = player.pause();
    if (paused) {
      queueManager.setPaused(guildId, true);
    }
    return paused;
  }

  /**
   * Resume playback
   */
  public resume(guildId: string): boolean {
    const player = this.players.get(guildId);
    if (!player) return false;

    const resumed = player.unpause();
    if (resumed) {
      queueManager.setPaused(guildId, false);
    }
    return resumed;
  }

  /**
   * Stop playback
   */
  public stop(guildId: string): void {
    const player = this.players.get(guildId);
    if (player) {
      player.stop();
      queueManager.setPlaying(guildId, false);
    }
  }

  /**
   * Leave voice channel
   */
  public leave(guildId: string): void {
    const connection = this.connections.get(guildId);
    if (connection) {
      connection.destroy();
    }
    this.cleanup(guildId);
  }

  /**
   * Cleanup resources for guild
   */
  private cleanup(guildId: string): void {
    const player = this.players.get(guildId);
    if (player) {
      player.stop();
      this.players.delete(guildId);
    }

    const connection = this.connections.get(guildId);
    if (connection) {
      connection.destroy();
      this.connections.delete(guildId);
    }

    queueManager.clear(guildId);
    queueManager.releaseLock(guildId);
  }

  /**
   * Get player for guild
   */
  public getPlayer(guildId: string): AudioPlayer | null {
    return this.players.get(guildId) || null;
  }

  /**
   * Get connection for guild
   */
  public getConnection(guildId: string): VoiceConnection | null {
    return this.connections.get(guildId) || null;
  }
}

// Singleton instance
export const musicPlayer = new MusicPlayer();
