const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

// Determine SSL certificate
let sslOptions;

if (process.env.DB_SSL_CA_CONTENT) {
  // Vercel or env variable usage
  sslOptions = {
    ca: process.env.DB_SSL_CA_CONTENT
  };
} else if (process.env.DB_SSL_CA_PATH) {
  // Local file usage
  sslOptions = {
    ca: fs.readFileSync(process.env.DB_SSL_CA_PATH)
  };
} else {
  sslOptions = null;
}

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: sslOptions // <-- important for TiDB Cloud
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected to TiDB Database');
  }
});

module.exports = db;
