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

let mainUser;
let mainPost;

dbSetup()
    .then(result => {
        // const user = new User('o');
        // return user.save();
        return Post.findById(1);
    })
    .then(post => {
        
    })
    .catch(err => {
    })


app.listen(8080);

