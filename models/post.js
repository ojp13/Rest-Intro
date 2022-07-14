const db = require('../util/database');

module.exports = class Post {
    constructor(title, content, imageUrl, userId=null) {
        this.title = title,
        this.content = content,
        this.imageUrl = imageUrl,
        this.userId = userId
    }

    save() {
        return db.execute('INSERT INTO posts (title, content, imageUrl, userId) VALUES (?, ?, ?, ?)', [this.title, this.content, this.imageUrl, this.userId]);
    }

    static fetchAll() {
        return db.execute('SELECT * FROM products');
    }

    static findById(id) {
        return db.execute('SELECT * FROM products WHERE products.id=?', [id])
    }
};