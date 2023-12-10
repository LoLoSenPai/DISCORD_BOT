const { Events, Client } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: false,

    /**
     *
     * @param {Client} client
     */

    execute: (client) => {
        console.log(`Bot connected as ${client.user.username}!`);
    }
}