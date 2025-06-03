var express = require('express');
var router = express.Router();

const Follower = require('../models/followers');

router.get('/user', async (req, res) => {
    const userId = req.query.userId ? req.query.userId : req.userId;
    const data = await Follower.find({
        id_user : userId,
    }).populate('id_bookclub');
    res.json({ followings: data });
});

router.get('/bookclub/:id', async (req, res) => {
    const data = await Follower.find({
        id_bookclub : req.params.id,
    }).populate('id_user', 'email pseudo');
    res.json({ followings: data });
});

router.post('/create', async (req, res) => {
    const newFollower = new Follower({
        id_user: req.userId,
        id_bookclub: req.body.bookclubId,
        role: 0,
    })
    const data = await newFollower.save();
    res.json({ follower: data });
});

module.exports = router;