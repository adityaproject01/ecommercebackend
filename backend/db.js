const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

const caPath = process.env.DB_SSL_CA || "./isrgrootx1.pem";

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    ca: fs.readFileSync(caPath),
    minVersion: "TLSv1.2", // required by TiDB Cloud
    rejectUnauthorized: true,
  },
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to TiDB Cloud via SSL");
  }
});

module.exports = db;
