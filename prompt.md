Act as a senior software engineer specialized in Discord music bots, large-scale streaming optimization, and YouTube rate-limit mitigation.

I want to build a free Discord music bot for personal use in my own server, fully compatible with Windows and Ubuntu, and suitable for 24/7 VPS deployment.

🧰 Technical Stack

Language: TypeScript (Node.js 18+)

Libraries:

discord.js@14

@discordjs/voice

play-dl

dotenv

Uses Slash Commands

Requires FFmpeg

🎵 Core Features

Implement the following commands:

/play <url | search>

Supports:

YouTube links

Spotify links (track, playlist, album)

Spotify links must be resolved using metadata → YouTube search

The bot automatically joins the user’s voice channel

Maintain a per-guild music queue

Additional commands

/pause

/resume

/skip

/stop

/queue

/leave

🚦 YouTube Rate-Limit & Stability (MANDATORY)

Explicitly implement all of the following:

1. Aggressive Request Reduction

Cache YouTube search results in memory

Do not repeat searches for tracks already queued

Resolve Spotify metadata only once per track

2. Stream Optimization

Prefer opus streams when available

Avoid unnecessary metadata requests

Do not download thumbnails or extra assets

3. Concurrency Control

Only one active audio stream per guild

Implement per-guild locks to prevent concurrent /play calls

4. Rate-Limit Handling

Detect HTTP 429 responses

Implement retry logic with exponential backoff

Automatic fallback search strategy on failure

5. Safe play-dl Usage

Use only stable APIs

Avoid experimental or undocumented scraping methods

🧱 Project Architecture

Organize the code into clean, production-ready modules:

Commands

Music Player

Queue Manager

Cache Layer

Spotify → YouTube Resolver

Rate-limit & Retry Utilities

🔁 Post-Generation Tasks (REQUIRED)

After generating the initial solution:

Review and refactor the generated code

Improve maintainability and performance

Remove redundant YouTube calls

Optimize for 24/7 VPS usage

Handle disconnects and reconnects

Prevent memory leaks

Gracefully recover from crashes

Further minimize YouTube requests

Strengthen caching strategies

Reuse resolved track data across sessions

Migrate and finalize as professional TypeScript

Strong typing everywhere

No any

Proper interfaces and types

Clean async/await patterns

📦 Deliverables

Generate:

Complete folder structure

Fully functional TypeScript code

Example .env file

Step-by-step setup instructions:

Discord Developer Portal

Dependency installation

Running on Windows

Running on Ubuntu

Running 24/7 on a VPS

Final best practices to avoid YouTube rate-limits

⚠️ Legal Notice

Include a short disclaimer stating the bot is for personal use only and respects Discord’s Terms of Service.

Produce a stable, efficient, production-grade Discord music bot, optimized to avoid YouTube rate-limits and run continuously.

Perform a second refactor pass focused on long-term VPS stability, stricter rate-limit protection, and memory optimization.