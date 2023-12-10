const {
    SlashCommandBuilder,
    EmbedBuilder,
    Client,
    ChatInputCommandInteraction,
} = require('discord.js');
const { simpleHashAPI } = require('../../config.json');

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const blockchainLogos = {
    solana: '<:solana:1123592698130083964>',
    ethereum: '<:ethereum:1123592639531470938>',
    polygon: '<:polygon:1123592600193085460>',
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rarity')
        .setDescription('Check the rarity of your NFT')
        .addStringOption((option) =>
            option
                .setName('blockchain')
                .setDescription('On which blockchain is your NFT?')
                .setRequired(true)
                .setChoices(
                    {
                        name: 'Solana',
                        value: 'solana',
                    },
                    {
                        name: 'Ethereum',
                        value: 'ethereum',
                    },
                    {
                        name: 'Polygon',
                        value: 'polygon',
                    },
                ),
        )
        .addStringOption((option) =>
            option
                .setName('contract')
                .setDescription('Which contract address (= mint address) ?')
                .setRequired(true),
        )
        .addIntegerOption((option) =>
            option
                .setName('number')
                .setDescription('Which NFT number ?')
                .setRequired(true),
        ),
    category: 'NFT',
    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */

    async execute(client, interaction, args) {
        const blockchain = interaction.options.getString('blockchain');
        const contract = interaction.options.getString('contract');
        const numb = interaction.options.getInteger('number');
        const blockchainLogo = blockchainLogos[blockchain];

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'X-API-KEY': simpleHashAPI,
            },
        };

        try {
            const response = await fetch(
                `https://api.simplehash.com/api/v0/nfts/${blockchain}/${contract}/${numb}`,
                options
            );
            const data = await response.json();

            const supplyValue = data.collection.total_quantity;

            const rarityValue = data.rarity?.rank;

            const name = data.name;
            const imageNft = data.image_url;
            const imageCollection = data.collection.image_url;

            // Calculating the rarity percentage
            const rarityPercent = (rarityValue / supplyValue) * 100;

            // Determining the rarity
            let rarity;
            if (rarityPercent <= 1) {
                rarity = {
                    value: 'mythic',
                    image:
                        '<:mythik1:1099501852334239815><:mythik2:1099501854175539261><:mythik3:1099501855278645350>',
                    color: '#F5340B',
                };
            }
            else if (rarityPercent <= 5) {
                rarity = {
                    value: 'legendary',
                    image:
                        '<:legendary1:1024082228839448647><:legendary2:1024082231267963030><:legendary3:1024082233625170062>',
                    color: '#FF9900',
                };
            }
            else if (rarityPercent <= 15) {
                rarity = {
                    value: 'epic',
                    image:
                        '<:epic1:1024082222103416874><:epic2:1024082224150220892><:epic3:1024082226767474739>',
                    color: '#B20BF5',
                };
            }
            else if (rarityPercent <= 35) {
                rarity = {
                    value: 'rare',
                    image:
                        '<:rare1:1024082242345111642><:rare2:1024082244698132570><:rare3:1024082246824644708>',
                    color: '#0B8EF5',
                };
            }
            else if (rarityPercent <= 60) {
                rarity = {
                    value: 'uncommon',
                    image:
                        '<:uncommon1:1024082248879849522><:uncommon2:1024082250993774652><:uncommon3:1024082253489393705>',
                    color: '#0BF54E',
                };
            }
            else {
                rarity = {
                    value: 'common',
                    image:
                        '<:common1:1024082214926942288><:common2:1024082217309306951><:common3:1024082219507142757>',
                    color: '#D1D1D1',
                };
            }

            const rarityEmbed = new EmbedBuilder()
                .setColor(`${rarity.color}`)
                .setTitle(`${name}`)
                .setAuthor({
                    name: 'Rarity checker',
                    url: 'https://twitter.com/LoicDlugosz',
                })
                .setThumbnail(
                    `${imageCollection}`,
                )
                .addFields({ name: `${blockchainLogo}  \` ${capitalizeFirstLetter(blockchain)} \``, value: '\u200B' })
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    {
                        name: `<a:winner:1099475849864040518>・Rank: ${rarityValue}    ${rarity.image}`,
                        value: '\u200B',
                    },
                )
                .addFields({ name: `<a:rightarrow:1099475418400161823>・Supply: ${supplyValue}`, value: '\u200B' })
                .setImage(`${imageNft}`)
                .setFooter({
                    text: 'Tools powered by LoLo Labs',
                });

            await interaction.reply({ embeds: [rarityEmbed] });
        }
        catch (error) {
            console.log(error);
        }
    },
};