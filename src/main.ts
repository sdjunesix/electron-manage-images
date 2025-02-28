import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'fs';
import started from 'electron-squirrel-startup';
import { Image, Node, TreeNode } from './models';
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(`${process.cwd()}/src/sqlite3.db`, (err: string) => {
  if (err) {
    console.error('Error opening database:', err);
  }
});

function addObject(obj: any, targetId: string, newObject: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => addObject(item, targetId, newObject));
  } else if (typeof obj === "object" && obj !== null) {
    if (obj.id === targetId && obj.type === "folder") {
      return { ...obj, children: [...obj.children, newObject] };
    }
    return { ...obj, children: addObject(obj.children, targetId, newObject) };
  }
  return obj;
}

function deleteById(obj: any, targetId: string): any {
  if (Array.isArray(obj)) {
    return obj.filter(item => item.id !== targetId).map(item => deleteById(item, targetId));
  } else if (typeof obj === "object" && obj !== null) {
    return { ...obj, children: deleteById(obj.children, targetId) };
  }
  return obj;
}

function updateById(obj: any, targetId: string, updates: Partial<any>): any {
  if (Array.isArray(obj)) {
    return obj.map(item => updateById(item, targetId, updates));
  } else if (typeof obj === "object" && obj !== null) {
    if (obj.id === targetId) {
      return { ...obj, ...updates };
    }
    return { ...obj, children: updateById(obj.children, targetId, updates) };
  }
  return obj;
}

function getById(obj: any, targetId: string): any | null {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = getById(item, targetId);
      if (result) return result;
    }
  } else if (typeof obj === "object" && obj !== null) {
    if (obj.id === targetId) return obj;
    return getById(obj.children, targetId);
  }
  return null;
}

function getImages(node: any): any[] {
  let images: any[] = [];

  if (node.type === "image") {
      images.push(node);
  }

  if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
          images = images.concat(getImages(child));
      }
  }
  return images;
}

function filterFolders(node: TreeNode): TreeNode | null {
  if (node.type !== "folder") return null;

  const filteredChildren = node.children
    ?.map(filterFolders)
    .filter((child): child is TreeNode => child !== null) || [];

  return { ...node, children: filteredChildren };
}

function getFoldersOnly(tree: TreeNode): TreeNode[] {
  return tree.children
    ?.map(filterFolders)
    .filter((child): child is TreeNode => child !== null) || [];
}

function getFolders(node: any): any[] {
  if (node.type !== "folder" && node.type !== "root") {
    return null; // Exclude non-folder nodes
  }

  return {
    ...node,
    children: node.children
        ? node.children.map(getFolders).filter(Boolean) // Recursively filter children
        : []
  };
}


function updateTree(obj: any, targetId: string, action: "add" | "delete" | "update", payload?: any): any {
  if (Array.isArray(obj)) {
    if (action === "delete") {
      return obj.filter(item => item.id !== targetId).map(item => updateTree(item, targetId, action, payload));
    }
    return obj.map(item => updateTree(item, targetId, action, payload));
  } else if (typeof obj === "object" && obj !== null) {
    if (obj.id === targetId) {
      if (action === "update") return { ...obj, ...payload };
      if (action === "add") return { ...obj, children: [...obj.children, payload] };
    }
    return { ...obj, children: updateTree(obj.children, targetId, action, payload) };
  }
  return obj;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 735,
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
      const query = `INSERT INTO images (id, name, dateAdded, savedFolder, version) VALUES (?, ?, ?, ?, ?)`;
      db.run(query, [image.id, image.name, image.dateAdded, image.savedFolder, image.version], function (err: any) {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
  });

  // Get Image by ID
  // ipcMain.handle('get-image-by-id', async (_, id: string) => {
  //   return new Promise((resolve, reject) => {
  //     const query = `SELECT * FROM images WHERE id = ?`;
  //     db.get(query, [id], (err: any, row: any) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve(row);
  //       }
  //     });
  //   });
  // });

  // Update Image
  ipcMain.handle('update-image', async (_, image: Image) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE images SET name = ?, dateAdded = ?, savedFolder = ?, version = ? WHERE id = ?`;
      db.run(query, [image.name, image.dateAdded, image.savedFolder, image.version, image.id], function (err: any) {
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
    console.log('LISSTTTTTT')
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

  // Insert Node
  ipcMain.handle('insert-node', async (_, treeId: string, parentId: string, value: string) => {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO tree_nodes (tree_id, parent_id, value) VALUES (?, ?, ?)`,
        [treeId, parentId, value],
        function (err: any) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });
  });

  // Update Node
  ipcMain.handle('update-node', async (_, nodeId: string, newValue: string) => {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE tree_nodes SET value = ? WHERE id = ?`,
        [newValue, nodeId],
        function (err: any) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  });

  // Delete Node
  ipcMain.handle('delete-node', async (_, nodeId: string) => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM tree_nodes WHERE id = ?`, [nodeId], function (err: string) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  });

  // Get Node
  ipcMain.handle('select-node', async (_, treeId: string) => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM tree_nodes WHERE tree_id = ?`, [treeId], (err: any, rows: any[]) => {
        if (err) return reject(err);
  
        const nodeMap = new Map();
        let root = null;
        rows.forEach(({ id, parent_id, value }) => {
          nodeMap.set(id, { id, parent_id, value, children: [] });
        });
  
        rows.forEach(({ id, parent_id }) => {
          const node = nodeMap.get(id);
          if (parent_id === null) {
            root = node;
          } else {
            nodeMap.get(parent_id)?.children.push(node);
          }
        });
  
        resolve(root);
      });
    });
  });

  ipcMain.handle('update-caption', async (event, imageId: string, newCaption: string) => {
    const version = await getCurrentVersion(imageId);
    const newVersion = version + 1;
    await createNewVersion(imageId, newVersion, { caption: newCaption });
    await updateImageVersion(imageId, newVersion);
  });

  ipcMain.handle('update-quality', async (event, imageId: string, newQuality: number) => {
    const version = await getCurrentVersion(imageId);
    const newVersion = version + 1;
    await createNewVersion(imageId, newVersion, { quality: newQuality });
    await updateImageVersion(imageId, newVersion);
  });

  ipcMain.handle('update-version', async (event, imageId: string, newVersion: number) => {
    await createNewVersion(imageId, newVersion, {});
    await updateImageVersion(imageId, newVersion);
  });

  ipcMain.handle('update-folder', async (event, imageId: string, newFolder: string) => {
    const version = await getCurrentVersion(imageId);
    const newVersion = version + 1;
    await createNewVersion(imageId, newVersion, { folder: newFolder });
    await updateImageVersion(imageId, newVersion);
  });

  ipcMain.handle('get-image-details-with-versions', async (event, imageId: string) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT images.*, image_versions.version_id, image_versions.version, image_versions.quality, image_versions.dateAdded, image_versions.caption, image_versions.folder
        FROM images
        LEFT JOIN image_versions ON images.id = image_versions.image_id
        WHERE images.id = ?
        ORDER BY image_versions.version ASC
      `, [imageId], (err: any, rows: unknown) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });

  async function getCurrentVersion(imageId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      db.get('SELECT version FROM images WHERE id = ?', [imageId], (err: any, row: { version: number | PromiseLike<number>; }) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.version);
        }
      });
    });
  }

  async function createNewVersion(imageId: string, version: number, fields: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const { caption = null, quality = null, folder = null } = fields;
      db.run(
        `INSERT INTO image_versions (image_id, version, quality, dateAdded, caption, folder) VALUES (?, ?, ?, ?, ?, ?)`,
        [imageId, version, quality, new Date().toISOString(), caption, folder],
        (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async function updateImageVersion(imageId: string, version: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run('UPDATE images SET version = ? WHERE id = ?', [version, imageId], (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Create Image
  ipcMain.handle('update-tree', async (_, obj: any, targetId: string, action: "add" | "delete" | "update", payload?: any) => {
    return new Promise((resolve, reject) => {
      
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
            reject(new Error('Invalid JSON data'));
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
