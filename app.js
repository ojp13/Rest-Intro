const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const db = require('./util/database');
const dbSetup = require('./util/databaseSetup')
const User = require('./models/user');
const Post = require('./models/post');

const feedRoutes = require('./routes/feed');

app.use(bodyParser.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
})

app.use('/feed', feedRoutes);

const testUser = new User('Oscar');

testUser.save()

User.findById(7)
    .then(([results]) => {
        const result = results[0];
        const user = new User(result.name, result.user_id);
        const post = new Post('Test Posting', 'Test Content', 'www.test.com');
        return user.createPost(post);
    })
    .then(result => {
        console.log(result);
    })
    .catch(err => {
        console.log(err);
    })

app.listen(8080);

