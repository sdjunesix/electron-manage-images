// src/main/ipc-handlers/image-handler.ts
import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import { ImageRepository, CaptionRepository, FolderRepository } from '../../database/repositories';

export default function registerImageHandlers() {
  // Lấy tất cả ảnh trong một folder
  ipcMain.handle('get-images-by-folder', async (_, folderId: number) => {
    try {
      const images = ImageRepository.getByFolderId(folderId);
      return { success: true, data: images };
    } catch (error) {
      console.error('Error getting images by folder:', error);
      return { success: false, error: 'Lỗi khi lấy danh sách ảnh' };
    }
  });

  // Lấy thông tin chi tiết của một ảnh
  ipcMain.handle('get-image-by-id', async (_, imageId: number) => {
    try {
      const image = ImageRepository.getById(imageId);
      return { success: true, data: image };
    } catch (error) {
      console.error('Error getting image by ID:', error);
      return { success: false, error: 'Lỗi khi lấy thông tin ảnh' };
    }
  });

  // Lấy caption của một ảnh
  ipcMain.handle('get-image-caption', async (_, imageId: number) => {
    try {
      const caption = CaptionRepository.getByImageId(imageId);
      return { success: true, data: caption };
    } catch (error) {
      console.error('Error getting image caption:', error);
      return { success: false, error: 'Lỗi khi lấy caption của ảnh' };
    }
  });

  // Cập nhật rating của một ảnh
  ipcMain.handle('update-image-rating', async (_, imageId: number, rating: number) => {
    try {
      if (rating < 0 || rating > 5) {
        return { success: false, error: 'Rating phải từ 0 đến 5' };
      }

      ImageRepository.updateRating(imageId, rating);
      return { success: true };
    } catch (error) {
      console.error('Error updating image rating:', error);
      return { success: false, error: 'Lỗi khi cập nhật rating' };
    }
  });

  // Di chuyển ảnh sang thư mục khác
  ipcMain.handle('move-image-to-folder', async (_, imageId: number, targetFolderId: number) => {
    try {
      // Lấy thông tin ảnh
      const image = ImageRepository.getById(imageId);
      if (!image) {
        return { success: false, error: 'Không tìm thấy ảnh' };
      }

      // Lấy thông tin folder đích
      const targetFolder = FolderRepository.getById(targetFolderId);
      if (!targetFolder) {
        return { success: false, error: 'Không tìm thấy thư mục đích' };
      }

      // Tạo đường dẫn mới
      const filename = path.basename(image.original_path);
      const newPath = path.join(targetFolder.full_path, filename);

      // Cập nhật trong database
      ImageRepository.moveImageToFolder(imageId, targetFolderId, newPath);

      return { success: true };
    } catch (error) {
      console.error('Error moving image to folder:', error);
      return { success: false, error: 'Lỗi khi di chuyển ảnh' };
    }
  });

  // Đọc file hình ảnh
  ipcMain.handle('read-image-file', async (_, imagePath: string) => {
    try {
      if (!fs.existsSync(imagePath)) {
        return {
          success: false,
          error: 'File không tồn tại',
        };
      }

      // Đọc file dưới dạng base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = getMimeTypeFromPath(imagePath);

      return {
        success: true,
        data: {
          base64: `data:${mimeType};base64,${base64Image}`,
          path: imagePath,
        },
      };
    } catch (error) {
      console.error('Error reading image file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi khi đọc file ảnh',
      };
    }
  });

  // Hàm phụ trợ để xác định MIME type dựa vào đuôi file
  function getMimeTypeFromPath(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.bmp':
        return 'image/bmp';
      case '.webp':
        return 'image/webp';
      case '.svg':
        return 'image/svg+xml';
      default:
        return 'application/octet-stream';
    }
  }
}
