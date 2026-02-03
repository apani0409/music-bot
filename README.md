# Discord Music Bot

A production-grade Discord music bot with advanced YouTube rate-limit mitigation, built with TypeScript, discord.js v14, and optimized for 24/7 VPS deployment.

## ⚠️ Legal Disclaimer

This bot is intended for **personal use only** in your own Discord server. By using this bot, you agree to comply with:
- [Discord Terms of Service](https://discord.com/terms)
- [YouTube Terms of Service](https://www.youtube.com/t/terms)
- [Spotify Terms of Service](https://www.spotify.com/legal/end-user-agreement/)

The developers are not responsible for any misuse of this software.

## 🎵 Features

- **Multi-Source Support**: YouTube URLs, Spotify tracks/playlists/albums, and YouTube search
- **Slash Commands**: Modern Discord slash command interface
- **Advanced Queue System**: Per-guild music queues with full playback control
- **Rate-Limit Mitigation**:
  - Aggressive caching of search results
  - Exponential backoff retry logic
  - Concurrency control per guild
  - Optimized streaming (Opus format when available)
- **Production Ready**: Error handling, graceful shutdown, memory optimization

## 📋 Commands

| Command | Description |
|---------|-------------|
| `/play <url\|search>` | Play music from YouTube or Spotify |
| `/pause` | Pause the current track |
| `/resume` | Resume playback |
| `/skip` | Skip to the next track |
| `/stop` | Stop playback and clear queue |
| `/queue` | Show the current queue |
| `/leave` | Disconnect from voice channel |

## 🔧 Prerequisites

- **Node.js**: Version 18 or higher
- **FFmpeg**: Required for audio processing
- **Discord Bot Token**: From Discord Developer Portal

### Installing FFmpeg

**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

## 🚀 Setup Instructions

### Quick Setup

**Automated Setup (Recommended):**

```bash
# Linux/Ubuntu
./setup.sh

# Windows (PowerShell)
.\setup.ps1
```

See [QUICK_START.md](QUICK_START.md) for the 5-minute setup guide.

### Manual Setup

### 1. Discord Developer Portal Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab:
   - Click "Add Bot"
   - Enable "Message Content Intent" (if needed)
   - Enable "Server Members Intent" (if needed)
   - Copy the bot token
4. Go to the "OAuth2" > "General" tab:
   - Copy the "Application ID"
5. Go to "OAuth2" > "URL Generator":
   - Select scopes: `bot`, `applications.commands`
   - Select bot permissions: `Connect`, `Speak`, `Use Voice Activity`
   - Copy the generated URL and invite the bot to your server

### 2. Project Setup

**Clone or download this repository:**

```bash
cd /path/to/music-bot
```

**Install dependencies:**

```bash
npm install
```

**Create environment file:**

```bash
cp .env.example .env
```

**Edit `.env` file:**

```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id_here
```

**Build the project:**

```bash
npm run build
```

**Deploy slash commands:**

```bash
npm run deploy
```

### 3. Running the Bot

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

## 🖥️ VPS Deployment (24/7)

### Using PM2 (Recommended)

**Install PM2:**

```bash
npm install -g pm2
```

**Start the bot:**

```bash
pm2 start dist/index.js --name discord-music-bot
```

**Save PM2 configuration:**

```bash
pm2 save
pm2 startup
```

**Monitor the bot:**

```bash
pm2 logs discord-music-bot
pm2 status
```

**Restart the bot:**

```bash
pm2 restart discord-music-bot
```

### Using systemd (Ubuntu/Linux)

**Create service file:**

```bash
sudo nano /etc/systemd/system/discord-music-bot.service
```

**Add the following content:**

```ini
[Unit]
Description=Discord Music Bot
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/music-bot
ExecStart=/usr/bin/node /path/to/music-bot/dist/index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=discord-music-bot
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**Enable and start service:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable discord-music-bot
sudo systemctl start discord-music-bot
sudo systemctl status discord-music-bot
```

**View logs:**

```bash
sudo journalctl -u discord-music-bot -f
```

## 🛡️ Rate-Limit Mitigation Strategies

This bot implements several strategies to avoid YouTube rate limits:

### 1. **Aggressive Caching**
- Search results cached in memory (1 hour TTL)
- Spotify metadata cached to avoid repeated resolutions
- Maximum cache size: 1000 entries with LRU eviction

### 2. **Request Reduction**
- No repeated searches for queued tracks
- Spotify resolution occurs only once per track
- Thumbnails and extra metadata are not fetched

### 3. **Retry Logic**
- Exponential backoff (1s → 2s → 4s)
- Maximum 3 retry attempts
- HTTP 429 detection and handling

### 4. **Concurrency Control**
- Per-guild locks prevent concurrent `/play` commands
- Only one active stream per guild

### 5. **Stream Optimization**
- Opus format preferred when available
- `discordPlayerCompatibility` enabled
- Inline volume control

## 📁 Project Structure

```
music-bot/
├── src/
│   ├── commands/          # Slash commands
│   │   ├── play.ts
│   │   ├── pause.ts
│   │   ├── resume.ts
│   │   ├── skip.ts
│   │   ├── stop.ts
│   │   ├── queue.ts
│   │   └── leave.ts
│   ├── managers/          # Core managers
│   │   ├── music-player.ts
│   │   └── queue-manager.ts
│   ├── utils/             # Utility modules
│   │   ├── cache.ts
│   │   ├── rate-limit.ts
│   │   ├── spotify-resolver.ts
│   │   ├── youtube-helper.ts
│   │   ├── logger.ts
│   │   └── health-monitor.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── index.ts           # Main bot file
│   └── deploy-commands.ts # Command deployment
├── dist/                  # Compiled JavaScript (generated)
├── .env                   # Environment variables (create from .env.example)
├── .env.example           # Environment template
├── setup.sh               # Linux setup script
├── setup.ps1              # Windows setup script
├── ecosystem.config.js    # PM2 configuration
├── package.json
├── tsconfig.json
├── LICENSE
├── README.md
├── QUICK_START.md         # 5-minute setup guide
├── VPS_DEPLOYMENT.md      # Production deployment guide
├── RATE_LIMIT_GUIDE.md    # Rate-limit optimization
├── FAQ.md                 # Frequently asked questions
├── CHANGELOG.md           # Version history
└── PROJECT_SUMMARY.md     # Complete project overview
```

## 🔍 Troubleshooting

### Bot doesn't respond to commands

1. Ensure commands are deployed: `npm run deploy`
2. Check bot has proper permissions in Discord server
3. Verify bot token is correct in `.env`

### "You need to be in a voice channel" error

- Join a voice channel before using `/play`

### FFmpeg errors

- Verify FFmpeg is installed: `ffmpeg -version`
- Ensure FFmpeg is in system PATH

### Rate limit errors

- The bot will automatically retry with exponential backoff
- If persistent, wait a few minutes before trying again
- Consider using different search queries

### Memory issues on VPS

- Monitor with: `pm2 monit`
- Adjust cache size in `src/utils/cache.ts` (reduce `maxCacheSize`)
- Ensure VPS has at least 512MB RAM

## 🛠️ Development

**Watch mode (auto-recompile):**

```bash
npm run watch
```

**Run with ts-node:**

```bash
npm run dev
```

## 📊 Performance Optimization Tips

1. **Memory Management**:
   - Cache is limited to 1000 entries
   - Old entries automatically evicted (LRU)
   - Connections cleaned up on disconnect

2. **Network Efficiency**:
   - Reuse cached search results
   - Batch playlist operations with delays
   - Prefer Opus streams (less bandwidth)

3. **Error Recovery**:
   - Automatic reconnection on voice disconnect
   - Graceful handling of stream errors
   - Queue preservation on temporary failures

## 📝 Best Practices for 24/7 Operation

1. **Use a process manager** (PM2 or systemd)
2. **Monitor logs regularly**
3. **Keep Node.js and dependencies updated**
4. **Set up automatic restarts** on crashes
5. **Use a VPS with sufficient resources** (1GB RAM minimum recommended)
6. **Implement log rotation** to prevent disk space issues
7. **Set up monitoring/alerting** for downtime

See [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) for complete deployment guide.

## 📚 Additional Documentation

- [QUICK_START.md](QUICK_START.md) - Get up and running in 5 minutes
- [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) - Production deployment guide
- [RATE_LIMIT_GUIDE.md](RATE_LIMIT_GUIDE.md) - Comprehensive rate-limit strategies
- [FAQ.md](FAQ.md) - Frequently asked questions
- [CHANGELOG.md](CHANGELOG.md) - Version history and features
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Complete project overview

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome.

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for personal Discord servers**
