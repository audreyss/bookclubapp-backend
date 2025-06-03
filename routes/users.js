var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();

const User = require('../models/users');
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcrypt');

// validation for sign up: email, password and pseudo
const validateSignUp = [
    body("email")
        .isEmail().withMessage("L'email n'est pas valide.")
        .normalizeEmail(),
    body("password")
        .isLength({ min: 6 }).withMessage("Le mot de passe doit contenir au moins 6 caractères.")
        .matches(/^[a-zA-Z0-9!@#$%^&*]+$/).withMessage("Le mot de passe contient des caractères interdits."),
    body("pseudo")
        .matches(/^[a-zA-Z0-9!@#$%^&*]+$/).withMessage("Le pseudo contient des caractères interdits."),
];

// GET users: list of users
router.get('/', (req, res) => {
    // Ask DB for users
    User.find()
        .then(data => {
            const users = data.map((user) => ({ pseudo: user.pseudo, email: user.email }))
            res.json({ users });
        })
        .catch((error) => res.status(500).json({ error }))
});

// POST users/signup: sign up
router.post('/signup', validateSignUp, (req, res) => {
    // Check validation for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    // Ask DB if another user with same email
    User.findOne({ email: req.body.email })
        .then(data => {
            if (!data) {
                // no user with same email: continue with creation of new user
                const hash = bcrypt.hashSync(req.body.password, 10);
                const newUser = new User({
                    pseudo: req.body.pseudo,
                    email: req.body.email,
                    password: hash,
                });

                // save new user to DB
                newUser.save()
                    .then(data => {
                        let tokenData = { email: data.email, userId: data._id }
                        const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
                        res.json({ token, pseudo: data.pseudo });
                    });
            } else {
                // one user with same email: abort sign up
                res.status(401).json({ error: 'User already exists' });
            }
        })
        .catch((error) => res.status(500).json({ error }));
});

// POST users/signin: sign in
router.post("/signin", (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ error: 'User and password required.' });
    }

    // Ask DB to find user with same email
    User.findOne({ email: req.body.email })
        .then(data => {
            // User with same email found: check if same hashed password
            if (data && bcrypt.compareSync(req.body.password, data.password)) {
                let tokenData = { email: data.email, userId: data._id }
                const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
                res.json({ token, pseudo: data.pseudo });
            } else {
                // No user found or wrong password
                res.status(401).json({ error: 'User not found or wrong password' })
            }
        })
        .catch((error) => res.status(500).json({ error }))
});

module.exports = router;
