const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'ADR-Song-History',
  password: 'Blake1337',
});

module.exports = pool.promise();
