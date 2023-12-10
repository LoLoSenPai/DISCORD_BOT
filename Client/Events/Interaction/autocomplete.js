const { Events, Client, ChatInputCommandInteraction } = require('discord.js');

module.exports = {

    name: Events.InteractionCreate,
    once: false,

    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */

    execute: async (client, interaction) => {

        if (interaction.isAutocomplete()) {

            const command = client.commands.get(interaction.commandName);

            if (command) {

                try {

                    await command.autocomplete(interaction);

                } catch (error) {

                    console.error(error);
                }
            }
        }
    }
}