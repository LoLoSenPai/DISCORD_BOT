const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */

    execute: async (client, interaction) => {


        if (interaction.isCommand()) {

            await client.function.registerGuild(client, interaction);

            const command = client.commands.get(interaction.commandName);

            if (!command) {
                return interaction.reply({ content: `This command doesn't exist anymore`, ephemeral: true });
            };

            try {
                await command.execute(client, interaction, interaction.options);
            } catch (error) {
                console.error(error);
            }
        }
    }
}