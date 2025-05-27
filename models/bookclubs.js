const mongoose = require('mongoose');

const bookclubSchema = mongoose.Schema({
    name: String,
    private: Boolean,
    description: String,
    icon: String,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
});

const Bookclub = mongoose.model('bookclubs', bookclubSchema);

module.exports = Bookclub;