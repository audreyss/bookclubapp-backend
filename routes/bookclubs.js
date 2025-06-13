var express = require('express');
var router = express.Router();

const cors = require('cors');
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
var mongoose = require('mongoose');
const Bookclub = require('../models/bookclubs');

router.get('/all', async (req, res) => {
    const bookclubs = await Bookclub.find();
    res.json({ bookclubs });
});

router.get('/:id', async (req, res) => {
    const bookclubId = req.params.id;
    if (!bookclubId) return res.status(401);
    const bookclub = await Bookclub.findById(bookclubId);
    res.json({ bookclub });
});

router.post('/create', async (req, res) => {
    const newBookclub = new Bookclub({
        name: req.body.name,
        description: req.body.desc,
        private: req.body.privacy,
        creator: req.userId,
    })
    const data = await newBookclub.save();
    res.json({ bookclub: data });
});

router.delete('/delete', async (req, res) => {
    if (!req.body.bookclubId) return res.status(400).send('Missing bookclub Id');
    const data = await Bookclub.findByIdAndDelete(req.body.bookclubId);
    res.json({result: true})
})

router.put('/modify', async (req, res) => {
    const { id, name, private, description} = req.body;
    const data = await Bookclub.findOneAndUpdate({ _id: id }, { name, private, description }, {
        new: true
    });
    res.json({ bookclub: data });
});

router.options('/upload', cors());

router.put('/upload', cors(), async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const iconPath = `/tmp/${uniqid()}.jpg`;
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