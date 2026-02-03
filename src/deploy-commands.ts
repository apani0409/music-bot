/**
 * Deploy Commands Script - Register slash commands with Discord
 */

import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  console.error('❌ Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in .env file');
  process.exit(1);
}

interface CommandData {
  data: {
    toJSON: () => unknown;
  };
}

const commands: unknown[] = [];

// Load commands
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = require(filePath) as CommandData;
  
  if ('data' in command) {
    commands.push(command.data.toJSON());
    console.log(`✅ Loaded command: ${file}`);
  }
}

// Deploy commands
const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationCommands(DISCORD_CLIENT_ID),
      { body: commands }
    ) as unknown[];

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
    process.exit(1);
  }
})();
