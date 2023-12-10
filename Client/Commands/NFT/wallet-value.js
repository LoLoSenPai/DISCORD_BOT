const { SlashCommandBuilder, Client, ChatInputCommandInteraction } = require('discord.js');
const { simpleHashAPI } = require('../../config.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('wallet-value')
		.setDescription('Check the value of your wallet')
		.addStringOption((option) =>
			option
				.setName('wallet')
				.setDescription('Your wallet address')
				.setRequired(true),
		),
	category: 'NFT',
	/**
	 * 
	 * @param {Client} client 
	 * @param {ChatInputCommandInteraction} interaction 
	 */


	async execute(client, interaction, args) {
		const wallet = interaction.options.getString('wallet');

		const options = {
			method: 'GET',
			headers: {
				accept: 'application/json',
				'X-API-KEY': simpleHashAPI,
			},
		};

		try {
			const response = await fetch(
				`https://api.simplehash.com/api/v0/nfts/owners/value?wallet_addresses=${wallet}`,
				options,
			);
			const data = await response.json();

			const walletValue = data.wallets[0].usd_value;

			let rank;
			let role;
			if (walletValue > 5000) {
				rank = { value: 'THE holy whale' };
				role = interaction.guild.roles.cache.find(r => r.name === 'Whale');
			}
			else if (walletValue > 1000) {
				rank = { value: 'a giga chad' };
				role = interaction.guild.roles.cache.find(r => r.name === 'Giga Chad');
			}
			else if (walletValue > 500) {
				rank = { value: 'a chad' };
				role = interaction.guild.roles.cache.find(r => r.name === 'Chad');
			}
			else if (walletValue > 200) {
				rank = { value: 'a connoisseur' };
				role = interaction.guild.roles.cache.find(r => r.name === 'Entrepreneur');
			}
			else if (walletValue > 50) {
				rank = { value: 'ready to go to the moon' };
				role = interaction.guild.roles.cache.find(r => r.name === 'Almost Something');
			}
			else if (walletValue < 50) {
				rank = { value: 'a good person' };
				role = interaction.guild.roles.cache.find(r => r.name === 'Begginer');
			}

			if (role) {
				interaction.member.roles.add(role).catch(console.error);
			}

			await interaction.reply({ content: `The value of your wallet is ${walletValue} $ \n You are ${rank.value}` });
		}
		catch (error) {
			console.log(error);
		}
	},
};