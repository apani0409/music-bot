/**
 * Queue Manager - Per-guild music queue with concurrency control
 */

import { Track, MusicQueue } from '../types';

export class QueueManager {
  private queues: Map<string, MusicQueue>;
  private locks: Map<string, boolean>;

  constructor() {
    this.queues = new Map();
    this.locks = new Map();
  }

  /**
   * Initialize queue for a guild
   */
  public initializeQueue(guildId: string): void {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, {
        tracks: [],
        currentTrack: null,
        isPlaying: false,
        isPaused: false,
        volume: 1.0,
      });
      this.locks.set(guildId, false);
    }
  }

  /**
   * Get queue for a guild
   */
  public getQueue(guildId: string): MusicQueue | null {
    return this.queues.get(guildId) || null;
  }

  /**
   * Add track to queue
   */
  public addTrack(guildId: string, track: Track): void {
    this.initializeQueue(guildId);
    const queue = this.queues.get(guildId)!;
    queue.tracks.push(track);
  }

  /**
   * Add multiple tracks to queue
   */
  public addTracks(guildId: string, tracks: Track[]): void {
    this.initializeQueue(guildId);
    const queue = this.queues.get(guildId)!;
    queue.tracks.push(...tracks);
  }

  /**
   * Get next track from queue
   */
  public getNextTrack(guildId: string): Track | null {
    const queue = this.queues.get(guildId);
    if (!queue || queue.tracks.length === 0) {
      return null;
    }

    const nextTrack = queue.tracks.shift()!;
    queue.currentTrack = nextTrack;
    return nextTrack;
  }

  /**
   * Get current track
   */
  public getCurrentTrack(guildId: string): Track | null {
    const queue = this.queues.get(guildId);
    return queue?.currentTrack || null;
  }

  /**
   * Skip current track
   */
  public skip(guildId: string): Track | null {
    const queue = this.queues.get(guildId);
    if (!queue) return null;

    queue.currentTrack = null;
    return this.getNextTrack(guildId);
  }

  /**
   * Clear queue
   */
  public clear(guildId: string): void {
    const queue = this.queues.get(guildId);
    if (queue) {
      queue.tracks = [];
      queue.currentTrack = null;
      queue.isPlaying = false;
      queue.isPaused = false;
    }
  }

  /**
   * Get queue size
   */
  public getSize(guildId: string): number {
    const queue = this.queues.get(guildId);
    return queue?.tracks.length || 0;
  }

  /**
   * Check if queue is empty
   */
  public isEmpty(guildId: string): boolean {
    return this.getSize(guildId) === 0;
  }

  /**
   * Set playing status
   */
  public setPlaying(guildId: string, isPlaying: boolean): void {
    const queue = this.queues.get(guildId);
    if (queue) {
      queue.isPlaying = isPlaying;
    }
  }

  /**
   * Set paused status
   */
  public setPaused(guildId: string, isPaused: boolean): void {
    const queue = this.queues.get(guildId);
    if (queue) {
      queue.isPaused = isPaused;
    }
  }

  /**
   * Check if playing
   */
  public isPlaying(guildId: string): boolean {
    const queue = this.queues.get(guildId);
    return queue?.isPlaying || false;
  }

  /**
   * Check if paused
   */
  public isPaused(guildId: string): boolean {
    const queue = this.queues.get(guildId);
    return queue?.isPaused || false;
  }

  /**
   * Acquire lock for guild (prevent concurrent play operations)
   */
  public async acquireLock(guildId: string): Promise<boolean> {
    // Check if already locked
    if (this.locks.get(guildId)) {
      return false;
    }

    this.locks.set(guildId, true);
    return true;
  }

  /**
   * Release lock for guild
   */
  public releaseLock(guildId: string): void {
    this.locks.set(guildId, false);
  }

  /**
   * Check if guild is locked
   */
  public isLocked(guildId: string): boolean {
    return this.locks.get(guildId) || false;
  }

  /**
   * Delete queue for guild (cleanup)
   */
  public deleteQueue(guildId: string): void {
    this.queues.delete(guildId);
    this.locks.delete(guildId);
  }

  /**
   * Get all tracks in queue (including current)
   */
  public getAllTracks(guildId: string): Track[] {
    const queue = this.queues.get(guildId);
    if (!queue) return [];

    const tracks: Track[] = [];
    if (queue.currentTrack) {
      tracks.push(queue.currentTrack);
    }
    tracks.push(...queue.tracks);
    return tracks;
  }
}

// Singleton instance
export const queueManager = new QueueManager();
