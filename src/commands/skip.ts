/**
 * Skip Command - /skip
 */

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { musicPlayer } from '../managers/music-player';
import { queueManager } from '../managers/queue-manager';

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Skip the current track');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    const guildId = interaction.guildId!;

    if (!queueManager.isPlaying(guildId)) {
      await interaction.reply('❌ Nothing is currently playing!');
      return;
    }

    const currentTrack = queueManager.getCurrentTrack(guildId);
    
    // Stop current playback (will trigger playNext automatically)
    musicPlayer.stop(guildId);

    await interaction.reply(`⏭️ Skipped: **${currentTrack?.title || 'Unknown'}**`);
  } catch (error) {
    console.error('[Skip Command] Error:', error);
    await interaction.reply('❌ An error occurred while skipping the track.');
  }
}
