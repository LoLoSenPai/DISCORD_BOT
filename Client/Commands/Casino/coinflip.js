const { SlashCommandBuilder, Client, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const User = require('../../Models/User');
const { sendTransactionToWinner, sendTransactionToTreasury } = require('../../utils/transactionFunctions');
const { decrypt } = require('../../utils/encryptionUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Play a game of coinflip')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Choose heads or tails')
                .setRequired(true)
                .addChoices(
                    { name: 'Heads', value: 'heads' },
                    { name: 'Tails', value: 'tails' }
                )
        )
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('Amount of SOL to bet')
                .setRequired(true)),

    category: 'Casino',

    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async (client, interaction, args) => {
        const choice = interaction.options.getString('choice');
        const amount = interaction.options.getNumber('amount');

        await coinflip(interaction, choice, amount);
    },
};

async function coinflip(interaction, choice, amount) {
    const MIN_BET = 0.05;
    const TAX_AMOUNT = 0.015;

    const userId = interaction.user.id;
    const user = await User.findOne({ userId });

    await interaction.deferReply();

    if (!user || user.balance < (amount + TAX_AMOUNT) || amount < MIN_BET) {
        return interaction.editReply(`Insufficient balance to play or bet less than the minimum ${MIN_BET} SOL.`);
    }

    // Deduct the tax amount from the user's balance
    user.balance -= TAX_AMOUNT;

    await sendTransactionToTreasury(Buffer.from(decrypt(user.privateKey)), TAX_AMOUNT);

    let result;
    if (Math.random() < 0.4) {  // 40% chance of winning
        result = choice;
    } else {
        result = choice === 'heads' ? 'tails' : 'heads';
    }
    let embedColor;
    let responseMessage;

    // Verify if the user won or lost
    if (choice === result) {
        // User wins, increase their balance
        user.balance += amount;
        embedColor = "#00FF00";
        responseMessage = `You won ${amount} on ${result}. Your new balance is ${user.balance.toFixed(2)} SOL.`;

        // Send a transaction from the treasury wallet to the user's wallet
        await sendTransactionToWinner(user.solanaWallet, amount);
    } else {
        // User loses, decrease their balance
        user.balance -= amount;
        embedColor = "#FF0000";
        responseMessage = `You lost ${amount} on ${result}. Your new balance is ${user.balance.toFixed(2)} SOL.`;

        const decryptedPrivateKeyArray = decrypt(user.privateKey);
        if (decryptedPrivateKeyArray.length !== 64) {
            throw new Error("Wrong private key size.");
        }

        // Send a transaction from the user's wallet to the treasury wallet
        await sendTransactionToTreasury(Buffer.from(decryptedPrivateKeyArray), amount);
    }
    await user.save();

    const embed = new EmbedBuilder()
        .setTitle('Coinflip Result')
        .setDescription(responseMessage)
        .setColor(embedColor)
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}
