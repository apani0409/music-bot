/**
 * Queue Command - /queue
 */

import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { queueManager } from '../managers/queue-manager';

export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('Show the current music queue');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    const guildId = interaction.guildId!;

    const queue = queueManager.getQueue(guildId);

    if (!queue || (!queue.currentTrack && queue.tracks.length === 0)) {
      await interaction.reply('📭 The queue is empty!');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('🎵 Music Queue')
      .setTimestamp();

    // Current track
    if (queue.currentTrack) {
      const status = queue.isPaused ? '⏸️ Paused' : '▶️ Playing';
      embed.addFields({
        name: `${status} Now`,
        value: `**${queue.currentTrack.title}**\nRequested by: ${queue.currentTrack.requestedBy}`,
        inline: false,
      });
    }

    // Upcoming tracks
    if (queue.tracks.length > 0) {
      const upcomingTracks = queue.tracks
        .slice(0, 10)
        .map((track, index) => `${index + 1}. **${track.title}** - ${track.requestedBy}`)
        .join('\n');

      embed.addFields({
        name: `📋 Up Next (${queue.tracks.length} tracks)`,
        value: upcomingTracks + (queue.tracks.length > 10 ? '\n*...and more*' : ''),
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error('[Queue Command] Error:', error);
    await interaction.reply('❌ An error occurred while fetching the queue.');
  }
}
