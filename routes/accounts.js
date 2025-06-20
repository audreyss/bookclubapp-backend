var express = require('express');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require("express-validator");
const User = require('../models/users');

const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
var router = express.Router();

const validatePassword = [
    body("password")
        .notEmpty().withMessage("Besoin de l'ancien mot de passe"),
]

const validatePseudo = [
    body("newValue")
        .matches(/^[a-zA-Z0-9!@#$%^&*]+$/).withMessage("Le pseudo contient des caractères interdits."),
];

const validateEmail = [
    body("newValue")
        .isEmail().withMessage("L'email n'est pas valide.")
        .normalizeEmail(),
];

const validateNewPassword = [
    body("newValue")
        .isLength({ min: 6 }).withMessage("Le mot de passe doit contenir au moins 6 caractères.")
        .matches(/^[a-zA-Z0-9!@#$%^&*]+$/).withMessage("Le mot de passe contient des caractères interdits."),
];


router.put('/pseudo', [...validatePseudo, ...validatePassword], (req, res) => {
    const newPseudo = req.body.newValue;
    const password = req.body.password;
    const email = req.email;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
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
    const newEmail = req.body.newValue;
    const password = req.body.password;
    const email = req.email;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
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
    const newPassword = req.body.newValue;
    const password = req.body.password;
    const email = req.email;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
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

router.get('/user', (req, res) => {
    const email = req.email;
    User.findOne({ email })
        .then(data => {
            const user = { pseudo: data.pseudo, email: data.email, icon: data.icon };
            res.json({ user });
        })
        .catch((error) => res.status(500).json({ error }))
});

router.put('/uploadIcon', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const iconPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await req.files.icon.mv(iconPath);

    if (resultMove) {
        return res.status(400).send(resultMove);
    }
    const resultCloudinary = await cloudinary.uploader.upload(iconPath);
    fs.unlinkSync(iconPath);

    const data = await User.findOneAndUpdate({ email: req.email }, { icon: resultCloudinary.secure_url }, {
        new: true
    });

    res.json({ url: data.icon });
});


module.exports = router;