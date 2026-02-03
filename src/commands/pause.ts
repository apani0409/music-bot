/**
 * Pause Command - /pause
 */

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { musicPlayer } from '../managers/music-player';
import { queueManager } from '../managers/queue-manager';

export const data = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Pause the current track');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    const guildId = interaction.guildId!;

    if (!queueManager.isPlaying(guildId)) {
      await interaction.reply('❌ Nothing is currently playing!');
      return;
    }

    if (queueManager.isPaused(guildId)) {
      await interaction.reply('⏸️ The music is already paused!');
      return;
    }

    const paused = musicPlayer.pause(guildId);

    if (paused) {
      await interaction.reply('⏸️ Paused the music.');
    } else {
      await interaction.reply('❌ Failed to pause the music.');
    }
  } catch (error) {
    console.error('[Pause Command] Error:', error);
    await interaction.reply('❌ An error occurred while pausing the music.');
  }
}
