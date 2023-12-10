const { SlashCommandBuilder, Client, ChatInputCommandInteraction, PermissionFlagsBits } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('prune')
        .setDescription('Prune messages from a channel.')
        .addIntegerOption(option => option
            .setName('amount')
            .setDescription('How many messages to prune?')
            .setRequired(true))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    category: 'Moderation',

    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */

    execute: async (client, interaction, args) => {
        const amount = interaction.options.getInteger('amount');

        if (amount <= 0) return interaction.reply({
            content: 'You must specify an amount of messages to prune!',
            ephemeral: true
        });

        if (amount > 100) return interaction.reply({
            content: 'You cannot prune more than 100 messages at a time!',
            ephemeral: true
        });

        await interaction.channel.bulkDelete(amount, true).catch(err => {
            console.error(err);
            interaction.reply({
                content: 'There was an error trying to prune messages in this channel!',
                ephemeral: true
            });
        });

        return interaction.reply({
            content: `Successfully pruned \`${amount}\` messages!`,
            ephemeral: true
        });
    }
};