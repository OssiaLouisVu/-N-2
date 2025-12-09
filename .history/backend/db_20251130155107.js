// backend/db.js
const mysql = require("mysql2/promise");

// Prefer environment variables, fallback to current local defaults
require('dotenv').config();
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456789",
    database: process.env.DB_NAME || "english_center",
    connectionLimit: Number(process.env.DB_POOL || 10),
    // Cho phép chạy nhiều câu lệnh trong file migration (dev only)
    multipleStatements: true,
});

module.exports = pool;