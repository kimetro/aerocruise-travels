const Database = require("better-sqlite3");

// Creates/opens bookings.db in project root
const db = new Database("bookings.db");

// Create table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pnr TEXT,
    firstName TEXT,
    lastName TEXT,
    email TEXT,
    phone TEXT,
    origin TEXT,
    destination TEXT,
    departureDate TEXT,
    returnDate TEXT,
    price TEXT,
    currency TEXT,
    createdAt TEXT
  )
`).run();

module.exports = db;
