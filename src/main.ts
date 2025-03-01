import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'fs';
import started from 'electron-squirrel-startup';
import { Image, Node, TreeNode } from './models';
// import { db, createDatabase } from './db/init';
import { db, initDatabase } from './init-db'
// import { addRootFolder } from './db/folderRepository';
import {  
  addObject,
  deleteById,
  updateById,
  getById,
  getImages,
  filterFolders,
  getFoldersOnly,
  getFolders,
  updateTree
} from './common'

let mainWindow: BrowserWindow;

if (started) {
  app.quit();
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.openDevTools();
};
app.on('ready', async () => {
  try {
    await initDatabase();
    createWindow();
    // registerFolderHandlers(mainWindow);
  } catch (error) {
    console.error("Error create table db:", error);
  }
});


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

app.on('will-quit', (event) => {
  if (db) {
    event.preventDefault();
    
    db.close((err: any) => {
      if (err) {
        console.error('Error closing database:', err.message);
      }

      app.exit(0);
    });
  }
});

process.on('SIGINT', () => {
  console.log('Received SIGINT signal');
  if (db) {
    db.close((err: any) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database closed successfully');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// select root folder & set root folder
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  const path = result.filePaths[0] || null;

  if (path) {
    db.get('UPDATE tree SET path = ? WHERE id = ?', [path, 1], (err: any, row: any) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database closed successfully');
      }
    })
  }

  return path;
});

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

ipcMain.handle('get-root', async () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT data FROM tree WHERE id = ?', [1], (err: any, row: any) => {
      if (err) {
        return reject(new Error('Root not found'));
      } else {
        try {
          const root = JSON.parse(row.data);
          resolve(root);
        } catch (parseError) {
          reject(new Error('Invalid JSON data NOTHING IN >>>'));
        }
      }
    });
    
  });
});

ipcMain.handle('update-tree-data', async (_, id: number = 1, data: string) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE tree SET data = ? WHERE id = ?', [data, id], (updateErr: any) => {
      if (updateErr) {
        return reject(new Error('Error updating tree data'));
      } else {
        resolve({ success: true });
      }
    });
  });
});

ipcMain.handle('get-images', async () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT data FROM tree WHERE id = ?', [1], (err: any, row: any) => {
      if (err) {
        return reject(new Error('Root not found'));
      } else {
        try {
          const root = JSON.parse(row.data);
          const images = getImages(root);
          resolve(images);
        } catch (parseError) {
          reject(new Error('Invalid JSON data NOTHING IN >>>'));
        }
      }
    });
    
  });
});

ipcMain.handle('get-image-by-id', async (_, imageId: string) => {
  return new Promise((resolve, reject) => {
    nedb.findOne({ id: "root" }, (err: any, root: unknown) => {
      if (err || !root) reject(new Error("Root not found"));
      else {
        const images = getById(root, imageId)
        resolve(images)
      };
    });
  });
});

ipcMain.handle('get-folders', async () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT data FROM tree WHERE id = ?', [1], (err: any, row: any) => {
      if (err) {
        return reject(new Error('Root not found'));
      } else {
        try {
          const root = JSON.parse(row.data);
          const folders = getFoldersOnly(root);
          resolve(folders);
        } catch (parseError) {
          reject(new Error('Invalid JSON data'));
        }
      }
    });
  });
});

ipcMain.handle('update-image-quality', async (_, obj: any, targetId: string, action: "update", payload?: any) => {
  return new Promise((resolve, reject) => {
    nedb.findOne({ id: "root" }, (err: any, root: unknown) => {
      if (err || !root) reject(new Error("Root not found"));
      else {
        const images = updateTree(root, targetId, action, payload)
        resolve(images)
      };
    });
  });
});

ipcMain.handle('update-image-caption', async (_, obj: any, targetId: string, action: "update", payload?: any) => {
  return new Promise((resolve, reject) => {
    nedb.findOne({ id: "root" }, (err: any, root: unknown) => {
      if (err || !root) reject(new Error("Root not found"));
      else {
        const images = updateTree(root, targetId, action, payload)
        resolve(images)
      };
    });
  });
});

ipcMain.handle('update-image-version', async (_, obj: any, targetId: string, action: "add" | "delete" | "update", payload?: any) => {
  return new Promise((resolve, reject) => {
    nedb.findOne({ id: "root" }, (err: any, root: unknown) => {
      if (err || !root) reject(new Error("Root not found"));
      else {
        const images = updateTree(root, targetId, action, payload)
        resolve(images)
      };
    });
  });
});