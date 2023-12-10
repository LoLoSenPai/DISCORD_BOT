const { SlashCommandBuilder, Client, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll, and send it to a channel.')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('What is your question?')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('choices')
                .setDescription('What are the choices? (separated by commas)')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the poll to.')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('How long should the poll last? (in minutes)')
                .setRequired(true)
        ),
    category: 'Moderation',

    /**
     * 
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */

    execute: async (client, interaction, args) => {

        await interaction.reply({ content: 'Creating the poll...', ephemeral: true });

        const { options } = interaction;

        const channel = options.getChannel('channel');
        const question = options.getString('question');
        const choices = options.getString('choices').split(',').map(choice => choice.trim());
        const duration = options.getInteger('duration');

        const row = new ActionRowBuilder();

        choices.forEach((choice, index) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`vote_${index}`)
                    .setLabel(choice)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        const embed = new EmbedBuilder()
            .setTitle(question)
            .setDescription('Click on the buttons to vote.')
            .setFooter({ text: `This poll will end in ${duration} minutes.` })
            .setTimestamp();

        const m = await channel.send({ embeds: [embed], components: [row] });

        await interaction.editReply({ content: 'Poll created!', ephemeral: true });

        // Store votes
        const votes = {};

        const collector = m.createMessageComponentCollector({ time: duration * 60 * 1000 });

        collector.on('collect', async (interaction) => {
            console.log('Vote received from:', interaction.user.id, 'for the choice:', interaction.customId);
            if (!votes[interaction.user.id]) {
                votes[interaction.user.id] = interaction.customId;
                await interaction.reply({ content: `You voted for : ${interaction.component.label}`, ephemeral: true });
            } else {
                await interaction.reply({ content: "You still have voted!", ephemeral: true });
            }
        });

        collector.on('end', () => {
            console.log('Times up. Votes collected:', Object.keys(votes).length);
            const tally = {};
            Object.values(votes).forEach(vote => {
                if (!tally[vote]) tally[vote] = 0;
                tally[vote]++;
            });

            const resultsEmbed = new EmbedBuilder()
                .setTitle('Results of the poll')
                .setDescription(question)
                .setTimestamp();

            Object.keys(tally).forEach(vote => {
                const choice = m.components[0].components.find(button => button.customId === vote).label;
                resultsEmbed.addFields({ name: choice, value: `${tally[vote]}`, inline: true });
            });

            channel.send({ embeds: [resultsEmbed] });
            m.delete();
        });
    }
}