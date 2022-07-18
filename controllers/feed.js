const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {

    return Post.fetchAll()
        .then(posts => {
            res
                .status(200)
                .json({
                    posts: posts
                })
        })
        .catch(err => {
            console.log(err);
        })
};

exports.postPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed',
            errors: errors.array()
        })
    }

    const title = req.body.title;
    const content = req.body.content;
    const post = new Post(
        title,
        content,
        'www.google.com',
        1
    )

    return User.findById(1)
        .then(foundUser => {
            user = foundUser
            return user.createPost(post)
        })
        .then(([result]) => {
            return Post.findById(result.insertId);
        })
        .then(post => {
            console.log(post);
            return res.status(201).json({
                message: "post created successfully",
                post: post
            })
        })

};