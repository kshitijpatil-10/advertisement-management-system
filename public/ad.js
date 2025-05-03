const mongoose = require('mongoose');

// Define the Ad schema
const adSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a model using the schema
const Ad = mongoose.model('Ad', adSchema);

module.exports = Ad;
