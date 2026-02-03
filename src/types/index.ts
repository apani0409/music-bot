import { AudioPlayer } from '@discordjs/voice';

/**
 * Represents a track in the music queue
 */
export interface Track {
  title: string;
  url: string;
  duration: number;
  requestedBy: string;
  thumbnail?: string;
}

/**
 * Represents a music queue for a guild
 */
export interface MusicQueue {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isPaused: boolean;
  volume: number;
}

/**
 * Cache entry for search results
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * YouTube search result
 */
export interface YouTubeSearchResult {
  title: string;
  url: string;
  duration: number;
  thumbnail?: string;
}

/**
 * Spotify track metadata
 */
export interface SpotifyTrack {
  name: string;
  artist: string;
  album: string;
  duration: number;
}

/**
 * Spotify playlist metadata
 */
export interface SpotifyPlaylist {
  name: string;
  tracks: SpotifyTrack[];
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Guild music data
 */
export interface GuildMusicData {
  queue: MusicQueue;
  player: AudioPlayer;
  connection: any;
  isLocked: boolean;
}

/**
 * Command interaction context
 */
export interface CommandContext {
  guildId: string;
  userId: string;
  channelId: string;
  voiceChannelId?: string;
}

/**
 * Search cache key
 */
export type SearchCacheKey = string;

/**
 * Retry options for operations
 */
export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Stream options for audio playback
 */
export interface StreamOptions {
  quality?: 'high' | 'low';
  discordPlayerCompatibility?: boolean;
}
