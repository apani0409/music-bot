#!/bin/bash

# Installation Verification Script
# Run this to verify your Discord music bot is properly set up

echo "🔍 Discord Music Bot - Installation Verification"
echo "================================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Function to check command
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        ((FAILED++))
        return 1
    fi
}

# Function to check file
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 NOT found"
        ((FAILED++))
        return 1
    fi
}

# Function to check directory
check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/ directory exists"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1/ directory NOT found"
        ((FAILED++))
        return 1
    fi
}

echo "Checking prerequisites..."
echo "------------------------"

# Check Node.js
if check_command node; then
    NODE_VERSION=$(node --version)
    echo "  Version: $NODE_VERSION"
fi

# Check npm
if check_command npm; then
    NPM_VERSION=$(npm --version)
    echo "  Version: $NPM_VERSION"
fi

# Check FFmpeg
if check_command ffmpeg; then
    FFMPEG_VERSION=$(ffmpeg -version 2>&1 | head -n 1)
    echo "  $FFMPEG_VERSION"
fi

echo ""
echo "Checking project structure..."
echo "----------------------------"

# Check source files
check_directory "src"
check_directory "src/commands"
check_directory "src/managers"
check_directory "src/utils"
check_directory "src/types"

# Check configuration files
check_file "package.json"
check_file "tsconfig.json"
check_file ".env.example"
check_file "ecosystem.config.js"

# Check documentation
check_file "README.md"
check_file "QUICK_START.md"
check_file "VPS_DEPLOYMENT.md"
check_file "RATE_LIMIT_GUIDE.md"

echo ""
echo "Checking source code..."
echo "----------------------"

# Check commands
check_file "src/commands/play.ts"
check_file "src/commands/pause.ts"
check_file "src/commands/resume.ts"
check_file "src/commands/skip.ts"
check_file "src/commands/stop.ts"
check_file "src/commands/queue.ts"
check_file "src/commands/leave.ts"

# Check managers
check_file "src/managers/music-player.ts"
check_file "src/managers/queue-manager.ts"

# Check utils
check_file "src/utils/cache.ts"
check_file "src/utils/rate-limit.ts"
check_file "src/utils/spotify-resolver.ts"
check_file "src/utils/youtube-helper.ts"

# Check main files
check_file "src/index.ts"
check_file "src/deploy-commands.ts"
check_file "src/types/index.ts"

echo ""
echo "Checking installation..."
echo "-----------------------"

# Check node_modules
if check_directory "node_modules"; then
    echo "  Dependencies installed"
fi

# Check .env file
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    ((PASSED++))
    
    # Check if configured
    if grep -q "your_discord_bot_token_here" .env 2>/dev/null; then
        echo -e "${YELLOW}⚠${NC}  .env file needs configuration"
        echo "  Edit .env and add your Discord credentials"
    else
        echo "  .env file appears to be configured"
    fi
else
    echo -e "${YELLOW}⚠${NC}  .env file not found"
    echo "  Run: cp .env.example .env"
    echo "  Then edit .env with your credentials"
fi

# Check if built
if check_directory "dist"; then
    echo "  Project has been built"
    
    # Check key compiled files
    if [ -f "dist/index.js" ]; then
        echo -e "${GREEN}✓${NC} Main bot file compiled"
        ((PASSED++))
    fi
else
    echo -e "${YELLOW}⚠${NC}  Project not built yet"
    echo "  Run: npm run build"
fi

echo ""
echo "================================================"
echo "Summary"
echo "-------"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Installation looks good!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure .env file (if not done)"
    echo "2. Run: npm run build"
    echo "3. Run: npm run deploy"
    echo "4. Run: npm start"
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo ""
    echo "Please address the issues above before running the bot."
    echo "See README.md or QUICK_START.md for help."
fi

echo ""
