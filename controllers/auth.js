const User = require('../models/user');

const { validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

exports.login = (req, res, next) => {
    
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    return User.findOneByEmail(email)
        .then(user => {
            if (!user) {
                const error = new Error('This User could not be found.');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;

            return bcrypt.compare(password, loadedUser.password);

        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Incorrect Password.');
                error.statusCode = 401;
                throw error;
            }

            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, 'secret',
            { expiresIn: '1h' });

            return res.status(200).json({
                userId: loadedUser._id,
                token: token
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

};