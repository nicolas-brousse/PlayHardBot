import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import PterodactylClient from '../lib/pterodactylClient.js'

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

  // PermissionFlagsBits.

async function getServerByName(serverName) {
  const servers = await pterodactylClient.getServerList()

  return servers.find(server => server.name === serverName)
}

export const command = {
  definition,
  execute: async (interaction) => {
    // interaction.user is the object representing the User who ran the command
    // interaction.member is the GuildMember object, which represents the user in the specific guild

    if (interaction.options.getSubcommand() === 'list') {
      await interaction.deferReply({ ephemeral: true })

      console.info(`${interaction.user.tag} ask servers list`)

      const servers = await pterodactylClient.getServerList()
      // const embed = new EmbedBuilder().setDescription(`**Available servers are**: ${servers.map(server => `\`${server.name}\``).join(', ')}`)

      // await interaction.reply({ embeds: [embed], ephemeral: true })
      await interaction.editReply({
        content: `**Available servers are**: ${servers.map(server => `\`${server.name}\``).join(', ')}`,
        ephemeral: true,
      })
    } else if (interaction.options.getSubcommand() === 'status') {
      await interaction.deferReply({ ephemeral: true })

      const serverName = interaction.options.getString('servername')
      const server = await getServerByName(serverName)

      console.info(`${interaction.user.tag} ask status for server with name ${serverName}`)

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
    } else if (interaction.options.getSubcommand() === 'power') {
      await interaction.deferReply({ ephemeral: true })

      const serverName = interaction.options.getString('servername')
      const signal = interaction.options.getString('signal')
      const server = await getServerByName(interaction.options.getString('servername'))

      console.info(`${interaction.user.tag} ask to ${signal} server with name ${serverName}`)

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
