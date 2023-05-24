import { Events } from 'discord.js'
import { logger } from '../lib/logger.js'

export const event = {
  name: Events.InteractionCreate,
  execute: async (interaction) => {
    if (!interaction.isChatInputCommand()) return

    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
      logger.warn(`No command matching ${interaction.commandName} was found.`)
      return
    }

    try {
      await command.execute(interaction)
    } catch (error) {
      logger.error(`Error executing ${interaction.commandName}`)
      logger.error(error)
    }
  },
}
