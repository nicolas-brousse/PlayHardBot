import { Events } from 'discord.js'
import { logger } from '../lib/logger.js'

export const event = {
  name: Events.ClientReady,
  once: true,
  execute: (client) => {
    logger.info(`Ready! Logged in as ${client.user.tag}`)
  },
}
