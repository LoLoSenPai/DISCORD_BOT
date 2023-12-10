module.exports = (client, fs) => {

    const modals = fs.readdirSync('./Client/Modals');
    for (let category of modals) {

        const files = fs.readdirSync(`./Client/Modals/${category}`);
        for (let file of files) {

            const inside_file = require(`../Modals/${category}/${file}`);

            if (inside_file.id) {
                client.modals.set(inside_file.id, inside_file);
            }
        }
    }

    console.log(`Loaded ${client.modals.size} modals!`);
}