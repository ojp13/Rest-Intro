const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const feedRoutes = require('./routes/feed');

app.use(bodyParser.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
})

app.use('/feed', feedRoutes);

console.log('2');

app.listen(8080);