const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    nxb: String,
    publishedYear: Number,
    description: String,
    cover: String
})

const BOOK = mongoose.model('Book', bookSchema);

module.exports = BOOK;
