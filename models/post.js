const db = require('../util/database');

module.exports = class Post {
    constructor(title, content, imageUrl, user_id=null, _id=null, creator=null, createdAt=null) {
        this.title = title,
        this.content = content,
        this.imageUrl = imageUrl,
        this.user_id = user_id,
        this._id = _id,
        this.creator = creator,
        this.createdAt = createdAt
    }

    update() {
        return db.execute(
            `UPDATE posts
            SET title = ?, content = ?, imageUrl = ?, updated_at = ?
            WHERE _id = ?`,
            [this.title, this.content, this.imageUrl, new Date(), this._id]);
    }

    delete() {
        return db.execute(
            `DELETE FROM posts
            WHERE _id = ?`,
            [this._id]
        )
    }

    static fetchAll() {
        return db.execute(
            `SELECT posts.*, users._id AS user_id, users.name AS user_name FROM posts
            INNER JOIN users on posts.user_id = users._id`
        )
            .then(([foundPosts]) => {
                const posts = [];
                foundPosts.forEach(foundPost => {
                    
                const post = new Post(
                    foundPost.title, 
                    foundPost.content, 
                    foundPost.imageUrl, 
                    foundPost.user_id, 
                    foundPost._id, 
                    {
                        name: foundPost.user_name,
                        _id: foundPost.user_id
                    },
                    new Date(foundPost.created_at)
                    );

                posts.push(post);

                })

                return posts;
            })
            .catch(err => {
                console.log(err);
            })
    }

    static findById(id) {
        return db.execute(`
            SELECT posts.*, users._id AS user_id, users.name AS user_name FROM posts
            INNER JOIN users ON posts.user_id=users._id 
            WHERE posts._id=?`, 
            [id]
            )
        .then(([result]) => {
            if (result.length != 1) {
                return new Error('No Post Found')
            };
            const foundPost = result[0];
            const post = new Post(
                foundPost.title, 
                foundPost.content, 
                foundPost.imageUrl, 
                foundPost.user_id, 
                foundPost._id, 
                {
                    name: foundPost.user_name,
                    _id: foundPost.user_id
                },
                new Date(foundPost.created_at)
                );
            return post;
        })
        .catch(err => {
            return err
        });
    };

    static countRecords() {
        return db.execute(
            `SELECT COUNT(*) as count
            FROM posts`
        )
        .then(([result]) => {
            return result[0].count;
        })
        .catch(err => {
            console.log(err);
        })
    }

    static fetchSkip(skip, limit) {
        return db.execute(
            `SELECT * FROM posts
            LIMIT ? OFFSET ?`,
            [limit.toString(), skip.toString()]
            )
            .then(([foundPosts]) => {
                const posts = [];
                foundPosts.forEach(foundPost => {
                    
                const post = new Post(
                    foundPost.title, 
                    foundPost.content, 
                    foundPost.imageUrl, 
                    foundPost.user_id, 
                    foundPost._id, 
                    {
                        name: foundPost.user_name,
                        _id: foundPost.user_id
                    },
                    new Date(foundPost.created_at)
                    );

                posts.push(post);

                })

                return posts;
            })
            .catch(err => {
                console.log(err);
            })
    }
};