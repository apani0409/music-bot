#!/bin/bash

# Setup Script for Discord Music Bot (Ubuntu/Linux)
# This script helps automate the initial setup process

echo "Discord Music Bot - Setup Script"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js found: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    echo -e "${YELLOW}  Ubuntu: sudo apt install nodejs npm${NC}"
    exit 1
fi

# Check FFmpeg
echo -e "${YELLOW}Checking FFmpeg installation...${NC}"
if command -v ffmpeg &> /dev/null; then
    echo -e "${GREEN}✓ FFmpeg found${NC}"
else
    echo -e "${RED}✗ FFmpeg not found${NC}"
    echo -e "${YELLOW}Installing FFmpeg...${NC}"
    sudo apt update
    sudo apt install -y ffmpeg
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ FFmpeg installed${NC}"
    else
        echo -e "${RED}✗ Failed to install FFmpeg${NC}"
        exit 1
    fi
fi

# Install dependencies
echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

# Create .env file
echo ""
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo ""
    echo -e "${CYAN}IMPORTANT: Please edit .env file and add your Discord credentials:${NC}"
    echo -e "${YELLOW}  - DISCORD_TOKEN=your_bot_token${NC}"
    echo -e "${YELLOW}  - DISCORD_CLIENT_ID=your_application_id${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Build project
echo ""
echo -e "${YELLOW}Building TypeScript project...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Setup completed!${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "${YELLOW}1. Edit .env file with your Discord credentials${NC}"
echo -e "${YELLOW}2. Run: npm run deploy (to register slash commands)${NC}"
echo -e "${YELLOW}3. Run: npm start (to start the bot)${NC}"
echo ""
