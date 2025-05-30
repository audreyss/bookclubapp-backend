const mongoose = require('mongoose');

const followersSchema = mongoose.Schema({
    id_user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    id_bookclub: {type: mongoose.Schema.Types.ObjectId, ref: 'bookclubs'},
    role: Number, // 0: creator, 1: moderator, 2: user
});

const Follower = mongoose.model('followers', followersSchema);

module.exports = Follower;