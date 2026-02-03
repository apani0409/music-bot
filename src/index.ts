/**
 * Main Bot File - Discord Music Bot Entry Point
 */

import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { join } from 'path';
import { logger } from './utils/logger';
import { healthMonitor } from './utils/health-monitor';

// Load environment variables
config();

// Validate environment variables
const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  console.error('❌ Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in .env file');
  process.exit(1);
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// Command collection
interface CommandModule {
  data: {
    name: string;
    toJSON: () => unknown;
  };
  execute: (...args: any[]) => Promise<void>;
}

const commands = new Collection<string, CommandModule>();

// Load commands
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = require(filePath) as CommandModule;
  
  if ('data' in command && 'execute' in command) {
    commands.set(command.data.name, command);
    console.log(`✅ Loaded command: ${command.data.name}`);
  } else {
    console.warn(`⚠️ Command at ${filePath} is missing required "data" or "execute" property`);
  }
}

// Ready event
client.once('ready', () => {
  logger.info(`Bot is ready! Logged in as ${client.user?.tag}`);
  logger.info(`Serving ${client.guilds.cache.size} guilds`);
  logger.info(healthMonitor.getHealthStatus());
  
  // Log health status every hour
  setInterval(() => {
    logger.info(healthMonitor.getHealthStatus());
  }, 3600000);
});

// Interaction handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) {
    console.error(`❌ Command not found: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error executing command ${interaction.commandName}:`, error);
    
    const errorMessage = '❌ There was an error executing this command!';
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

// Error handlers
client.on('error', (error) => {
  logger.error('Discord client error:', error);
  healthMonitor.recordError(error);
});

process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled promise rejection:', error);
  healthMonitor.recordError(error);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception:', error);
  healthMonitor.recordError(error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

// Login to Discord
client.login(DISCORD_TOKEN);
