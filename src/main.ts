import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'fs';
import started from 'electron-squirrel-startup';
import { Image } from './models/Image';
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(`${process.cwd()}/src/sqlite3.db`, (err: string) => {
  if (err) {
    console.error('Error opening database:', err);
  }
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Handle folder selection request
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });
    return result.filePaths[0] || null;
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  ipcMain.handle('select-files', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
    });
    return result.filePaths;
  });

  ipcMain.handle('move-files', async (_, files, rootFolder) => {
    if (!rootFolder) {
      throw new Error('No root folder selected.');
    }

    const movedFiles = [];

    for (const file of files) {
      const fileName = path.basename(file);
      const destination = path.join(rootFolder, fileName);

      try {
        fs.renameSync(file, destination);
        movedFiles.push(destination);
      } catch (error) {
        console.error(`Error moving file ${file}:`, error);
        return { success: false, error: error.message };
      }
    }

    return { success: true, movedFiles };
  });

  // Create Image
  ipcMain.handle('create-image', async (_, image: Image) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO images (id, name, dateAdded, savedFolder, isCaptioned, version, quality) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.run(query, [image.id, image.name, image.dateAdded, image.savedFolder, image.isCaptioned, image.version, image.quality], function (err: any) {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
  });

  // Get Image by ID
  ipcMain.handle('get-image-by-id', async (_, id: string) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM images WHERE id = ?`;
      db.get(query, [id], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  });

  // Update Image
  ipcMain.handle('update-image', async (_, image: Image) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE images SET name = ?, dateAdded = ?, savedFolder = ?, isCaptioned = ?, version = ?, quality = ? WHERE id = ?`;
      db.run(query, [image.name, image.dateAdded, image.savedFolder, image.isCaptioned, image.version, image.quality, image.id], function (err: any) {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
  });

  // Delete Image
  ipcMain.handle('delete-image', async (_, id: string) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM images WHERE id = ?`;
      db.run(query, [id], function (err: any) {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
  });

  // List Images
  ipcMain.handle('list-images', async () => {
    return new Promise<Image[]>((resolve, reject) => {
      const query = `SELECT * FROM images`;
      db.all(query, [], (err: any, rows: Image[]) => {
        if (err) {
          reject(err);
        } else {
          console.log('TABLES',rows);
          resolve(rows);
        }
      });
    });
  });

  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
