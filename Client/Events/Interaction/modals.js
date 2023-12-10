const { Events, Client, ModalSubmitInteraction } = require('discord.js');

module.exports = {

    name: Events.InteractionCreate,
    once: false,

    /**
     * 
     * @param {Client} client 
     * @param {ModalSubmitInteraction} interaction 
     */

    execute: async (client, interaction) => {

        if (interaction.isModalSubmit()) {

            const modals = client.modals.get(interaction.customId);
            if (modals) {
                try {
                    await modals.execute(client, interaction);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
}