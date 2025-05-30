var express = require('express');
var router = express.Router();

const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
var mongoose = require('mongoose');
const Bookclub = require('../models/bookclubs');

router.post('/create', async (req, res) => {
    const newBookclub = new Bookclub({
        name: req.body.name,
        description: req.body.desc,
        private: !req.body.privacy,
        creator: req.userId,
    })
    const data = await newBookclub.save();
    res.json({ bookclub: data });
});

router.put('/upload', async (req, res) => {
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

    const bookclubHeader = req.headers['bookclub'];
    if (!bookclubHeader) return res.sendStatus(401);

    const id = new mongoose.Types.ObjectId(bookclubHeader);
    const data = await Bookclub.findOneAndUpdate({ _id: id }, { icon: resultCloudinary.secure_url }, {
        new: true
    });

    res.json({ bookclub: data });
});

module.exports = router;