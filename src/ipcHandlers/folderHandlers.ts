import { ipcMain, dialog, BrowserWindow } from 'electron';
import { db } from '../db/init';
import { addRootFolder, getFolders } from '../db/folderRepository';

export function registerFolderHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    console.log(result)
    const path = result.filePaths[0] || null;
    if (path) {
      return await addRootFolder('test', path);
    }
    return path;

    // ipcMain.handle('get-folders', async () => {
    //   return await getFolders();
    // });
  });
}
