// backend/db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root", // đổi theo MySQL của bạn
    password: "123456789", // đổi theo MySQL của bạn
    database: "english_center", // tên CSDL thật
    connectionLimit: 10,
});

module.exports = pool;