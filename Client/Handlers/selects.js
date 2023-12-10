module.exports = (client, fs) => {

    const selects = fs.readdirSync('./Client/Selects');
    for (let category of selects) {

        const files = fs.readdirSync(`./Client/Selects/${category}`);
        for (let file of files) {

            const inside_file = require(`../Selects/${category}/${file}`);

            if (inside_file.id) {
                client.selects.set(inside_file.id, inside_file);
            }
        }
    }

    console.log(`Loaded ${client.selects.size} selects!`);
}