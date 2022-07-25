const db = require('../util/database');

const Post = require('./post');

module.exports = class User {
    constructor(name, email, password, status='I am new!', _id=null) {
        this.name = name,
        this.email = email, 
        this.password = password,
        this.status = status,
        this._id = _id
    }

    save() {
        if(!this._id) {
            return db.execute(
                'INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, ?)', 
                [this.name, this.email, this.password, this.status]
                )
                .then(([result]) => {
                    return User.findById(result.insertId)
                })
                .catch(err => {
                    console.log(err);
                })
        };
        return db.execute(
            `UPDATE users
            SET name = ?, email = ?, password = ?, status = ?, updated_at = ?
            WHERE _id = ?`,
            [this.name, this.email, this.password, this.status, new Date(), this._id]
        )
    }

    createPost(post) {
        return db.execute(
            'INSERT INTO posts (title, content, imageUrl, user_id) VALUES (?,?,?,?)',
            [
            post.title,
            post.content,
            post.imageUrl,
            this._id
            ]
        )
            .then(([result]) => {
                const postId = result.insertId

                return Post.findById(postId);
            })
            .then(post => {
                return post
            })
            .catch(err => {
                console.log(err);
            })
    }

    getPosts() {
        return db.execute(
            `SELECT * FROM posts WHERE user_id = ?`,
            [this._id]
            )
            .then(([result]) => {
                
                const foundPosts = result;
                const posts = [];

                if (foundPosts.length != 0) {
                    foundPosts.forEach(foundPost => {
                        const post = new Post(
                            foundPost.title, 
                            foundPost.content,
                            foundPost.imageUrl,
                            foundPost.user_id,
                            foundPost._id
                            );
                            posts.push(post);
                    })
                }

                return posts;

            })
            .catch(err => {
                console.log(err);
            })
    }

    static findAll() {
        return db.execute('SELECT * FROM users')
            .then(([result]) => {

                const foundUsers = result;
                const users = [];

                if (result.length != 0) {
                    foundUsers.forEach(foundUser => {
                        const user = new User(
                            foundUser.name, 
                            foundUser.email,
                            foundUser.password,
                            foundUser.status,
                            foundUser._id
                        );
                        users.push(user);
                    });
                };

                return users;
            })
            .catch(err => {
                return err
            });
    }

    static findById(id) {
        return db.execute('SELECT * FROM users WHERE users._id = ?', [id])
            .then(([result]) => {
                if (result.length != 1) {
                    return new Error('No User Found')
                };
                const foundUser = result[0];
                const user = new User(
                    foundUser.name,
                    foundUser.email,
                    foundUser.password,
                    foundUser.status,
                    foundUser._id
                )
                return user;
            })
            .catch(err => {
                const error = new Error(err.message);
                error.code = 500;
                next(error);
            });
    }

    static findOneByEmail(value) {
        return db.execute(
            `SELECT * FROM users
            WHERE email = ?
            LIMIT 1`,
            [value]
            )
            .then(([result]) => {
                if (result.length == 0) {
                    return null
                }
                const foundUser = result[0];
                const user = new User(
                    foundUser.name,
                    foundUser.email,
                    foundUser.password,
                    foundUser.status,
                    foundUser._id
                    )
                return user;
            })
            .catch(err => {
                console.log(err);
                next(err);
            })
    }

}