/**
 * Cache Layer - Aggressive request reduction for YouTube rate-limit mitigation
 */

import { CacheEntry, YouTubeSearchResult, SpotifyTrack } from '../types';

export class CacheManager {
  private searchCache: Map<string, CacheEntry<YouTubeSearchResult>>;
  private spotifyCache: Map<string, CacheEntry<SpotifyTrack>>;
  private readonly cacheTTL: number;
  private readonly maxCacheSize: number;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(cacheTTL: number = 3600000, maxCacheSize: number = 1000) {
    this.searchCache = new Map();
    this.spotifyCache = new Map();
    this.cacheTTL = cacheTTL; // Default: 1 hour
    this.maxCacheSize = maxCacheSize;
    this.cleanupInterval = null;
    this.startPeriodicCleanup();
  }

  /**
   * Get cached YouTube search result
   */
  public getSearchResult(query: string): YouTubeSearchResult | null {
    const cacheKey = this.normalizeKey(query);
    const entry = this.searchCache.get(cacheKey);

    if (!entry) {
      return null;
    }

    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > this.cacheTTL) {
      this.searchCache.delete(cacheKey);
      return null;
    }

    return entry.data;
  }

  /**
   * Cache YouTube search result
   */
  public setSearchResult(query: string, result: YouTubeSearchResult): void {
    const cacheKey = this.normalizeKey(query);
    
    // Implement size limit
    if (this.searchCache.size >= this.maxCacheSize) {
      this.evictOldestEntry(this.searchCache);
    }

    this.searchCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached Spotify track metadata
   */
  public getSpotifyTrack(spotifyUrl: string): SpotifyTrack | null {
    const cacheKey = this.normalizeKey(spotifyUrl);
    const entry = this.spotifyCache.get(cacheKey);

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > this.cacheTTL) {
      this.spotifyCache.delete(cacheKey);
      return null;
    }

    return entry.data;
  }

  /**
   * Cache Spotify track metadata
   */
  public setSpotifyTrack(spotifyUrl: string, track: SpotifyTrack): void {
    const cacheKey = this.normalizeKey(spotifyUrl);
    
    if (this.spotifyCache.size >= this.maxCacheSize) {
      this.evictOldestEntry(this.spotifyCache);
    }

    this.spotifyCache.set(cacheKey, {
      data: track,
      timestamp: Date.now(),
    });
  }

  /**
   * Normalize cache key (lowercase, trim)
   */
  private normalizeKey(key: string): string {
    return key.toLowerCase().trim();
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldestEntry<T>(cache: Map<string, CacheEntry<T>>): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  /**
   * Clear all caches
   */
  public clearAll(): void {
    this.searchCache.clear();
    this.spotifyCache.clear();
  }

  /**
   * Get cache statistics
   */
  public getStats(): { searchCacheSize: number; spotifyCacheSize: number } {
    return {
      searchCacheSize: this.searchCache.size,
      spotifyCacheSize: this.spotifyCache.size,
    };
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startPeriodicCleanup(): void {
    // Run cleanup every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 600000);
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let removedCount = 0;

    // Clean search cache
    for (const [key, entry] of this.searchCache.entries()) {
      if (now - entry.timestamp > this.cacheTTL) {
        this.searchCache.delete(key);
        removedCount++;
      }
    }

    // Clean spotify cache
    for (const [key, entry] of this.spotifyCache.entries()) {
      if (now - entry.timestamp > this.cacheTTL) {
        this.spotifyCache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`[Cache] Cleaned up ${removedCount} expired entries`);
    }
  }

  /**
   * Destroy cache and cleanup timers
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clearAll();
  }
}

// Singleton instance
export const cacheManager = new CacheManager();
