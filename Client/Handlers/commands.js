const { REST, Routes } = require('discord.js');
const { token, clientId } = require('../config.json');

module.exports = async (client, fs) => {
    await (async () => {

        const commands = fs.readdirSync('./Client/Commands');
        for (let category of commands) {
            const files = fs.readdirSync(`./Client/Commands/${category}`);
            for (let file of files) {
                console.log(`Loading command from file: ${file}`);
                const inside_file = require(`../Commands/${category}/${file}`);
                console.log(inside_file.data);

                client.commands.set(inside_file.data.name, inside_file);
                client.slashArray.push(inside_file.data.toJSON());
            }
        }
    })();

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        await rest.put(Routes.applicationCommands(clientId), {
            body: client.slashArray
        });
    } catch (error) {
        console.error(error);
    }

    console.log(`Loaded ${client.commands.size} commands!`);
}