import mysql from 'mysql2';
import 'dotenv/config'

console.log('db connect', {DB_HOST: process.env.DB_HOST});

const db_connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
});

export default db_connection;