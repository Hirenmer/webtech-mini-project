const mysql = require("mysql2/promise");

function getPool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not configured.");
  return mysql.createPool({
    uri: url,
    waitForConnections: true,
    connectionLimit: 5,
    ssl: { rejectUnauthorized: false }
  });
}
module.exports = { getPool };
