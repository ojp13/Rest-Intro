const mysql = require ('mysql2');

const pool = mysql.createPool({
    database: 'node-complete',
    user: 'root',
    password: 'f1n4nM3rc!$$',
    host: 'localhost', 
});

module.exports = pool.promise();