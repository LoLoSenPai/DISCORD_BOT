const { Events, Client, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: false,

    /**
     *
     * @param {Client} client
     */

    execute: (client) => {
        client.user.setPresence({
            afk: false,
            activities: [
                {
                    name: 'Grinding as a MFER',
                    type: ActivityType.Custom
                }
            ],
            status: 'dnd'
        });
    }
}