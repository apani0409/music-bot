/**
 * Resume Command - /resume
 */

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { musicPlayer } from '../managers/music-player';
import { queueManager } from '../managers/queue-manager';

export const data = new SlashCommandBuilder()
  .setName('resume')
  .setDescription('Resume the paused track');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    const guildId = interaction.guildId!;

    if (!queueManager.isPaused(guildId)) {
      await interaction.reply('❌ The music is not paused!');
      return;
    }

    const resumed = musicPlayer.resume(guildId);

    if (resumed) {
      await interaction.reply('▶️ Resumed the music.');
    } else {
      await interaction.reply('❌ Failed to resume the music.');
    }
  } catch (error) {
    console.error('[Resume Command] Error:', error);
    await interaction.reply('❌ An error occurred while resuming the music.');
  }
}
