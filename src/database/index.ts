import { app } from 'electron';
import sqlite3 from 'better-sqlite3';
import path from 'path';
import fs from 'fs-extra';
import { DB_NAME } from '../config/environment';

class DatabaseManager {
  private static instance: DatabaseManager;
  private db: sqlite3.Database;
  private dbPath: string;
  private initialized: boolean = false;

  private constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, DB_NAME);

    fs.ensureDirSync(path.dirname(this.dbPath));

    this.db = new sqlite3(this.dbPath, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
    });

    // enable foreign keys
    this.db.pragma('foreign_keys = ON');
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public initialize(): void {
    if (this.initialized) return;

    this.createTables();
    this.initialized = true;
  }

  private createTables(): void {
    const createFoldersTable = `
      CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        full_path TEXT UNIQUE NOT NULL,
        parent_folder_id INTEGER,
        root_folder_id INTEGER,
        is_root BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_scanned DATETIME,
        FOREIGN KEY (parent_folder_id) REFERENCES folders(id),
        FOREIGN KEY (root_folder_id) REFERENCES folders(id)
      )
    `;

    const createImagesTable = `
      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        folder_id INTEGER NOT NULL,
        original_path TEXT NOT NULL,
        current_path TEXT NOT NULL,
        file_size INTEGER,
        file_hash TEXT,
        mime_type TEXT,
        width INTEGER,
        height INTEGER,
        creation_date DATETIME,
        last_modified DATETIME,
        is_processed BOOLEAN DEFAULT 0,
        rating INTEGER CHECK (rating BETWEEN 0 AND 5),
        FOREIGN KEY (folder_id) REFERENCES folders(id)
      )
    `;

    const createImageCaptionsTable = `
      CREATE TABLE IF NOT EXISTS image_captions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_id INTEGER NOT NULL,
        ai_service TEXT NOT NULL,
        caption_text TEXT,
        generation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_manual BOOLEAN DEFAULT 0,
        confidence_score REAL,
        prompt_used TEXT,
        FOREIGN KEY (image_id) REFERENCES images(id)
      )
    `;

    const createImageTagsTable = `
      CREATE TABLE IF NOT EXISTS image_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_id INTEGER NOT NULL,
        tag_name TEXT NOT NULL,
        tag_type TEXT,
        FOREIGN KEY (image_id) REFERENCES images(id),
        UNIQUE(image_id, tag_name)
      )
    `;

    const createAIServicesTable = `
      CREATE TABLE IF NOT EXISTS ai_services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_name TEXT UNIQUE NOT NULL,
        api_key TEXT NOT NULL,
        endpoint_url TEXT,
        current_quota INTEGER DEFAULT 0,
        max_quota INTEGER,
        last_used DATETIME,
        is_active BOOLEAN DEFAULT 1
      )
    `;

    const createActivityLogsTable = `
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        old_path TEXT,
        new_path TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.exec(createFoldersTable);
    this.db.exec(createImagesTable);
    this.db.exec(createImageCaptionsTable);
    this.db.exec(createImageTagsTable);
    this.db.exec(createAIServicesTable);
    this.db.exec(createActivityLogsTable);

    this.db.exec('CREATE INDEX IF NOT EXISTS idx_images_folder ON images(folder_id)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_images_path ON images(original_path)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_folder_id)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_captions_image ON image_captions(image_id)');
  }

  public getDatabase(): sqlite3.Database {
    return this.db;
  }

  public close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}

export default DatabaseManager.getInstance();
