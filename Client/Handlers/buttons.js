module.exports = (client, fs) => {

    const buttons = fs.readdirSync('./Client/Buttons');
    for (let category of buttons) {

        const files = fs.readdirSync(`./Client/Buttons/${category}`);
        for (let file of files) {

            const inside_file = require(`../Buttons/${category}/${file}`);

            if (inside_file.id) {
                client.buttons.set(inside_file.id, inside_file);
            }
        }
    }

    console.log(`Loaded ${client.buttons.size} buttons!`);
}