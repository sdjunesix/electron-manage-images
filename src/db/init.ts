import sqlite3 from 'sqlite3';
import path from 'path';
import { promisify } from 'util';

interface ExtendedDatabase extends sqlite3.Database {
  runAsync: (sql: string, params?: any[]) => Promise<void>;
  allAsync: (sql: string, params?: any[]) => Promise<any[]>;
}

// const dbPath = path.join(`${process.cwd()}/src/`, 'sqlite3.db');
const dbPath = path.join(process.cwd(), 'src/db/sqlite3_ndn.db');
const db = new sqlite3.Database(dbPath) as ExtendedDatabase;

// Convert callback-based SQLite3 to Promise-based
db.runAsync = promisify(db.run.bind(db));
db.allAsync = promisify(db.all.bind(db));

export { db };

export const createDatabase = async () => {
  await db.runAsync('PRAGMA foreign_keys = ON');
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS tree (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      type TEXT CHECK(type IN ('root', 'folder', 'image')) NOT NULL,
      parent_id INTEGER REFERENCES tree(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Database initialized successfully');
};
