import fs from 'fs-extra';
import path from 'path';
import { FolderRepository, ImageRepository } from '../../database/repositories';

class FolderScannerService {
  private imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.svg',
    '.bmp',
    '.tiff',
    '.tif',
    '.heic',
    '.heif',
    '.raw',
    '.arw',
    '.cr2',
    '.nef',
    '.orf',
    '.rw2',
    '.ico',
    '.avif',
    '.jfif',
  ];
  private unassignedFolderId: number | null = null;

  /**
   * Quét thư mục gốc và lưu thông tin vào database
   */
  async scanRootFolder(rootPath: string): Promise<{ totalImages: number; newImages: number }> {
    try {
      console.log(`Bắt đầu quét thư mục: ${rootPath}`);

      // Kiểm tra nếu đây là một thư mục (không phải file)
      const statsCheck = fs.statSync(rootPath);
      if (!statsCheck.isDirectory()) {
        throw new Error(`Đường dẫn không phải là thư mục: ${rootPath}`);
      }

      // Kiểm tra folder có tồn tại không
      if (!fs.existsSync(rootPath)) {
        throw new Error(`Thư mục không tồn tại: ${rootPath}`);
      }

      // Thêm thư mục gốc vào database
      const rootFolder = FolderRepository.getByPath(rootPath);
      let rootFolderId: number;

      if (rootFolder) {
        rootFolderId = rootFolder.id!;
      } else {
        rootFolderId = FolderRepository.addRootFolder(rootPath);
      }

      // Kiểm tra lại để chắc chắn rootFolder đã được lưu
      const checkRoot = FolderRepository.getById(rootFolderId);
      if (!checkRoot) {
        throw new Error(`Thư mục gốc không được lưu đúng cách, id: ${rootFolderId}`);
      }

      // Tạo folder ảo "Unassigned" trong database
      const unassignedFolder = FolderRepository.getDefaultFolderByRoot(rootFolderId);

      if (unassignedFolder) {
        this.unassignedFolderId = unassignedFolder.id!;
      } else {
        // Tạo folder Unassigned trong database (không tạo trên hệ thống file)
        const unassignedPath = path.join(rootPath, 'Unassigned'); // Chỉ dùng để định danh
        this.unassignedFolderId = FolderRepository.addVirtualFolder(
          'Unassigned',
          unassignedPath,
          rootFolderId,
          rootFolderId,
          true // is_default
        );
      }

      // Kiểm tra lại để chắc chắn unassignedFolder đã được lưu
      const checkUnassigned = FolderRepository.getById(this.unassignedFolderId!);
      if (!checkUnassigned) {
        throw new Error(`Folder Unassigned không được lưu đúng cách, id: ${this.unassignedFolderId}`);
      }

      // Quét tất cả các file ảnh
      const stats = await this.scanForImages(rootPath, rootPath);

      console.log(`Quét hoàn tất. Tổng số ảnh: ${stats.totalImages}, Ảnh mới: ${stats.newImages}`);

      // Cập nhật thời gian quét cho thư mục gốc
      FolderRepository.updateLastScanned(rootFolderId);

      return stats;
    } catch (error) {
      console.error('Lỗi khi quét thư mục:', error);
      throw error;
    }
  }

  async reScanRootFolder(rootPath: string): Promise<{ totalImages: number; newImages: number }> {
    try {
      console.log(`Bắt đầu quét lại thư mục: ${rootPath}`);

      // Kiểm tra nếu đây là một thư mục (không phải file)
      const statsCheck = fs.statSync(rootPath);
      if (!statsCheck.isDirectory()) {
        throw new Error(`Đường dẫn không phải là thư mục: ${rootPath}`);
      }

      // Lấy thông tin thư mục gốc
      const rootFolder = FolderRepository.getByPath(rootPath);
      if (!rootFolder || !rootFolder.id) {
        throw new Error(`Không tìm thấy thông tin thư mục gốc: ${rootPath}`);
      }

      const rootFolderId = rootFolder.id;

      // Lấy folder Unassigned
      let unassignedFolder = FolderRepository.getDefaultFolderByRoot(rootFolderId);

      // Nếu không tìm thấy, tạo mới thư mục Unassigned
      if (!unassignedFolder || !unassignedFolder.id) {
        console.log(`Không tìm thấy thư mục Unassigned, đang tạo mới...`);

        // Tạo đường dẫn ảo cho Unassigned
        const unassignedPath = path.join(rootPath, 'Unassigned');
        this.unassignedFolderId = FolderRepository.addVirtualFolder(
          'Unassigned',
          unassignedPath,
          rootFolderId,
          rootFolderId,
          true // is_default
        );
      } else {
        this.unassignedFolderId = unassignedFolder.id;
        console.log(`Đã tìm thấy thư mục Unassigned, id: ${this.unassignedFolderId}`);
      }

      // Kiểm tra lại để chắc chắn unassignedFolder đã được lưu
      const checkUnassigned = FolderRepository.getById(this.unassignedFolderId!);
      if (!checkUnassigned) {
        throw new Error(`Folder Unassigned không được lưu đúng cách, id: ${this.unassignedFolderId}`);
      }

      // Chỉ quét lại hình ảnh
      const stats = await this.scanForImages(rootPath, rootPath);

      // Cập nhật thời gian quét
      FolderRepository.updateLastScanned(rootFolderId);

      return stats;
    } catch (error) {
      console.error('Lỗi khi quét lại thư mục:', error);
      throw error;
    }
  }

  /**
   * Quét đệ quy tìm tất cả file ảnh và thêm vào folder Unassigned
   */
  /**
   * Quét đệ quy tìm tất cả file ảnh và thêm vào folder Unassigned
   */
  private async scanForImages(dirPath: string, rootPath: string): Promise<{ totalImages: number; newImages: number }> {
    let totalImages = 0;
    let newImages = 0;

    try {
      const entries = await fs.readdir(dirPath);

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const stats = await fs.stat(fullPath);

        if (stats.isDirectory()) {
          // Tiếp tục quét thư mục con
          const subStats = await this.scanForImages(fullPath, rootPath);
          totalImages += subStats.totalImages;
          newImages += subStats.newImages;
        } else if (this.isImageFile(fullPath)) {
          totalImages++;

          // Kiểm tra xem ảnh đã tồn tại trong database chưa
          const existingImage = ImageRepository.getByPath(fullPath);

          if (!existingImage && this.unassignedFolderId) {
            // Tạo đường dẫn ảo trong thư mục Unassigned
            const filename = path.basename(fullPath);
            const unassignedPath = path.join(rootPath, 'Unassigned', filename);

            ImageRepository.addOrUpdateImage({
              filename: filename,
              folder_id: this.unassignedFolderId,
              original_path: fullPath, // Đường dẫn thực tế gốc
              current_path: unassignedPath, // Đường dẫn ảo trong Unassigned
              file_size: stats.size,
              last_modified: stats.mtime.toISOString(),
            });

            newImages++;
          }
        }
      }

      return { totalImages, newImages };
    } catch (error) {
      console.error(`Lỗi khi quét thư mục ${dirPath}:`, error);
      return { totalImages, newImages };
    }
  }

  /**
   * Kiểm tra file có phải là ảnh không
   */
  private isImageFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.imageExtensions.includes(ext);
  }
}

export default new FolderScannerService();
