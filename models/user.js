const db = require('../util/database');

const Post = require('./post');

module.exports = class User {
    constructor(name, id=null) {
        this.name = name,
        this.user_id = id
    }

    save() {
        return db.execute(
            'INSERT INTO users (name) VALUES (?)', 
            [this.name]
            );
    }

    createPost(post) {
        return db.execute(
            'INSERT INTO posts (title, content, imageUrl, user_id) VALUES (?,?,?,?)',
            [
            post.title,
            post.content,
            post.imageUrl,
            this.user_id
            ]
        )
    }

    static findAll() {
        return db.execute('SELECT * FROM users');
    }

    static findById(id) {
        return db.execute('SELECT * FROM users WHERE users.user_id = ?', [id]);
    }

}