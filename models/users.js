const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    pseudo: String,
    email: String,
    password: String,
    icon: {
        type: String,
        default: 'https://res.cloudinary.com/dp4ymsmb5/image/upload/v1748961695/ylulsj0ndtymz7ksi4in.png'
    }
});
const User = mongoose.model('users', userSchema);

module.exports = User;