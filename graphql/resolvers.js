const User = require('../models/user')

const bcrypt = require('bcryptjs');

module.exports = {
    createUser: async function ({ userInput }, req) {
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