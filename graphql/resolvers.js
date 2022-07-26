const User = require('../models/user');
const Post = require('../models/post');

const validator = require('validator');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

        console.log(savedPost)

        if (!savedPost._id) {
            const error = new Error('Post creation failed.');
            error.code = 500;
            throw error;
        }

        return {
            _id: savedPost._id,
            title: savedPost.title,
            content: savedPost.content,
            imageUrl: savedPost.imageUrl,
            creator: savedPost.creator,
            createdAt: savedPost.createdAt,
            updatedAt: savedPost.updatedAt
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

        console.log({
            ...post,
            _id: post._id.toString()
        });

        return {
            
            ...post,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
            
        }
    }
}