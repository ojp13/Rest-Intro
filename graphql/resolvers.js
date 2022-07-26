const User = require('../models/user');
const Post = require('../models/post');

const validator = require('validator');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

module.exports = {
    createUser: async function ({ userInput }, req) {

        const errors = [];

        if (!validator.isEmail(userInput.email)) {
            errors.push({ message: 'Email is invalid.' });
        }

        if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 5 })) {
            errors.push({ message: 'Password is too short!' });
        }

        if (errors.length > 0) {
            const error = new Error('Invalid Input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const email = userInput.email;
        const password = userInput.password;
        const name = userInput.name;

        const existingUser = await User.findOneByEmail(email);

        if (existingUser) {
            const error = new Error('User exists already');
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User(
            name,
            email,
            hashedPassword
        )

        const createdUser = await newUser.save();

        return {
            _id: createdUser._id.toString(),
            name: createdUser.name,
            email: createdUser.email,
            status: createdUser.status,
        }

    },
    login: async function ({ email, password }) {
        const user = await User.findOneByEmail(email);

        if (!user) {
            const error = new Error('User not found.');
            error.code = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            const error = new Error('Password is incorrect.');
            error.code = 401;
            throw error;
        }

        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email
        }, 'somesupersecretsecret', {
            expiresIn: '1h'
        });

        return {
            token: token,
            userId: user._id.toString()
        }
    },
    createPost: async function ( { postInput }, req) {

        if (!req.isAuth) {
            const error = new Error('You are not authenticated');
            error.code = 401;
            throw error;
        }

        const title = postInput.title;
        const content = postInput.content;
        const imageUrl = postInput.imageUrl;

        const errors = [];
        if (validator.isEmpty(title) ||
            !validator.isLength(title, { min: 5 })) {
                errors.push({ message: 'Title is invalid.'})
            }
        if (validator.isEmpty(content) || 
            !validator.isLength(content, { min: 5 })) {
                errors.push({ message: 'Content is invalid.'})
            }

        if (errors.length > 0) {
            const error = new Error('Invalid Input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const user = await User.findById(req.userId);

        if (!user) {
            const error = new Error('You are not logged in.');
            error.code = 401;
            throw error;
        }

        const newPost = new Post(
            title,
            content,
            imageUrl
        )

        const savedPost = await user.createPost(newPost);

        if (!savedPost._id) {
            const error = new Error('Post creation failed.');
            error.code = 500;
            throw error;
        }

        return {
            ...savedPost,
            imageUrl: savedPost.imageUrl.replace("\\", "/"),
            createdAt: savedPost.createdAt.toISOString(),
            updatedAt: savedPost.updatedAt.toISOString()
        }
    },
    posts: async function ({ pageNumber }, req) {

        if (!req.isAuth) {
            const error = new Error('Not Authenticated.');
            error.code = 401;
            throw error;
        }

        const page = pageNumber || 1;

        const perPage = 2;

        const totalItems = await Post.countRecords();

        const posts = await Post.fetchSkip((pageNumber - 1) * perPage, perPage);

        return {
            posts: posts.map(p => {
                return {
                    ...p, 
                    _id: p._id.toString(),
                    createdAt: p.createdAt.toISOString(),
                    updatedAt: p.updatedAt.toISOString()
                };
            }),
            totalItems: totalItems
        }
    },
    post: async function ( { id }, req ) {

        if (!req.isAuth) {
            const error = new Error('Not authorized.');
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id);

        return {
            
            ...post,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
            
        }
    },
    updatePost: async function ( { id, postInput }, req ) {
        if (!req.isAuth) {
            const error = new Error('Not authorised.');
            error.code = 401;
            throw error
        }

        const post = await Post.findById(id);

        if (!post) {
            const error = new Error('Post not found');
            error.code = 404;
            throw error;
        }

        if (post.creator._id.toString() !== req.userId.toString() ) {
            const error = new Error('Not authorised to change this post');
            error.code = 401;
            throw error;
        }

        post.title = postInput.title;
        post.content = postInput.content;

        if (postInput.imageUrl !== 'undefined') {        
            post.imageUrl = postInput.imageUrl;
        }

        const savedPost = await post.update();

        console.log(savedPost);

        return {
            ...savedPost,
            _id: savedPost._id.toString(),
            createdAt: savedPost.createdAt.toISOString(),
            updatedAt: savedPost.updatedAt.toISOString()
        }
    },
    deletePost: async function ({ id }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated.');
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id);

        if (req.userId.toString() !== post.creator._id.toString() ) {
            const error = new Error('Not authorised');
            error.code = 403;
            throw error;
        }

        const result = await post.delete();

        clearImage(post.imageUrl);

        return {
            result: true
        }
    },
    user: async function ( args, req ) {
        if (!req.isAuth) {
            const error = new Error('Not Authorised');
            error.code = 401;
            throw error;
        }

        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
            const error = new Error('Could not find User Status');
            error.code = 500;
            throw error;
        }

        return {
            ...user
        }
    },
    updateStatus: async function ( { newStatus }, req ) {
        if (!req.isAuth) {
            const error = new Error('Not Authorised');
            error.code = 401;
            throw error;
        }

        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
            const error = new Error('Could not find User Status');
            error.code = 500;
            throw error;
        }

        user.status = newStatus;
    
        const savedUser = await user.save();

        return {
            result: true
        }
    
    }
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => {console.log(err)});
}