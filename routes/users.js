var express = require('express');
var router = express.Router();

const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', (req, res) => {
  User.find()
    .then(data => {
      const users = data.map((user) => ({pseudo: user.pseudo, email: user.email}))
      res.json({ result: true, users });
    })
    .catch((error) => res.json({ result: false, error }))
});

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['pseudo', 'password', 'email'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  User.findOne({ email: req.body.email }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);
      const newUser = new User({
        pseudo: req.body.pseudo,
        email: req.body.email,
        password: hash,
        token: uid2(32),
      });

      newUser.save()
        .then(data => {
          res.json({ result: true, token: data.token });
        });
    } else {
      res.json({ result: false, error: 'User already exists' });
    }
  });
});


router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  User.findOne({ email: req.body.email })
    .then(data => {
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, token: data.token });
      } else {
        res.json({ result: false, error: 'User not found or wrong password' })
      }
    })
});

module.exports = router;
