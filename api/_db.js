const mysql = require("mysql2/promise");

let pool;

function getPool() {
  if (pool) {
    return pool;
  }

  const required = [
    "DB_HOST",
    "DB_PORT",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME"
  ];

  for (const name of required) {
    if (!process.env[name]) {
      throw new Error(`${name} environment variable is missing.`);
    }
  }

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
      rejectUnauthorized: false
    },

    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  });

  return pool;
}

module.exports = { getPool };
