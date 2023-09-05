import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import PterodactylClient from '../lib/pterodactylClient.js'
import { logger } from '../lib/logger.js'

const pterodactylClient = new PterodactylClient(
  process.env.PTERODACTYL_API_BASE_URL,
  process.env.PTERODACTYL_API_TOKEN
)

// See: https://discordjs.guide/slash-commands/response-methods.html#editing-responses
// See: https://discordjs.guide/creating-your-bot/command-handling.html#loading-command-files
// See: https://v13.discordjs.guide/interactions/autocomplete.html#enabling-autocomplete
// See: https://github.com/discordjs/guide/blob/c52609bcc286bfd62a2ca894624c5c6961ce2364/guide/slash-commands/advanced-creation.md
const definition = new SlashCommandBuilder()
  .setName('gameservers')
  .setDescription('Manage game servers!')
  .addSubcommand(subcommand => 
    subcommand
      .setName('list')
      .setDescription('List game servers')
  )
  .addSubcommand(subcommand => 
    subcommand
      .setName('status')
      .setDescription('Get game server status')
      .addStringOption(option =>
        option
          .setName('servername')
          .setDescription('The server name')
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  .addSubcommand(subcommand => 
    subcommand
      .setName('power')
      .setDescription('Change game server power state')
      .addStringOption(option =>
        option
          .setName('servername')
          .setDescription('The server name')
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(option =>
        option
          .setName('signal')
          .setDescription('Start or Stop')
          .setRequired(true)
          .addChoices(
            { name: 'start', value: 'start' },
            { name: 'stop', value: 'stop' },
          )
      )
  )

async function getServerByName(serverName) {
  const servers = await pterodactylClient.getServerList()

  return servers.find(server => server.name === serverName)
}

export const command = {
  definition,
  autocomplete: async (interaction) => {
    const focusedValue = interaction.options.getFocused()
    const servers = await pterodactylClient.getServerList()
    const choices = servers.map(server => server.name)
    const filtered = choices.filter(choice => choice.startsWith(focusedValue))
    
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })),
    )
  },
  execute: async (interaction) => {
    // interaction.user is the object representing the User who ran the command
    // interaction.member is the GuildMember object, which represents the user in the specific guild

    //
    // List
    //
    if (interaction.options.getSubcommand() === 'list') {
      await interaction.deferReply({ ephemeral: true })

      logger.info(`${interaction.user.tag} ask servers list`)

      const servers = await pterodactylClient.getServerList()
      const serversInfos = servers.map(server => {
        if (server.allocations) {
          return `- **${server.name}**: \`${server.allocations?.at(0)?.getHost()}\``
        }

        return `- **${server.name}**`
      })

      const embed = new EmbedBuilder().setDescription(
        `## Available servers are:\n${serversInfos.join('\n')}`
      )

      await interaction.editReply({ embeds: [embed], ephemeral: true })


    //
    // Status
    //
    } else if (interaction.options.getSubcommand() === 'status') {
      await interaction.deferReply({ ephemeral: true })

      const serverName = interaction.options.getString('servername')
      const server = await getServerByName(serverName)

      logger.info(`${interaction.user.tag} ask status for server with name ${serverName}`)

      if (!server) {
        await interaction.editReply({
          content: `Wrong server name`,
          ephemeral: true,
        })
        return
      }

      const stats = await pterodactylClient.getServerResources(server.identifier)

      await interaction.editReply({
        content: `Server **${server.name}** is **${stats.currentState}**`,
        ephemeral: true,
      })


    //
    // Power
    //
    } else if (interaction.options.getSubcommand() === 'power') {
      await interaction.deferReply({ ephemeral: true })

      const serverName = interaction.options.getString('servername')
      const signal = interaction.options.getString('signal')
      const server = await getServerByName(interaction.options.getString('servername'))

      logger.info(`${interaction.user.tag} ask to ${signal} server with name ${serverName}`)

      if (!server) {
        await interaction.editReply({
          content: `Wrong server name`,
          ephemeral: true,
        })
        return
      }

      const result = await pterodactylClient.updateServerPower(
        server.identifier, signal,
      )
      const message = result ? `Server **${server.name}** *${signal}* signal sent` : `Something went wrong`


      await interaction.editReply({
        content: message,
        ephemeral: true,
      })
    }
  },
}
