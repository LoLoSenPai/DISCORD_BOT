const { SlashCommandBuilder, Client, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const solanaWeb3 = require('@solana/web3.js');
const User = require('../../Models/User');
const { encrypt, decrypt } = require('../../utils/encryptionUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wallet')
        .setDescription('Manage your Solana wallet')
        .addSubcommand(subcommand =>
            subcommand
                .setName('register')
                .setDescription('Register a new wallet'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View your wallet'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('set-main')
                .setDescription('Set your main wallet for withdrawal')
                .addStringOption(option => option.setName('address').setDescription('Your Solana wallet address').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('withdraw')
                .setDescription('Withdraw SOL from your wallet')
                .addNumberOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of SOL to withdraw')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('target')
                        .setDescription('Target wallet address (ignored if main wallet is used)')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('use-main-wallet')
                        .setDescription('Use your main wallet for withdrawal')
                        .setRequired(false)))
        .setDMPermission(false),

    category: 'Casino',

    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */

    execute: async (client, interaction, args) => {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case 'register': {
                await registerWallet(interaction);
                break;
            }
            case 'view': {
                await getWallet(interaction);
                break;
            }
            case 'set-main': {
                const mainWallet = interaction.options.getString('address');
                await setMainWallet(interaction, mainWallet);
                break;
            }
            case 'withdraw': {
                const amount = interaction.options.getNumber('amount');
                const useMainWallet = interaction.options.getBoolean('use-main-wallet');
                const targetWallet = useMainWallet ? null : interaction.options.getString('target');
                await withdrawSOL(interaction, amount, targetWallet, useMainWallet);
                break;
            }
        }
    },
};

const Solana = new solanaWeb3.Connection("https://api.devnet.solana.com");

// Function to generate a new Solana wallet
function generateSolanaWallet() {
    const genWallet = async () => {
        const recentBlock = await Solana.getEpochInfo();
        console.log("~~~~~~~~~~~~~~~~~NEW BLOCK~~~~~~~~~~~~\n", recentBlock);
        const keyPair = solanaWeb3.Keypair.generate();

        console.log("Public Key:", keyPair.publicKey.toString());
        const secretKeyArray = Array.from(keyPair.secretKey);
        console.log("Secret Key Array:", secretKeyArray);

        const encryptedSecretKey = encrypt(Buffer.from(secretKeyArray));
        console.log("Encrypted Secret Key:", encryptedSecretKey);

        const encryptedSecretKeyString = JSON.stringify(encryptedSecretKey);
        console.log("Encrypted Secret Key String:", encryptedSecretKeyString);

        return { publicKey: keyPair.publicKey.toString(), secretKey: encryptedSecretKeyString };
    };

    return genWallet();
}

async function registerWallet(interaction) {
    const userId = interaction.user.id;

    // Checks if the user already exists in the database
    let user = await User.findOne({ userId });
    if (user) {
        return interaction.reply('You already have a registered wallet.');
    }

    // Generates a new wallet
    const { publicKey, secretKey } = await generateSolanaWallet();

    // Registers user in the database
    user = new User({ userId, solanaWallet: publicKey, privateKey: secretKey, balance: 0 });
    await user.save();

    const embed = new EmbedBuilder()
        .setTitle('Wallet Registered')
        .setDescription(`New wallet registered:\nBalance: 0 SOL\nAddress: ${publicKey}`)
        .setColor("#00FF00")
        .setTimestamp();

    interaction.reply({ embeds: [embed] });
}

async function getWallet(interaction) {
    const userId = interaction.user.id;

    // Checks if the user already exists in the database
    const user = await User.findOne({ userId });

    if (!user) {
        return interaction.reply({ content: "You don't have a registered wallet. Use /register to create one.", ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle('Your Wallet')
        .setDescription(`Balance: ${user.balance} SOL\nAddress: ${user.solanaWallet}`)
        .setColor("#FFFF00")
        .setTimestamp();

    interaction.reply({ embeds: [embed] });
}

async function setMainWallet(interaction, mainWallet) {
    const userId = interaction.user.id;

    // Check if the user has a registered wallet
    const user = await User.findOne({ userId });

    if (!user) {
        return interaction.reply("You don't have a registered wallet. Use /register to create one.");
    }

    // Update the user's main wallet in the database
    user.externalWallet = mainWallet;
    await user.save();

    const embed = new EmbedBuilder()
        .setTitle('Main Wallet Set')
        .setDescription(`Main wallet set to: ${mainWallet}`)
        .setColor("#00FF00")
        .setTimestamp();

    interaction.reply({ embeds: [embed] });
}

async function withdrawSOL(interaction, amount, targetWallet, useMainWallet = false) {
    const userId = interaction.user.id;
    const user = await User.findOne({ userId });

    if (!user) {
        return interaction.reply("You don't have a registered wallet. Use /register to create one.");
    }

    if (useMainWallet) {
        if (!user.externalWallet) {
            return interaction.reply("You don't have a main wallet set. Please set one or provide a wallet address.");
        }
        targetWallet = user.externalWallet;
    } else if (!targetWallet) {
        return interaction.reply("You must provide a target wallet address or use your main wallet.");
    }

    if (user.balance < amount) {
        return interaction.reply("Insufficient balance to withdraw.");
    }

    try {
        const decryptedPrivateKeyArray = decrypt(user.privateKey);
        if (decryptedPrivateKeyArray.length !== 64) {
            throw new Error("Wrong private key size.");
        }

        const keypair = solanaWeb3.Keypair.fromSecretKey(Buffer.from(decryptedPrivateKeyArray));

        const solanaWalletString = user.solanaWallet;
        if (!solanaWalletString) {
            return interaction.editReply("Invalid Solana wallet. Please check your wallet and try again.");
        }

        await interaction.deferReply();

        const fromPubkey = new solanaWeb3.PublicKey(solanaWalletString);
        const balance = await Solana.getBalance(fromPubkey);
        console.log(`Discord account balance: ${balance} lamports`);
        const toPubkey = new solanaWeb3.PublicKey(targetWallet);

        const transactionFee = 5000;
        const totalAmount = solanaWeb3.LAMPORTS_PER_SOL * amount + transactionFee;

        if (balance < totalAmount) {
            if (balance >= solanaWeb3.LAMPORTS_PER_SOL * amount) {
                amount = (balance - transactionFee) / solanaWeb3.LAMPORTS_PER_SOL;
            } else {
                return interaction.editReply(`Insufficient funds to complete the withdrawal. Your balance is ${balance / solanaWeb3.LAMPORTS_PER_SOL} SOL and the transaction fee is ${transactionFee / solanaWeb3.LAMPORTS_PER_SOL} SOL.`);
            }
        }

        const { blockhash } = await Solana.getLatestBlockhash();
        const transaction = new solanaWeb3.Transaction({ recentBlockhash: blockhash });


        transaction.add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey,
                toPubkey,
                lamports: Math.round(solanaWeb3.LAMPORTS_PER_SOL * amount),
            })
        );

        transaction.sign(keypair);

        const signature = await solanaWeb3.sendAndConfirmTransaction(Solana, transaction, [keypair]);

        user.balance -= amount + transactionFee / solanaWeb3.LAMPORTS_PER_SOL;
        await user.save();

        const embed = new EmbedBuilder()
            .setTitle('Withdrawal Successful')
            .setDescription(`Withdrawn ${amount} SOL from your wallet. New balance: ${user.balance} SOL. Transaction ID: ${signature}`)
            .setColor("#00FF00")
            .setTimestamp();

        interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error("Error during withdrawal:", error);
        interaction.editReply("An error occurred while processing the withdrawal.");
    }
}