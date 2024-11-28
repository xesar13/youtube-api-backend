const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    displayName TEXT,
    emails TEXT,
    photos TEXT,
    accessToken TEXT,
    refreshToken TEXT
  )`);
});

module.exports = db;