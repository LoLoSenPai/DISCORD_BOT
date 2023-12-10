const mongoose = require('mongoose');
const { mongoURI } = require('../config.json');

module.exports = (client, fs) => {
    
    mongoose.connect(mongoURI);

    mongoose.connection.on('connected', () => {
        console.log('Connected to MongoDB!');
    });
}