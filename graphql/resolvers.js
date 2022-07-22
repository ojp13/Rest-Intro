const User = require('../models/user');

const validator = require('validator');

const bcrypt = require('bcryptjs');

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


    }
}