import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

// Define the database file path
const dbPath = path.join(__dirname, 'sqlite3.db');

// Ensure the database file exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, "");
}

let db = new sqlite3.Database(`${process.cwd()}/src/sqlite3.db`, (err: any) => {
  if (err) {
    console.error('Error opening database:', err);
  }
});

// Initialize database
async function initDatabase() {
  // Create the `tree` table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tree (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      name TEXT,
      path TEXT
    );
  `);

  console.log("Database initialized.");
}

// Run the initialization
async function main() {
  try {
    await initDatabase();
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export {db, initDatabase}

main();