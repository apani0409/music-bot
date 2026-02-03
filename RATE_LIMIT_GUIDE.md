# Discord Music Bot - Rate-Limit Best Practices

## Understanding YouTube Rate Limits

YouTube implements rate limiting to prevent abuse of their API and streaming services. When using tools like `play-dl`, you're essentially scraping YouTube's web interface, which has its own set of limits.

### Common Rate Limit Triggers

1. **Too many search requests** in a short time period
2. **Rapid consecutive video info requests**
3. **Multiple simultaneous streams** from the same IP
4. **Playlist fetching** without delays between items

## Implemented Mitigation Strategies

### 1. Aggressive Caching (Primary Defense)

**Search Results Cache:**
- TTL: 1 hour (configurable)
- Max size: 1000 entries
- LRU eviction policy

**Benefits:**
- Eliminates repeated searches for the same query
- Reduces API calls by up to 80% for popular tracks
- Instant responses for cached content

**How it works:**
```typescript
// First request: Hits YouTube API
/play never gonna give you up

// Second request: Returns from cache (no API call)
/play never gonna give you up
```

### 2. Exponential Backoff Retry Logic

When a rate limit is detected (HTTP 429), the bot:

1. **Waits** 1 second before first retry
2. **Doubles** the wait time for each subsequent retry (2s, 4s)
3. **Caps** maximum wait at 5 seconds
4. **Gives up** after 3 attempts

**Configuration:**
```typescript
{
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 5000
}
```

### 3. Concurrency Control

**Per-Guild Locks:**
- Only one `/play` command can execute at a time per server
- Prevents race conditions and duplicate requests
- Automatically released after completion

**Single Stream Per Guild:**
- Only one active audio stream per server
- Previous streams are stopped before new ones start

### 4. Request Reduction Techniques

**What We DON'T Fetch:**
- Thumbnails (unless needed)
- Video descriptions
- Comments
- Related videos
- Detailed statistics

**What We DO Cache:**
- Search results
- Video metadata
- Spotify-to-YouTube mappings

### 5. Spotify Resolution Optimization

**Smart Resolution:**
```
Spotify URL → Metadata → YouTube Search → Cache
```

**Cached at Two Levels:**
1. Spotify metadata (artist + track name)
2. YouTube search result

**Result:** Only one YouTube API call per unique Spotify track

## Advanced Optimization Techniques

### Custom Search Strategies

If you experience persistent rate limiting, implement these additional strategies:

#### 1. Delay Between Playlist Items

Edit `src/utils/spotify-resolver.ts`:

```typescript
// Current delay: 100ms
await this.sleep(100);

// For aggressive rate-limit avoidance: 500ms-1s
await this.sleep(500);
```

#### 2. Reduce Cache Size on Low-Memory VPS

Edit `src/utils/cache.ts`:

```typescript
// Default: 1000 entries
constructor(cacheTTL: number = 3600000, maxCacheSize: number = 1000)

// Low-memory VPS: 500 entries
constructor(cacheTTL: number = 3600000, maxCacheSize: number = 500)
```

#### 3. Increase Cache TTL

```typescript
// Default: 1 hour (3600000ms)
new CacheManager(3600000, 1000)

// Extended: 24 hours
new CacheManager(86400000, 1000)
```

#### 4. Implement Request Queue

For high-traffic bots, implement a global request queue:

```typescript
class RequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private minDelay = 1000; // 1 second between requests

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      await request();
      await new Promise(r => setTimeout(r, this.minDelay));
    }

    this.processing = false;
  }
}
```

## Monitoring Rate Limits

### Check Cache Effectiveness

Add to your bot:

```typescript
// Log cache stats every hour
setInterval(() => {
  const stats = cacheManager.getStats();
  logger.info(`Cache Stats - Search: ${stats.searchCacheSize}, Spotify: ${stats.spotifyCacheSize}`);
}, 3600000);
```

### Monitor Retry Attempts

The bot automatically logs retry attempts:

```
[WARN] Rate Limit: Attempt 1/3 failed for youtube-search-song name
[WARN] Rate Limit: Attempt 2/3 failed for youtube-search-song name
```

If you see many retries, consider:
1. Increasing delays
2. Implementing request queuing
3. Reducing bot usage
4. Checking for VPS IP reputation

## What to Do When Rate Limited

### Immediate Actions

1. **Wait it out** - Rate limits typically reset after 1-24 hours
2. **Clear cache** - Sometimes corrupted cache causes issues
3. **Restart bot** - Fresh start can help

### Long-term Solutions

1. **Use a different VPS provider/IP**
2. **Implement stricter caching**
3. **Reduce bot usage across servers**
4. **Consider YouTube Data API** (official, has quotas)

## Using YouTube Data API (Alternative)

For a more stable solution with official support:

1. **Get API Key** from [Google Cloud Console](https://console.cloud.google.com/)
2. **Daily Quota**: 10,000 units (approx. 10,000 searches)
3. **No IP-based rate limiting**

**Trade-offs:**
- ✅ Official support, stable
- ✅ Clear quota limits
- ❌ Requires API key
- ❌ Daily quota can be exhausted
- ❌ Additional complexity

## Bot Usage Recommendations

### For Personal Use (1-2 Servers)

- Default configuration is fine
- Cache will handle most requests
- Rate limits should be rare

### For Small Communities (3-10 Servers)

- Consider increasing cache TTL to 24 hours
- Monitor retry logs
- Implement per-server usage limits if needed

### For Larger Deployments (10+ Servers)

- **Not recommended** with web scraping approach
- Consider official YouTube Data API
- Implement comprehensive request queuing
- Use multiple VPS instances with load balancing

## Red Flags (Signs of Rate Limiting)

🚩 Frequent "No results found" errors
🚩 Many retry log messages
🚩 Slow response times
🚩 "429 Too Many Requests" errors
🚩 Playback starts failing after bot runs for hours

## Testing Your Configuration

```bash
# Monitor logs in real-time
pm2 logs discord-music-bot

# Watch for these patterns
# Good: "✓ Added to queue"
# Warning: "[Rate Limit] Attempt X/3"
# Bad: "Operation failed after 3 attempts"

# Check memory and cache stats
# Should see periodic "[Cache] Cleaned up X entries"
# Memory should stabilize under 500MB
```

## Summary: The Golden Rules

1. ✅ **Cache everything** - Avoid repeated API calls
2. ✅ **Implement delays** - Space out requests
3. ✅ **Use retry logic** - Handle transient failures
4. ✅ **Monitor logs** - Watch for rate limit warnings
5. ✅ **Limit concurrency** - One operation at a time per guild
6. ✅ **Personal use only** - Don't make it public
7. ✅ **VPS IP matters** - Clean IP = fewer issues

---

**Remember:** This bot uses web scraping, which is a gray area. Always respect rate limits and use responsibly.
