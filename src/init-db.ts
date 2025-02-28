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
  // Create the `images` table based on the `Image` interface
  await db.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dateAdded TIMESTAMP NOT NULL,
      savedFolder TEXT,
      version INTEGER NOT NULL
    );
  `);

  // Create the `image_versions` table to store multiple versions of images
  await db.exec(`
    CREATE TABLE IF NOT EXISTS image_versions (
      version_id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      quality INTEGER NOT NULL CHECK (quality >= 1 AND quality <= 100),
      dateAdded TIMESTAMP NOT NULL,
      caption TEXT,
      folder TEXT,
      FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
    );
  `);

  // Create the `tree` table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tree (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL
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