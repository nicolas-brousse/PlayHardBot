import { SlashCommandBuilder } from 'discord.js'

export const command = {
  definition: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!'),
  execute: async (interaction) => {
    await interaction.reply({ content: `Pong ${interaction.user.tag}!`, ephemeral: true })
  },
}
