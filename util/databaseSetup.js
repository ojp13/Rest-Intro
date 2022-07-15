const db = require('./database');

let createUsers = `CREATE TABLE IF NOT EXISTS users(
    _id INT UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR (255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

let createPosts = `CREATE TABLE IF NOT EXISTS posts(
                    _id INT UNSIGNED PRIMARY KEY NOT NULL AUTO_INCREMENT,
                    title VARCHAR (255) NOT NULL,
                    imageUrl VARCHAR (255) NOT NULL,
                    user_id INT UNSIGNED NOT NULL,
                    content TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(_id),
                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
                    )`;

const dbSetup = () => {
    return db.execute(createUsers)
        .then(result => {
            return db.execute(createPosts);
        })
        .then(result => {
            return result
        })
        .catch(err => {
            console.log(err);
            return new Error('Database Connection Failed')
        })
}

module.exports = dbSetup