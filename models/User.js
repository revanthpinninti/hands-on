const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    lastName: {
        type: String,
        min: 4,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min:6,
        max:255
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max:1024
    },
    gender: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);
