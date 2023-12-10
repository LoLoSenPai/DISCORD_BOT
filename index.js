const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./Client/config.json');
const fs = require('fs');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
});

client.commands = new Collection();
client.buttons = new Collection();
client.selects = new Collection();
client.modals = new Collection();
client.slashArray = [];

client.login(token);

fs.readdirSync('./Client/Handlers').forEach(handler => {
	try {
		require(`./Client/Handlers/${handler}`)(client, fs);
	} catch (error) {
		console.error(`Error loading handler ${handler}:`, error);
	}
});

client.function = {
	registerGuild: require('./Client/Functions/registerGuild.js'),
};