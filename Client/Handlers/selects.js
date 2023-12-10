const path = require('path');

module.exports = (client, fs) => {
    const selectsPath = path.join(__dirname, '..', 'Selects');
    const selectsCategories = fs.readdirSync(selectsPath);

    for (let category of selectsCategories) {
        const categoryPath = path.join(selectsPath, category);
        const files = fs.readdirSync(categoryPath);

        for (let file of files) {
            const filePath = path.join(categoryPath, file);
            const inside_file = require(filePath);

            if (inside_file.id) {
                client.selects.set(inside_file.id, inside_file);
            }
        }
    }

    console.log(`Loaded ${client.selects.size} selects!`);
};
