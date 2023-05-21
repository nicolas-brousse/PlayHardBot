const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const PterodactylClient = require('../lib/pterodactylClient.js')

const pterodactylClient = new PterodactylClient(process.env.PTERODACTYL_API_BASE_URL, process.env.PTERODACTYL_API_TOKEN)


// See: https://discordjs.guide/slash-commands/response-methods.html#editing-responses
// See: https://discordjs.guide/creating-your-bot/command-handling.html#loading-command-files
// See: https://v13.discordjs.guide/interactions/autocomplete.html#enabling-autocomplete
// See: https://github.com/discordjs/guide/blob/c52609bcc286bfd62a2ca894624c5c6961ce2364/guide/slash-commands/advanced-creation.md
module.exports = {
  data: new SlashCommandBuilder()
    .setName('gameservers')
    .setDescription('Return information of gaming servers!'),
  async execute(interaction) {
    // interaction.user is the object representing the User who ran the command
    // interaction.member is the GuildMember object, which represents the user in the specific guild

    const servers = await pterodactylClient.getServerList()
    // const embed = new EmbedBuilder().setDescription(`**Available servers are**: ${servers.map(server => `\`${server.name}\``).join(', ')}`)

    // await interaction.reply({ embeds: [embed], ephemeral: true })
    await interaction.reply({ content: `**Available servers are**: ${servers.map(server => `\`${server.name}\``).join(', ')}`, ephemeral: true })
  },
}
