import fs from 'node:fs/promises'
import path from 'node:path'
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js'
import { logger } from './lib/logger.js'

const token = process.env.DISCORD_TOKEN
const clientId = process.env.DISCORD_CLIENT_ID
const guildId = process.env.DISCORD_GUILD_ID

const __dirname = path.resolve(path.dirname(''))

async function run() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] })

  // Load commands
  client.commands = new Collection()
  const commandsPath = path.join(__dirname, 'commands')
  const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.js'))

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const { command } = await import(filePath)

    if ('definition' in command && 'execute' in command) {
      client.commands.set(command.definition.name, command)
      logger.info(`The command '${command.definition.name}' at ${filePath} has been successfully loaded.`)
    } else {
      logger.warn(`The command at ${filePath} is missing a required "definition" or "execute" property.`)
    }
  }

  // Register / commands
  const rest = new REST().setToken(token)

  try {
    const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: client.commands.map(command => command.definition.toJSON())
    })
    logger.info(`Successfully reloaded ${data.length} application (/) commands.`)
  } catch (error) {
    logger.error(error)
  }

  // Events
  const eventsPath = path.join(__dirname, 'events')
  const eventFiles = (await fs.readdir(eventsPath)).filter(file => file.endsWith('.js'))

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file)
    const { event } = await import(filePath)

    if (event.once) {
      client.once(event.name, event.execute)
    } else {
      client.on(event.name, event.execute)
    }
  }

  client.login(token)
}

run()
