/**
 * Leave Command - /leave
 */

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { musicPlayer } from '../managers/music-player';
import { queueManager } from '../managers/queue-manager';

export const data = new SlashCommandBuilder()
  .setName('leave')
  .setDescription('Leave the voice channel');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    const guildId = interaction.guildId!;

    const connection = musicPlayer.getConnection(guildId);

    if (!connection) {
      await interaction.reply('❌ I am not in a voice channel!');
      return;
    }

    // Leave and cleanup
    musicPlayer.leave(guildId);
    queueManager.deleteQueue(guildId);

    await interaction.reply('👋 Left the voice channel and cleared the queue.');
  } catch (error) {
    console.error('[Leave Command] Error:', error);
    await interaction.reply('❌ An error occurred while leaving the voice channel.');
  }
}
