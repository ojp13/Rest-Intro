const db = require('../util/database');

module.exports = class Post {
    constructor(title, content, imageUrl, user_id=null, post_id=null) {
        this.title = title,
        this.content = content,
        this.imageUrl = imageUrl,
        this.user_id = user_id,
        this.post_id = post_id
    }

    update() {
        return db.execute(
            `UPDATE posts
            SET title = ?, content = ?, imageUrl = ?
            WHERE post_id = ?`,
            [this.title, this.content, this.imageUrl, this.post_id]);
    }

    static fetchAll() {
        return db.execute('SELECT * FROM products');
    }

    static findById(id) {
        return db.execute('SELECT * FROM products WHERE products.id=?', [id])
    }
};