var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Protected route', user: req.user });
});

module.exports = router;