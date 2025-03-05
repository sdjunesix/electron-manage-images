import { ipcMain } from 'electron';
import fs from 'fs-extra';
import { FolderRepository } from '../../database/repositories';
import { FolderScannerService } from '../services';

export default function registerFolderHandlers() {
  // Xử lý sự kiện nhập đường dẫn root folder
  ipcMain.handle('set-root-folder', async (_, folderPath: string) => {
    try {
      // Kiểm tra đường dẫn có hợp lệ không
      if (!folderPath || folderPath.trim() === '') {
        return { success: false, error: 'Đường dẫn không được để trống' };
      }

      // Quét thư mục
      const result = await FolderScannerService.scanRootFolder(folderPath);

      return {
        success: true,
        data: {
          rootPath: folderPath,
          ...result,
        },
      };
    } catch (error) {
      console.error('Error setting root folder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định',
      };
    }
  });

  // Quét lại folder
  ipcMain.handle('re-scan-root-folder', async (_, folderPath: string) => {
    try {
      if (!folderPath || folderPath.trim() === '') {
        return { success: false, error: 'Đường dẫn không được để trống' };
      }

      const result = await FolderScannerService.reScanRootFolder(folderPath);

      return {
        success: true,
        data: {
          rootPath: folderPath,
          ...result,
        },
      };
    } catch (error) {
      console.error('Error rescanning root folder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định',
      };
    }
  });

  // Kiểm tra đường dẫn có phải là thư mục không
  ipcMain.handle('is-directory', async (_, filePath: string) => {
    try {
      if (!fs.existsSync(filePath)) {
        return false;
      }
      const stats = fs.statSync(filePath);
      return stats.isDirectory();
    } catch (error) {
      console.error('Error checking if path is directory:', error);
      return false;
    }
  });

  // Lấy danh sách root folder
  ipcMain.handle('get-root-folders', async () => {
    try {
      const rootFolders = FolderRepository.getAllRootFolders();
      return { success: true, data: rootFolders };
    } catch (error) {
      console.error('Error getting root folders:', error);
      return { success: false, error: 'Lỗi khi lấy danh sách thư mục gốc' };
    }
  });

  // Lấy thông tin của một folder dựa vào ID
  ipcMain.handle('get-folder-by-id', async (_, folderId: number) => {
    try {
      const folder = FolderRepository.getById(folderId);
      return { success: true, data: folder };
    } catch (error) {
      console.error('Error getting folder by id:', error);
      return { success: false, error: 'Lỗi khi lấy thông tin thư mục' };
    }
  });

  // Lấy folder theo đường dẫn
  ipcMain.handle('get-folder-by-path', async (_, folderPath: string) => {
    try {
      const folder = FolderRepository.getByPath(folderPath);
      return { success: true, data: folder };
    } catch (error) {
      console.error('Error getting folder by path:', error);
      return { success: false, error: 'Lỗi khi lấy thông tin thư mục' };
    }
  });

  // Lấy tất cả các thư mục con trực tiếp của một thư mục
  ipcMain.handle('get-child-folders', async (_, folderId: number) => {
    try {
      const childFolders = FolderRepository.getChildFolders(folderId);
      return { success: true, data: childFolders };
    } catch (error) {
      console.error('Error getting child folders:', error);
      return { success: false, error: 'Lỗi khi lấy danh sách thư mục con' };
    }
  });

  // Lấy tất cả thư mục con trực tiếp của một root folder
  ipcMain.handle('get-direct-subfolders', async (_, rootFolderId: number) => {
    try {
      const subfolders = FolderRepository.getChildFoldersByRootId(rootFolderId);
      return { success: true, data: subfolders };
    } catch (error) {
      console.error('Error getting direct subfolders:', error);
      return { success: false, error: 'Lỗi khi lấy danh sách thư mục con' };
    }
  });

  // Lấy tất cả thư mục trong root folder (dạng list phẳng)
  ipcMain.handle('get-all-folders-by-root', async (_, rootFolderId: number) => {
    try {
      const folders = FolderRepository.getAllFoldersByRootId(rootFolderId);
      return { success: true, data: folders };
    } catch (error) {
      console.error('Error getting all folders by root:', error);
      return { success: false, error: 'Lỗi khi lấy danh sách thư mục' };
    }
  });

  // Lấy cấu trúc thư mục dạng cây
  ipcMain.handle('get-folder-tree', async (_, rootFolderId: number) => {
    try {
      const folderTree = FolderRepository.getFolderTree(rootFolderId);
      return { success: true, data: folderTree };
    } catch (error) {
      console.error('Error getting folder tree:', error);
      return { success: false, error: 'Lỗi khi lấy cấu trúc thư mục' };
    }
  });

  // Lấy tất cả các thư mục con của một thư mục
  ipcMain.handle('get-subfolders', async (_, folderId: number) => {
    try {
      const subfolders = FolderRepository.getChildFolders(folderId);
      return { success: true, data: subfolders };
    } catch (error) {
      console.error('Error getting subfolders:', error);
      return { success: false, error: 'Lỗi khi lấy danh sách thư mục con' };
    }
  });
}
