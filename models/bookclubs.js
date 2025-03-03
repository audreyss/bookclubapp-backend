const mongoose = require('mongoose');

const bookclubSchema = mongoose.Schema({
    name: String,
    private: Boolean,
});

const Bookclub = mongoose.model('bookclubs', bookclubSchema);

module.exports = Bookclub;