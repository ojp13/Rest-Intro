const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const isAuth = require('../middleware/isAuth');

const feedController = require('../controllers/feed');

router.get('/posts', isAuth, feedController.getPosts);

router.post('/post', [
    body('title', 'Invalid Title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], isAuth, feedController.postPost);

router.get('/post/:postId', isAuth, feedController.getPost);

router.put('/post/:postId', [
    body('title', 'Invalid Title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], isAuth, feedController.updatePost);

router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;