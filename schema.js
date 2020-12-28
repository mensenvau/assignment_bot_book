const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookUserSchema = new Schema({
    chat_id: {
        type: String,
        unique: true,
    },
    event: String,
    name: String,
    autor: String,
    key: String,
    file: Array,
});


const bookSchema = new Schema({
    name: String,
    autor: String,
    key: String,
    file: Array,
});

module.exports = {
    bookUser: mongoose.model("bookUser", bookUserSchema),
    book: mongoose.model("book", bookSchema),
}