# Frequently Asked Questions (FAQ)

## General Questions

### What is this bot?

A self-hosted Discord music bot that plays music from YouTube and Spotify. It's designed for personal use in your own Discord server with advanced optimizations to avoid rate limits.

### Is this bot free?

Yes, the code is free (MIT license). However, you need to host it yourself (VPS costs ~$4-6/month for 24/7 operation).

### Can I add this bot to my server?

This bot is designed to be **self-hosted**. You need to set it up yourself using your own Discord bot token and host it on your own machine or VPS.

### Is this bot legal?

The bot uses web scraping to access YouTube, which is a gray area. It's designed for **personal use only**. Always comply with:
- Discord Terms of Service
- YouTube Terms of Service  
- Spotify Terms of Service

## Setup Questions

### What do I need to run this bot?

**Required:**
- Node.js 18 or higher
- FFmpeg
- Discord bot token
- Discord application ID

**Optional for 24/7:**
- VPS or dedicated server
- PM2 process manager

### How do I get a Discord bot token?

1. Go to https://discord.com/developers/applications
2. Create a new application
3. Go to "Bot" tab
4. Click "Reset Token" and copy it
5. Add to your `.env` file

### Where do I run the bot?

**Options:**
1. **Your computer** - Works but not 24/7
2. **VPS** - Recommended for 24/7 ($4-6/month)
3. **Dedicated server** - Overkill but works
4. **Raspberry Pi** - Possible but may struggle

### Do I need a Spotify API key?

No! The bot works without Spotify API credentials. It extracts metadata from Spotify links and searches YouTube automatically.

## Usage Questions

### What sources does the bot support?

**Fully Supported:**
- ✅ YouTube video links
- ✅ YouTube playlist links
- ✅ Spotify track links
- ✅ Spotify playlist links
- ✅ Spotify album links
- ✅ YouTube search queries

**Not Supported:**
- ❌ SoundCloud
- ❌ Twitch
- ❌ Local files
- ❌ Direct MP3 links

### How do I play a song?

```
/play <url or search query>
```

**Examples:**
```
/play https://www.youtube.com/watch?v=dQw4w9WgXcQ
/play https://open.spotify.com/track/...
/play never gonna give you up
```

### Can I play playlists?

Yes! Both YouTube and Spotify playlists are supported:

```
/play https://www.youtube.com/playlist?list=...
/play https://open.spotify.com/playlist/...
/play https://open.spotify.com/album/...
```

### How do I view the queue?

```
/queue
```

Shows current track and upcoming tracks (up to 10 displayed).

### Can I skip songs?

```
/skip
```

Skips the current track and plays the next one.

### How do I clear the queue?

```
/stop
```

Stops playback and clears the entire queue.

## Technical Questions

### What is rate limiting?

YouTube limits how many requests you can make in a certain time period. Make too many requests, and you get temporarily blocked (HTTP 429 error).

### How does this bot avoid rate limits?

**Five key strategies:**
1. **Aggressive caching** - Stores search results for 1 hour
2. **Retry logic** - Waits and retries when rate limited
3. **Concurrency control** - One operation at a time per server
4. **Request reduction** - Only fetches essential data
5. **Spotify optimization** - Caches Spotify-to-YouTube mappings

### What happens if I hit a rate limit?

The bot will:
1. Detect the rate limit (HTTP 429)
2. Wait 1 second
3. Retry (up to 3 times with increasing delays)
4. Report an error if all retries fail

You'll see in logs:
```
[Rate Limit] Attempt 1/3 failed for youtube-search-...
```

### How much RAM does the bot use?

**Typical usage:**
- Idle: ~150-200MB
- Playing: ~250-400MB
- With full cache: ~300-450MB

**Recommended:** 512MB minimum, 1GB ideal

### Can I run multiple bots on one VPS?

Yes, but each bot needs:
- Its own Discord token
- Separate port (if using web features)
- Consider memory limits

For music bots, 1GB RAM = ~2 bots safely.

### Does the bot store any data?

**No persistent storage:**
- No database
- No user data collection
- Queue is lost on restart
- Cache is memory-only

**Privacy-friendly design.**

## Troubleshooting

### Bot doesn't respond to commands

**Checklist:**
1. ✅ Did you run `npm run deploy`?
2. ✅ Is the bot online (green status)?
3. ✅ Does the bot have proper permissions?
4. ✅ Wait 1-2 minutes after deploying commands
5. ✅ Check logs for errors

### "Unknown interaction" error

**Solution:** Run `npm run deploy` and wait a few minutes for Discord to register the commands.

### FFmpeg errors

**Symptoms:**
```
Error: Cannot find ffmpeg
```

**Solution:**
```bash
# Windows
choco install ffmpeg

# Ubuntu
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Verify
ffmpeg -version
```

### Bot joins but no audio plays

**Possible causes:**
1. YouTube rate limit - Check logs
2. FFmpeg not installed
3. Voice permissions missing
4. Outdated dependencies

**Solution:**
```bash
npm install
npm run build
# Check FFmpeg is installed
ffmpeg -version
```

### "You need to be in a voice channel"

You must be in a voice channel **before** using `/play`.

### High memory usage

**Solutions:**
1. Restart the bot: `pm2 restart discord-music-bot`
2. Reduce cache size in `src/utils/cache.ts`
3. Enable log rotation
4. Use a VPS with more RAM

### Bot keeps crashing

**Check logs:**
```bash
pm2 logs discord-music-bot
```

**Common causes:**
1. Out of memory - Upgrade VPS
2. FFmpeg missing
3. Node.js version too old
4. Corrupted dependencies

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build

# Restart
pm2 restart discord-music-bot
```

### Rate limit errors persist

**Short-term:**
- Wait 1-24 hours for rate limit to reset
- Use different search queries
- Play already-cached songs

**Long-term:**
- Increase cache TTL (24 hours)
- Add delays between playlist items
- Use bot less frequently
- Consider different VPS IP

## Performance Questions

### Can the bot handle multiple servers?

**Personal use (1-5 servers):** Perfect
**Small scale (5-10 servers):** Works well
**Medium scale (10-50 servers):** May hit rate limits
**Large scale (50+ servers):** Not recommended (use official APIs)

### How many songs can be in the queue?

**Technically:** Unlimited (memory permitting)

**Practically:**
- 1GB RAM VPS: ~1000 songs safely
- 512MB RAM VPS: ~500 songs safely

### Does caching affect audio quality?

No! Caching stores **search results** only, not audio. Every playback streams fresh audio from YouTube.

### Can I use this for a public bot?

**Not recommended.** This bot uses web scraping which:
- Doesn't scale well
- Violates YouTube TOS for commercial use
- May get your IP rate limited
- Designed for personal use only

For public bots, use official YouTube Data API.

## Deployment Questions

### Best VPS provider for this bot?

**Budget-friendly:**
- DigitalOcean ($6/month, 1GB RAM)
- Vultr ($6/month, 1GB RAM)
- Linode ($5/month, 1GB RAM)
- Hetzner (€4/month, 1GB RAM)

**Minimum specs:** 512MB RAM, 1 CPU core, 10GB storage

### Do I need a domain name?

No! The bot connects directly to Discord. No web server or domain needed.

### Can I run this on Heroku?

Technically yes, but **not recommended**:
- FFmpeg setup is complex
- Limited free tier
- Ephemeral filesystem
- Better options exist (VPS)

### Can I run this on a Raspberry Pi?

Yes! Works on:
- Raspberry Pi 4 (2GB+ RAM) - Recommended
- Raspberry Pi 3B+ - Works but slower
- Raspberry Pi Zero - Not enough power

**Note:** May struggle with high-quality streams.

### How do I update the bot?

```bash
# Pull latest code
git pull

# Reinstall dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart discord-music-bot
```

## Feature Questions

### Can I add lyrics display?

Not currently implemented. Potential future feature.

### Can users vote to skip?

Not currently implemented. You can add this by modifying `/skip` command.

### Can I restrict commands to certain roles?

Not built-in, but you can modify commands to check user roles before executing.

### Can I adjust volume?

Currently uses default volume. You can modify the player code to add volume control.

### Can I create playlists?

Not persistent playlists. Queue is temporary and lost on restart.

## Cost Questions

### How much does it cost to run 24/7?

**VPS hosting:** $4-6/month
**Domain (optional):** $0 (not needed)
**APIs:** $0 (using web scraping)
**Total:** ~$5/month

### Are there any free hosting options?

**Free tiers exist but have limitations:**
- Heroku free tier - Sleeps after inactivity
- Oracle Cloud free tier - Complex setup
- AWS free tier - Only 12 months

**Recommendation:** Spend $5/month for reliable VPS.

### Can I reduce costs?

**Yes:**
1. Share VPS with other services
2. Use cheaper providers (Hetzner ~€4/month)
3. Run on home computer/Raspberry Pi (free but not 24/7)

---

## Still have questions?

Check the documentation:
- [README.md](README.md) - Full documentation
- [QUICK_START.md](QUICK_START.md) - Setup guide
- [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) - Deployment guide
- [RATE_LIMIT_GUIDE.md](RATE_LIMIT_GUIDE.md) - Rate-limit strategies

Or review the code - it's well-documented!
