const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    hpass: String,
    role: String
})

const USER = mongoose.model('User', userSchema);

module.exports = USER;
