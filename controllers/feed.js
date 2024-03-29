const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
    
    const currentPage = req.query.page || 1;
    const perPage = 10;

    try {
    const totalItems = await Post.countRecords()
    const posts = await Post.fetchSkip((currentPage - 1) * perPage, perPage)
    
    res.status(200).json({
            posts: posts,
            totalItems: totalItems
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

};

exports.postPost = (req, res, next) => {

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
    const userId = req.userId;

    const post = new Post(
        title,
        content,
        imageUrl,
        1
    )

    return User.findById(userId)
        .then(foundUser => {
            const user = foundUser
            return user.createPost(post)
        })
        .then(([result]) => {
            return Post.findById(result.insertId);
        })
        .then(post => {

            return res.status(201).json({
                message: "post created successfully",
                post: post
            });
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

    return Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            post.imageUrl = post.imageUrl.replace("\\", "/");
            res.status(200).json({ message: 'Post fetched.', post: post })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.updatePost = (req, res, next) => {

    const postId = req.params.postId;
    const updatedTitle = req.body.title;
    const updatedContent = req.body.content;
    const userId = req.userId;
    let updatedImageUrl = req.body.image;

    if (req.file) {
        updatedImageUrl = req.file.path;
    }
    if(!updatedImageUrl) {
        const error = new Error('No file picked.');
        error.statusCode = 422;
        throw error;
    }

    let updatedPost;

    return Post.findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error('Can not find Post to update.');
                error.statusCode = 422;
                throw error;
            }

            if (post.user_id.toString() !== userId) {
                const error = new Error('Not authorised to changed this post.');
                error.statusCode = 401;
                throw error;
            }
            
            if (post.imageUrl !== updatedImageUrl) {
                clearImage(post.imageUrl);
                post.imageUrl = updatedImageUrl;
            }

            post.title = updatedTitle;
            post.content = updatedContent;

            updatedPost = post;

            return post.update()
        })
        .then(result => {
            return res.status(200).json({ message: 'Post Updated Successfully.', post: updatedPost });
        })
        .catch(err => {
            next(err);
        })

};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    const userId = req.userId;

    return Post.findById(postId)
        .then(post => {
            
            if(!post) {
                const error = new Error('Can not find Post to update.');
                error.statusCode = 422;
                throw error;
            }

            if (userId.toString() !== post.user_id.toString()) {
                const error = new Error('This is not your post to delete.');
                error.statusCode = 401;
                throw error;
            }

            clearImage(post.imageUrl);
            return post.delete();
        })
        .then(result => {
            res.status(200).json({ message: 'Post deleted successfully' })
        })
        .catch(err => {
            console.log(err);
            next(err);
        })
}

