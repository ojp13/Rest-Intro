const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/auth');
const User = require('../models/user');

router.put('/signup',[
    body('email', 'Please enter a valid email')
        .isEmail()
        .normalizeEmail()
        .custom(value => {
            return User.findOneByEmail(value)
                .then(user => {
                    if (user) {
                        return Promise.reject('Email address already exists.')
                    }
                })
        }),
    body('password')
        .trim()
        .isLength({ min: 5 }),
    body('name')
        .trim()
        .not()
        .isEmpty()
    ],
    authController.signup
    )

router.post('/login', authController.login)

module.exports = router;