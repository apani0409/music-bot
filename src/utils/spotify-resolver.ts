/**
 * Spotify to YouTube Resolver - Convert Spotify links to YouTube search queries
 */

import play from 'play-dl';
import { SpotifyTrack, YouTubeSearchResult } from '../types';
import { cacheManager } from './cache';
import { rateLimitHandler } from './rate-limit';

export class SpotifyResolver {
  /**
   * Resolve Spotify track URL to YouTube search result
   */
  public async resolveTrack(spotifyUrl: string): Promise<YouTubeSearchResult | null> {
    try {
      // Check cache first
      const cached = cacheManager.getSpotifyTrack(spotifyUrl);
      if (cached) {
        return this.searchYouTubeFromMetadata(cached);
      }

      // Validate Spotify URL
      if (!play.sp_validate(spotifyUrl)) {
        return null;
      }

      const type = play.sp_validate(spotifyUrl);
      
      if (type === 'track') {
        const trackInfo = await this.getSpotifyTrackInfo(spotifyUrl);
        if (!trackInfo) return null;

        // Cache the Spotify metadata
        cacheManager.setSpotifyTrack(spotifyUrl, trackInfo);

        // Search YouTube using metadata
        return this.searchYouTubeFromMetadata(trackInfo);
      }

      return null;
    } catch (error) {
      console.error('[Spotify Resolver] Error resolving track:', error);
      return null;
    }
  }

  /**
   * Resolve Spotify playlist/album to multiple YouTube results
   */
  public async resolvePlaylist(spotifyUrl: string): Promise<YouTubeSearchResult[]> {
    try {
      if (!play.sp_validate(spotifyUrl)) {
        return [];
      }

      const type = play.sp_validate(spotifyUrl);
      
      if (type === 'playlist' || type === 'album') {
        const playlist = await play.spotify(spotifyUrl);

        if (!playlist) return [];

        const tracks: YouTubeSearchResult[] = [];

        // play-dl typings vary across versions; access tracks defensively
        const allTracks = (playlist as any).all_tracks
          ? await (playlist as any).all_tracks()
          : (playlist as any).tracks || [];

        for (const track of allTracks) {
          const metadata: SpotifyTrack = {
            name: track.name || track.title || 'Unknown',
            artist: (track.artists && track.artists[0] && track.artists[0].name) || track.artist || 'Unknown Artist',
            album: (track.album && track.album.name) || track.album || '',
            duration: track.durationInMs || track.duration || 0,
          };

          // Cache each track if URL is available
          const trackUrl = track.url || track.external_urls?.spotify || '';
          if (trackUrl) {
            cacheManager.setSpotifyTrack(trackUrl, metadata);
          }

          // Search YouTube for each track
          const ytResult = await this.searchYouTubeFromMetadata(metadata);
          if (ytResult) {
            tracks.push(ytResult);
          }

          // Add small delay to avoid rate limits
          await this.sleep(100);
        }

        return tracks;
      }

      return [];
    } catch (error) {
      console.error('[Spotify Resolver] Error resolving playlist:', error);
      return [];
    }
  }

  /**
   * Get Spotify track information
   */
  private async getSpotifyTrackInfo(url: string): Promise<SpotifyTrack | null> {
    try {
      const info = await play.spotify(url);

      if (!info || (info as any).type !== 'track') {
        return null;
      }

      const i = info as any;

      return {
        name: i.name || 'Unknown',
        artist: (i.artists && i.artists[0] && i.artists[0].name) || 'Unknown Artist',
        album: (i.album && i.album.name) || '',
        duration: i.durationInMs || i.duration || 0,
      };
    } catch (error) {
      console.error('[Spotify Resolver] Error fetching track info:', error);
      return null;
    }
  }

  /**
   * Search YouTube using Spotify metadata
   */
  private async searchYouTubeFromMetadata(
    metadata: SpotifyTrack
  ): Promise<YouTubeSearchResult | null> {
    try {
      const searchQuery = `${metadata.artist} ${metadata.name}`;
      
      // Check cache first
      const cached = cacheManager.getSearchResult(searchQuery);
      if (cached) {
        return cached;
      }

      // Execute search with retry logic
      const result = await rateLimitHandler.executeWithRetry(
        async () => {
          const results = await play.search(searchQuery, {
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
        `youtube-search-${searchQuery}`
      );

      const ytResult: YouTubeSearchResult = {
        title: result.title || metadata.name,
        url: result.url,
        duration: result.durationInSec || Math.floor(metadata.duration / 1000),
      };

      // Cache the result
      cacheManager.setSearchResult(searchQuery, ytResult);

      return ytResult;
    } catch (error) {
      console.error('[Spotify Resolver] Error searching YouTube:', error);
      return null;
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const spotifyResolver = new SpotifyResolver();
