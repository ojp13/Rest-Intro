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
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;

        throw error;
    }
    if (!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path;

    const post = new Post(
        title,
        content,
        imageUrl,
        1
    )

    return User.findById(1)
        .then(foundUser => {
            const user = foundUser
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
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })

};

exports.getPost = (req, res, next) => {

    const postId = req.params.postId;
    console.log('Retriving post: ' + postId)

    return Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'Post fetched.', post: post })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}