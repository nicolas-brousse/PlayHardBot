const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');

const token = process.env.DISCORD_TOKEN
const clientId = process.env.DISCORD_CLIENT_ID
const guildId = process.env.DISCORD_GUILD_ID

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

// Load commands
client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command)
    console.log(`[INFO] The command '${command.data.name}' at ${filePath} has been successfully loaded.`);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Register / commands
const rest = new REST().setToken(token)

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: client.commands.map(command => command.data.toJSON()) })
  .then((data) => console.info(`Successfully reloaded ${data.length} application (/) commands.`))
  .catch(console.error);

// Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(token)
