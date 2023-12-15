const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: String,
    status: String,
    size: String,
    price: String
})

const TODO = mongoose.model('Todo', todoSchema);

module.exports = TODO;
