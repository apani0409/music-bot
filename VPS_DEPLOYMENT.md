# VPS Deployment Guide

## Quick VPS Setup (Ubuntu 20.04+)

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg
sudo apt install -y ffmpeg

# Install PM2 globally
sudo npm install -g pm2

# Install build essentials (required for some dependencies)
sudo apt install -y build-essential
```

### 2. Deploy the Bot

```bash
# Clone or upload your bot files to the server
cd /home/your_username
git clone <your-repo> discord-music-bot
# OR upload files via SCP/SFTP

cd discord-music-bot

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env  # Add your Discord credentials

# Build the project
npm run build

# Deploy commands
npm run deploy
```

### 3. Start with PM2

```bash
# Start the bot
pm2 start dist/index.js --name discord-music-bot

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command output instructions

# Monitor the bot
pm2 logs discord-music-bot
pm2 monit
```

### 4. PM2 Management Commands

```bash
# View status
pm2 status

# View logs
pm2 logs discord-music-bot

# Restart bot
pm2 restart discord-music-bot

# Stop bot
pm2 stop discord-music-bot

# Delete from PM2
pm2 delete discord-music-bot

# Monitor resources
pm2 monit
```

## Advanced Configuration

### Memory Limits

If running on a low-memory VPS (512MB - 1GB):

```bash
# Start with memory limit
pm2 start dist/index.js --name discord-music-bot --max-memory-restart 400M
```

Edit cache configuration in `src/utils/cache.ts`:
```typescript
// Reduce cache size for low-memory environments
constructor(cacheTTL: number = 3600000, maxCacheSize: number = 500)
```

### Log Rotation

Configure PM2 log rotation:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Auto-restart on Crashes

PM2 automatically restarts on crashes, but you can configure:

```bash
# Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'discord-music-bot',
    script: './dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Start using ecosystem file
pm2 start ecosystem.config.js
pm2 save
```

### Firewall Configuration

```bash
# Allow SSH (if not already configured)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Security Best Practices

1. **Use a non-root user**:
```bash
# Create a dedicated user
sudo adduser botuser
sudo usermod -aG sudo botuser
su - botuser
```

2. **Secure SSH**:
```bash
# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd
```

3. **Keep system updated**:
```bash
# Setup automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### Monitoring and Alerts

**Install monitoring tools**:

```bash
# Install htop for resource monitoring
sudo apt install htop

# Monitor in real-time
htop
```

**Check bot health**:

```bash
# View PM2 metrics
pm2 show discord-music-bot

# Monitor logs for errors
pm2 logs discord-music-bot --err

# Check resource usage
pm2 monit
```

## Troubleshooting

### High Memory Usage

```bash
# Restart the bot
pm2 restart discord-music-bot

# Check memory usage
pm2 show discord-music-bot

# If persistent, reduce cache size in code
```

### Bot Not Responding

```bash
# Check if bot is running
pm2 status

# View recent logs
pm2 logs discord-music-bot --lines 100

# Restart the bot
pm2 restart discord-music-bot

# Check Discord API status
# https://discordstatus.com
```

### FFmpeg Errors

```bash
# Verify FFmpeg installation
ffmpeg -version

# Reinstall if needed
sudo apt remove ffmpeg
sudo apt install ffmpeg
```

### Rate Limit Issues

If you're hitting YouTube rate limits frequently:

1. Increase cache TTL in `src/utils/cache.ts`
2. Reduce simultaneous requests
3. Consider implementing request queuing
4. Use the bot less frequently or in fewer servers

## Backup and Recovery

### Backup Configuration

```bash
# Backup .env file
cp .env .env.backup

# Create a backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/botuser/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/bot_backup_$DATE.tar.gz \
    --exclude=node_modules \
    --exclude=dist \
    /home/botuser/discord-music-bot
EOF

chmod +x backup.sh
```

### Restore from Backup

```bash
# Extract backup
tar -xzf bot_backup_20260203_120000.tar.gz

# Reinstall dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart discord-music-bot
```

## Performance Optimization

### 1. Enable Node.js Garbage Collection Logging

```bash
pm2 start dist/index.js --name discord-music-bot --node-args="--expose-gc"
```

### 2. Use Node.js LTS Version

Always use the latest LTS version of Node.js for best performance and security.

### 3. Monitor Resource Usage

Set up alerts for high resource usage:

```bash
# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash
THRESHOLD=80
MEMORY_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
if (( $(echo "$MEMORY_USAGE > $THRESHOLD" | bc -l) )); then
    echo "High memory usage: $MEMORY_USAGE%"
    pm2 restart discord-music-bot
fi
EOF

chmod +x monitor.sh

# Add to crontab (run every 30 minutes)
crontab -e
# Add: */30 * * * * /home/botuser/discord-music-bot/monitor.sh
```

## Cost-Effective VPS Providers

Recommended providers for running a Discord music bot:

1. **DigitalOcean** - $4-6/month (512MB-1GB RAM)
2. **Linode** - $5/month (1GB RAM)
3. **Vultr** - $3.50-6/month (512MB-1GB RAM)
4. **Hetzner** - €4-5/month (1GB-2GB RAM)

**Minimum recommended specs**: 512MB RAM, 1 CPU core, 10GB storage

---

Your bot is now running 24/7 on a VPS! 🚀
