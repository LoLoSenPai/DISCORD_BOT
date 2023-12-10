const { Client, ChatInputCommandInteraction } = require('discord.js');
const { Guild } = require('../Models');

/**
 * @param {Client} client
 * @param {ChatInputCommandInteraction} interaction
 */
module.exports = async (client, interaction) => {

    if (interaction.guild?.id) {

        let data = await Guild.findOne({ guildId: interaction.guild.id });

        if (data) {
            return data;
        } else {
            const newGuild = new Guild({
                guildId: interaction.guild.id,
                guildName: interaction.guild.name,
            });

            try {
                const guild = await newGuild.save();
                return guild;
            } catch (err) {
                console.error("Error registering guild:", err);
                return interaction.reply({ content: `Error registering guild: ${err}`, ephemeral: true });
            }
        }
    }
};
