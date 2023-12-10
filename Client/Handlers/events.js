module.exports = (client, fs) => {

    const Chargdir = (dirs) => {

        const events = fs.readdirSync(`./Client/Events/${dirs}`);

        for (let file of events) {
            const event = require(`../Events/${dirs}/${file}`);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(client, ...args));
            } else {
                client.on(event.name, (...args) => event.execute(client, ...args));
            }
        }
    }

    fs.readdirSync('./Client/Events').forEach(e => Chargdir(e));
}