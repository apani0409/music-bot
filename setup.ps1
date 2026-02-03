# Setup Script for Discord Music Bot
# This script helps automate the initial setup process

Write-Host "Discord Music Bot - Setup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check FFmpeg
Write-Host "Checking FFmpeg installation..." -ForegroundColor Yellow
try {
    $ffmpegVersion = ffmpeg -version 2>&1 | Select-String "ffmpeg version" | Select-Object -First 1
    Write-Host "✓ FFmpeg found" -ForegroundColor Green
} catch {
    Write-Host "✗ FFmpeg not found. Please install FFmpeg:" -ForegroundColor Red
    Write-Host "  - Using Chocolatey: choco install ffmpeg" -ForegroundColor Yellow
    Write-Host "  - Or download from: https://ffmpeg.org/download.html" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Create .env file
Write-Host ""
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Please edit .env file and add your Discord credentials:" -ForegroundColor Cyan
    Write-Host "  - DISCORD_TOKEN=your_bot_token" -ForegroundColor Yellow
    Write-Host "  - DISCORD_CLIENT_ID=your_application_id" -ForegroundColor Yellow
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

# Build project
Write-Host ""
Write-Host "Building TypeScript project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build successful" -ForegroundColor Green

Write-Host ""
Write-Host "Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your Discord credentials" -ForegroundColor Yellow
Write-Host "2. Run: npm run deploy (to register slash commands)" -ForegroundColor Yellow
Write-Host "3. Run: npm start (to start the bot)" -ForegroundColor Yellow
Write-Host ""
