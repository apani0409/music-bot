/**
 * YouTube Search Helper - Optimized search with caching
 */

import play from 'play-dl';
import { YouTubeSearchResult, Track } from '../types';
import { cacheManager } from './cache';
import { rateLimitHandler } from './rate-limit';

export class YouTubeHelper {
  /**
   * Search YouTube with caching and retry logic
   */
  public async search(query: string, requestedBy: string): Promise<Track | null> {
    try {
      // Check cache first
      const cached = cacheManager.getSearchResult(query);
      if (cached) {
        return this.convertToTrack(cached, requestedBy);
      }

      // Execute search with retry logic
      const result = await rateLimitHandler.executeWithRetry(
        async () => {
          const results = await play.search(query, {
            limit: 1,
            source: { youtube: 'video' },
          });

          if (!results || results.length === 0) {
            throw new Error('No results found');
          }

          return results[0];
        },
        {
          maxAttempts: 3,
          delayMs: 1000,
          backoffMultiplier: 2,
          maxDelayMs: 5000,
        },
        `youtube-search-${query}`
      );

      const ytResult: YouTubeSearchResult = {
        title: result.title || query,
        url: result.url,
        duration: result.durationInSec || 0,
        thumbnail: result.thumbnails?.[0]?.url,
      };

      // Cache the result
      cacheManager.setSearchResult(query, ytResult);

      return this.convertToTrack(ytResult, requestedBy);
    } catch (error) {
      console.error('[YouTube Helper] Search error:', error);
      return null;
    }
  }

  /**
   * Validate YouTube URL
   */
  public isYouTubeUrl(url: string): boolean {
    return play.yt_validate(url) === 'video' || play.yt_validate(url) === 'playlist';
  }

  /**
   * Get video info from YouTube URL
   */
  public async getVideoInfo(url: string, requestedBy: string): Promise<Track | null> {
    try {
      // Check cache first (using URL as key)
      const cached = cacheManager.getSearchResult(url);
      if (cached) {
        return this.convertToTrack(cached, requestedBy);
      }

      // Execute with retry logic
      const info = await rateLimitHandler.executeWithRetry(
        async () => {
          return await play.video_info(url);
        },
        {
          maxAttempts: 3,
          delayMs: 1000,
          backoffMultiplier: 2,
          maxDelayMs: 5000,
        },
        `youtube-info-${url}`
      );

      const ytResult: YouTubeSearchResult = {
        title: info.video_details.title || 'Unknown',
        url: info.video_details.url,
        duration: info.video_details.durationInSec || 0,
        thumbnail: info.video_details.thumbnails?.[0]?.url,
      };

      // Cache the result
      cacheManager.setSearchResult(url, ytResult);

      return this.convertToTrack(ytResult, requestedBy);
    } catch (error) {
      console.error('[YouTube Helper] Video info error:', error);
      return null;
    }
  }

  /**
   * Get playlist info from YouTube URL
   */
  public async getPlaylistInfo(url: string, requestedBy: string): Promise<Track[]> {
    try {
      const playlist = await rateLimitHandler.executeWithRetry(
        async () => {
          return await play.playlist_info(url, { incomplete: true });
        },
        {
          maxAttempts: 3,
          delayMs: 1000,
          backoffMultiplier: 2,
          maxDelayMs: 5000,
        },
        `youtube-playlist-${url}`
      );

      const tracks: Track[] = [];
      const videos = await playlist.all_videos();

      for (const video of videos) {
        const ytResult: YouTubeSearchResult = {
          title: video.title || 'Unknown',
          url: video.url,
          duration: video.durationInSec || 0,
          thumbnail: video.thumbnails?.[0]?.url,
        };

        // Cache each video
        cacheManager.setSearchResult(video.url, ytResult);

        tracks.push(this.convertToTrack(ytResult, requestedBy));
      }

      return tracks;
    } catch (error) {
      console.error('[YouTube Helper] Playlist info error:', error);
      return [];
    }
  }

  /**
   * Convert YouTube search result to Track
   */
  private convertToTrack(result: YouTubeSearchResult, requestedBy: string): Track {
    return {
      title: result.title,
      url: result.url,
      duration: result.duration,
      requestedBy,
      thumbnail: result.thumbnail,
    };
  }
}

// Singleton instance
export const youtubeHelper = new YouTubeHelper();
