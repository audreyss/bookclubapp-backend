var express = require('express');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require("express-validator");
const User = require('../models/users');

var router = express.Router();

const validatePassword = [
    body("password")
        .notEmpty().withMessage("Besoin de l'ancien mot de passe"),
]

const validatePseudo = [
    body("pseudo")
        .matches(/^[a-zA-Z0-9!@#$%^&*]+$/).withMessage("Le pseudo contient des caractères interdits."),
];

const validateEmail = [
    body("email")
        .isEmail().withMessage("L'email n'est pas valide.")
        .normalizeEmail(),
];

const validateNewPassword = [
    body("newPassword")
        .isLength({ min: 6 }).withMessage("Le mot de passe doit contenir au moins 6 caractères.")
        .matches(/^[a-zA-Z0-9!@#$%^&*]+$/).withMessage("Le mot de passe contient des caractères interdits."),
];


router.put('/pseudo', [...validatePseudo, ...validatePassword], (req, res) => {
    const newPseudo = req.body.pseudo;
    const password = req.body.password;
    const email = req.email;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    User.findOne({ email })
        .then(data => {
            if (data && bcrypt.compareSync(password, data.password)) {
                User.updateOne({ email }, { pseudo: newPseudo })
                    .then(() => res.json({ result: true }))
                    .catch(error => res.status(500).json({ error }));
            } else {
                res.status(400).json({ error: 'User not found or wrong password.' });
            }
        })
        .catch(error => res.status(500).json({ error }));
});

router.put('/email', [...validateEmail, ...validatePassword], (req, res) => {
    const newEmail = req.body.email;
    const password = req.body.password;
    const email = req.email;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    User.findOne({ email })
        .then(data => {
            if (data && bcrypt.compareSync(password, data.password)) {
                User.updateOne({ email }, { email: newEmail })
                    .then(() => {
                        let tokenData = { email: newEmail }
                        const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
                        res.json({ result: true, token });
                    })
                    .catch(error => res.status(500).json({ error }));
            } else {
                res.status(400).json({ error: 'User not found or wrong password.' });
            }
        })
        .catch(error => res.status(500).json({ error }));
});

router.put('/password', [...validateNewPassword, ...validatePassword], (req, res) => {
    const newPassword = req.body.newPassword;
    const password = req.body.password;
    const email = req.email;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    User.findOne({ email })
        .then(data => {
            if (data && bcrypt.compareSync(password, data.password)) {
                const hash = bcrypt.hashSync(newPassword, 10);
                User.updateOne({ email }, { password: hash })
                    .then(() => res.json({ result: true }))
                    .catch(error => res.status(500).json({ error }));
            } else {
                res.status(400).json({ error: 'User not found or wrong password.' });
            }
        })
        .catch(error => res.status(500).json({ error }));
});

module.exports = router;