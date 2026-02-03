# Quick Start Guide

Get your Discord music bot running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] FFmpeg installed
- [ ] Discord bot token ready
- [ ] Discord application ID ready

## Step-by-Step Setup

### 1. Install Dependencies (2 minutes)

```bash
# Navigate to project directory
cd discord-music-bot

# Install all dependencies
npm install
```

### 2. Configure Environment (1 minute)

```bash
# Create .env file from example
cp .env.example .env

# Edit .env and add your credentials
nano .env  # or use your preferred editor
```

Add these values:
```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id_here
```

### 3. Build and Deploy (1 minute)

```bash
# Compile TypeScript to JavaScript
npm run build

# Register slash commands with Discord
npm run deploy
```

### 4. Start the Bot (30 seconds)

```bash
# Start in production mode
npm start

# OR for development with auto-reload
npm run dev
```

### 5. Test the Bot (30 seconds)

In your Discord server:

```
/play never gonna give you up
```

If you hear music, you're done! 🎉

## Getting Your Discord Credentials

### Bot Token

1. Go to https://discord.com/developers/applications
2. Click your application (or create new)
3. Go to "Bot" tab
4. Click "Reset Token" or "Copy" if visible
5. Paste into `.env` as `DISCORD_TOKEN`

### Application ID

1. Same page, go to "General Information"
2. Copy "Application ID"
3. Paste into `.env` as `DISCORD_CLIENT_ID`

### Invite Bot to Server

1. Go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`, `applications.commands`
3. Select permissions:
   - ✅ Connect
   - ✅ Speak
   - ✅ Use Voice Activity
4. Copy generated URL
5. Open URL in browser and invite to your server

## Verify Installation

Run these commands to verify everything is installed:

```bash
# Check Node.js
node --version
# Should show v18.x.x or higher

# Check npm
npm --version

# Check FFmpeg
ffmpeg -version
# Should show FFmpeg version info

# Check if build succeeded
ls dist/
# Should show compiled JavaScript files
```

## Common First-Time Issues

### "Module not found" errors

```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "FFmpeg not found"

```bash
# Windows (with Chocolatey)
choco install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

### Bot doesn't respond to commands

1. Make sure you ran `npm run deploy`
2. Wait 1-2 minutes for Discord to register commands
3. Check bot has permissions in the server
4. Verify bot is online (green status)

### "Unknown interaction" error

- You didn't run `npm run deploy`
- Run it and wait a few minutes

## Next Steps

Once your bot is running:

1. ✅ Test all commands (`/play`, `/pause`, `/queue`, etc.)
2. ✅ Read [README.md](README.md) for full documentation
3. ✅ For 24/7 hosting, see [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md)
4. ✅ For rate-limit optimization, see [RATE_LIMIT_GUIDE.md](RATE_LIMIT_GUIDE.md)

## Quick Command Reference

```bash
# Development
npm run dev          # Run with auto-reload
npm run watch        # Watch TypeScript files

# Production
npm run build        # Compile TypeScript
npm start            # Start bot
npm run deploy       # Deploy slash commands

# PM2 (for VPS)
pm2 start ecosystem.config.js
pm2 logs discord-music-bot
pm2 restart discord-music-bot
```

## Getting Help

If you encounter issues:

1. Check the logs for error messages
2. Verify all prerequisites are installed
3. Make sure `.env` file is configured correctly
4. Check Discord bot permissions
5. Review [README.md](README.md) troubleshooting section

---

**You're all set! Enjoy your music bot! 🎵**
