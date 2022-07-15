const db = require('../util/database');

const Post = require('./post');

module.exports = class User {
    constructor(name, id=null) {
        this.name = name,
        this.user_id = id
    }

    save() {
        if(!this.user_id) {
            return db.execute(
                'INSERT INTO users (name) VALUES (?)', 
                [this.name]
                );
        }
        return db.execute(
            `UPDATE users
            SET name = ?
            WHERE user_id = ?`,
            [this.name, this.user_id]
        )
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

    getPosts() {
        return db.execute(
            `SELECT * FROM posts WHERE user_id = ?`,
            [this.user_id]
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
                            foundPost.post_id
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
                        const user = new User(foundUser.name, foundUser.user_id);
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
        return db.execute('SELECT * FROM users WHERE users.user_id = ?', [id])
            .then(([result]) => {
                if (result.length == 0) {
                    return new Error('No User Found')
                };
                const foundUser = result[0];
                const user = new User(foundUser.name, foundUser.user_id)
                return user;
            })
            .catch(err => {
                return err
            });
    }

}