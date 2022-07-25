const User = require('../models/user');

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
    }
}