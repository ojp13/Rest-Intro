const User = require('../models/user');

const { validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('User validation failed.');
        error.errorStatus = 422;
        throw error;
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User(
                name,
                email,
                hashedPassword
            )
            return user.save();
        })
        .then(([result]) => {
            res.status(201).json({ 
                message: 'User created',
                userId: result.insertId
            })
        })
        .catch(err => {
            next(err);
        })

}