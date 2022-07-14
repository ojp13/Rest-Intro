const db = require('./database');

let createUsers = `CREATE TABLE IF NOT EXISTS users(
    user_id INT UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR (255) NOT NULL
    )`;

let createPosts = `CREATE TABLE IF NOT EXISTS posts(
                    post_id INT UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT,
                    title VARCHAR (255) NOT NULL,
                    imageUrl VARCHAR (255) NOT NULL,
                    user_id INT UNSIGNED NOT NULL,
                    content TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(user_id)
                    )`;


module.exports = createUsers;
module.exports = createPosts;
