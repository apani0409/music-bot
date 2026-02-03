/**
 * Stop Command - /stop
 */

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { musicPlayer } from '../managers/music-player';
import { queueManager } from '../managers/queue-manager';

export const data = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Stop playback and clear the queue');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    const guildId = interaction.guildId!;

    if (!queueManager.isPlaying(guildId) && queueManager.isEmpty(guildId)) {
      await interaction.reply('❌ Nothing is currently playing!');
      return;
    }

    // Stop playback
    musicPlayer.stop(guildId);

    // Clear queue
    queueManager.clear(guildId);

    await interaction.reply('⏹️ Stopped playback and cleared the queue.');
  } catch (error) {
    console.error('[Stop Command] Error:', error);
    await interaction.reply('❌ An error occurred while stopping playback.');
  }
}
