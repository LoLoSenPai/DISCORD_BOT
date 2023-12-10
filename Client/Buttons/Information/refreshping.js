const { Client, ButtonInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {

    id: 'refreshping',

    /**
     * 
     * @param {Client} client 
     * @param {ButtonInteraction} interaction 
     */

    execute: async (client, interaction) => {
        await interaction.message.edit({
            content: `New update => Bot latency: \`${Date.now() - interaction.createdTimestamp}\`ms`,
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('refreshping')
                            .setDisabled(true)
                            .setLabel('Refresh')
                            .setStyle(ButtonStyle.Danger)
                    )
            ]
        });

        await interaction.deferUpdate();
    }
};