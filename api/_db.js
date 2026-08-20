const mysql = require("mysql2/promise");

let pool;

function getPool() {
  if (pool) {
    return pool;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured in Vercel.");
  }

  const url = new URL(databaseUrl);

  if (url.protocol !== "mysql:") {
    throw new Error(
      `Invalid DATABASE_URL protocol: ${url.protocol}. Use the Aiven MySQL URI, not MySQLx.`
    );
  }

  pool = mysql.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace("/", "")),

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
