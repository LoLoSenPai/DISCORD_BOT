const { Events, Client, StringSelectMenuInteraction } = require('discord.js');

module.exports = {

    name: Events.InteractionCreate,
    once: false,

    /**
     * 
     * @param {Client} client 
     * @param {StringSelectMenuInteraction} interaction 
     */

    execute: async (client, interaction) => {

        if (interaction.isAnySelectMenu()) {

            const selects = client.selects.get(interaction.customId);
            if (selects) {
                try {
                    await selects.execute(client, interaction);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
}