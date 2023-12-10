const { Schema, model } = require('mongoose');

const guildSchema = Schema({
    guildId: { type: String, required: true, unique: true },
    guildName: { type: String }
});

module.exports = model('Guilds', guildSchema);