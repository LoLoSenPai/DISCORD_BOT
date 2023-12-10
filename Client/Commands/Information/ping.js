const { SlashCommandBuilder, Client, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('What is the bot\'s ping?')
        .setDMPermission(false)
        .setDefaultMemberPermissions(null),

    category: 'Information',

    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */

    execute: (client, interaction, args) => {
        return interaction.reply({
            content: `Bot latency: \`${Date.now() - interaction.createdTimestamp}\`ms`,
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('refreshping')
                            .setDisabled(false)
                            .setLabel('Refresh')
                            .setStyle(ButtonStyle.Danger)
                    )
            ]
        });
    }
};