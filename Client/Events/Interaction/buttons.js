const { Events, Client, ButtonInteraction } = require('discord.js');

module.exports = {

    name: Events.InteractionCreate,
    once: false,

    /**
     * 
     * @param {Client} client 
     * @param {ButtonInteraction} interaction 
     */

    execute: async (client, interaction) => {

        if (interaction.isButton()) {

            const buttons = client.buttons.get(interaction.customId);
            if (buttons) {
                try {
                    await buttons.execute(client, interaction);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
}