/**
 * Play Command - /play <url | search>
 */

import { ChatInputCommandInteraction, SlashCommandBuilder, GuildMember } from 'discord.js';
import play from 'play-dl';
import { musicPlayer } from '../managers/music-player';
import { queueManager } from '../managers/queue-manager';
import { youtubeHelper } from '../utils/youtube-helper';
import { spotifyResolver } from '../utils/spotify-resolver';
import { Track } from '../types';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play music from YouTube or Spotify')
  .addStringOption((option) =>
    option
      .setName('query')
      .setDescription('YouTube URL, Spotify URL, or search query')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    await interaction.deferReply();

    const query = interaction.options.getString('query', true);
    const member = interaction.member as GuildMember;
    const guildId = interaction.guildId!;

    // Check if user is in a voice channel
    if (!member.voice.channel) {
      await interaction.editReply('❌ You need to be in a voice channel to play music!');
      return;
    }

    // Acquire lock to prevent concurrent play operations
    const lockAcquired = await queueManager.acquireLock(guildId);
    if (!lockAcquired) {
      await interaction.editReply('⏳ Please wait, processing another request...');
      return;
    }

    try {
      // Initialize queue
      queueManager.initializeQueue(guildId);

      // Determine input type and process
      const tracks = await processInput(query, member.user.tag);

      if (!tracks || tracks.length === 0) {
        await interaction.editReply('❌ No tracks found for your query.');
        return;
      }

      // Add tracks to queue
      if (tracks.length === 1) {
        queueManager.addTrack(guildId, tracks[0]);
        await interaction.editReply(`🎵 Added to queue: **${tracks[0].title}**`);
      } else {
        queueManager.addTracks(guildId, tracks);
        await interaction.editReply(`📋 Added **${tracks.length}** tracks to queue`);
      }

      // Join voice channel if not connected
      const connection = musicPlayer.getConnection(guildId);
      if (!connection) {
        await musicPlayer.joinChannel(member.voice.channel, guildId);
      }

      // Start playing if nothing is currently playing
      if (!queueManager.isPlaying(guildId)) {
        await musicPlayer.playNext(guildId);
      }
    } finally {
      // Always release lock
      queueManager.releaseLock(guildId);
    }
  } catch (error) {
    console.error('[Play Command] Error:', error);
    await interaction.editReply('❌ An error occurred while processing your request.');
    
    // Release lock on error
    if (interaction.guildId) {
      queueManager.releaseLock(interaction.guildId);
    }
  }
}

/**
 * Process input (URL or search query) and return tracks
 */
async function processInput(input: string, requestedBy: string): Promise<Track[]> {
  // Check if it's a Spotify URL
  if (play.sp_validate(input)) {
    const type = play.sp_validate(input);

    if (type === 'track') {
      const track = await spotifyResolver.resolveTrack(input);
      return track ? [track as Track] : [];
    } else if (type === 'playlist' || type === 'album') {
      const tracks = await spotifyResolver.resolvePlaylist(input);
      return tracks.map((t) => ({
        ...t,
        requestedBy,
      }));
    }
  }

  // Check if it's a YouTube URL
  if (youtubeHelper.isYouTubeUrl(input)) {
    const validateResult = play.yt_validate(input);

    if (validateResult === 'video') {
      const track = await youtubeHelper.getVideoInfo(input, requestedBy);
      return track ? [track] : [];
    } else if (validateResult === 'playlist') {
      return await youtubeHelper.getPlaylistInfo(input, requestedBy);
    }
  }

  // Otherwise, treat as search query
  const track = await youtubeHelper.search(input, requestedBy);
  return track ? [track] : [];
}
