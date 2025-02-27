var express = require('express');
var router = express.Router();

const User = require('../models/users');
const { body, validationResult } = require("express-validator");
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

// validation for sign in: email and password
const validateSignIn = [
  body("email")
    .isEmail().withMessage("L'email n'est pas valide.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 }).withMessage("Le mot de passe doit contenir au moins 6 caractères.")
    .matches(/^[a-zA-Z0-9!@#$%^&*]+$/).withMessage("Le mot de passe contient des caractères interdits."),
];

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
      res.json({ result: true, users });
    })
    .catch((error) => res.json({ result: false, error }))
});

// POST users/signup: sign up
router.post('/signup', validateSignUp, (req, res) => {
  // Check validation for errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ result: false, error: errors.array() });
  }

  // Ask DB if another user with same email
  User.findOne({ email: req.body.email })
    .then(data => {
      if (data === null) {
        // no user with same email: continue with creation of new user
        const hash = bcrypt.hashSync(req.body.password, 10);
        const newUser = new User({
          pseudo: req.body.pseudo,
          email: req.body.email,
          password: hash,
          token: uid2(32),
        });

        // save new user to DB
        newUser.save()
          .then(data => {
            res.json({ result: true, token: data.token, pseudo: data.pseudo });
          });
      } else {
        // one user with same email: abort sign up
        res.json({ result: false, error: 'User already exists' });
      }
    })
    .catch((error) => res.json({ result: false, error }));
});

// POST users/signup: sign up
router.post("/signin", validateSignIn, (req, res) => {
  // Check validation for errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ result: false, error: errors.array() });
  }

  // Ask DB to find user with same email
  User.findOne({ email: req.body.email })
    .then(data => {
      // User with same email found: check if same hashed password
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, token: data.token, pseudo: data.pseudo });
      } else {
        // No user found or wrong password
        res.json({ result: false, error: 'User not found or wrong password' })
      }
    })
    .catch((error) => res.json({ result: false, error }))
});

module.exports = router;
