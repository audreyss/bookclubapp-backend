var express = require('express');
var router = express.Router();

const Bookclub = require('../models/bookclubs');

router.post('/create', async (req, res) => {
    //TODO : create bookclub in db
    const newBookclub = new Bookclub({
        name: req.body.name,
        description: req.body.desc,
        private: !req.body.privacy,
        creator: req.userId,
    })
    const data = await newBookclub.save();
    res.json({ bookclub: data });
});

router.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    //TODO : upload file on cloudinary +  update bookclub

    res.json({ result: true })
});

module.exports = router;