import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

// Define the database file path
const dbPath = path.join(__dirname, 'sqlite3.db');

// Ensure the database file exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, "");
}

let db = new sqlite3.Database(dbPath);

// Initialize database
async function initDatabase() {
  // Create the `images` table based on the `Image` interface
  await db.exec(`
    CREATE TABLE IF NOT EXISTS image (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dateAdded TIMESTAMP NOT NULL,
      savedFolder TEXT,
      isCaptioned BOOLEAN NOT NULL,
      version INTEGER NOT NULL,
      quality INTEGER NOT NULL CHECK (quality >= 1 AND quality <= 100)
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

main();