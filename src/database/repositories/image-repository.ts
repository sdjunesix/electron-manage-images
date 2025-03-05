// src/database/repositories/ImageRepository.ts
import DatabaseManager from '../index';
import path from 'path';

interface ImageData {
  id?: number;
  filename: string;
  folder_id: number;
  original_path: string;
  current_path: string;
  file_size?: number;
  file_hash?: string;
  mime_type?: string;
  width?: number;
  height?: number;
  creation_date?: string;
  last_modified?: string;
  is_processed?: boolean;
  rating?: number;
}

class ImageRepository {
  private db = DatabaseManager.getDatabase();

  /**
   * Thêm hình ảnh mới hoặc cập nhật hình ảnh đã tồn tại
   */
  addOrUpdateImage(imageData: ImageData): number {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO images 
      (filename, folder_id, original_path, current_path, file_size, file_hash, 
       mime_type, width, height, creation_date, last_modified, is_processed, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      imageData.filename,
      imageData.folder_id,
      imageData.original_path,
      imageData.current_path,
      imageData.file_size || null,
      imageData.file_hash || null,
      imageData.mime_type || null,
      imageData.width || null,
      imageData.height || null,
      imageData.creation_date || null,
      imageData.last_modified || null,
      imageData.is_processed ? 1 : 0,
      imageData.rating || null
    );
    
    return result.lastInsertRowid as number;
  }

  /**
   * Lấy hình ảnh theo đường dẫn
   */
  getByPath(imagePath: string): ImageData | null {
    const stmt = this.db.prepare('SELECT * FROM images WHERE original_path = ? OR current_path = ?');
    return stmt.get(imagePath, imagePath) as ImageData | null;
  }

  /**
   * Lấy hình ảnh theo ID
   */
  getById(imageId: number): ImageData | null {
    const stmt = this.db.prepare('SELECT * FROM images WHERE id = ?');
    return stmt.get(imageId) as ImageData | null;
  }

  /**
   * Lấy tất cả hình ảnh trong một thư mục
   */
  getByFolderId(folderId: number): ImageData[] {
    const stmt = this.db.prepare('SELECT * FROM images WHERE folder_id = ?');
    return stmt.all(folderId) as ImageData[];
  }

  /**
   * Cập nhật đường dẫn hình ảnh khi di chuyển
   */
  updateImagePath(imageId: number, newPath: string): void {
    const stmt = this.db.prepare(`
      UPDATE images 
      SET current_path = ?, 
          filename = ? 
      WHERE id = ?
    `);
    
    stmt.run(newPath, path.basename(newPath), imageId);
  }

  /**
   * Đánh dấu hình ảnh đã được xử lý
   */
  markAsProcessed(imageId: number): void {
    const stmt = this.db.prepare('UPDATE images SET is_processed = 1 WHERE id = ?');
    stmt.run(imageId);
  }

  /**
   * Cập nhật rating của hình ảnh
   */
  updateRating(imageId: number, rating: number): void {
    if (rating < 0 || rating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }
    
    const stmt = this.db.prepare('UPDATE images SET rating = ? WHERE id = ?');
    stmt.run(rating, imageId);
  }

  /**
   * Xóa hình ảnh khỏi database
   */
  deleteImage(imageId: number): void {
    const stmt = this.db.prepare('DELETE FROM images WHERE id = ?');
    stmt.run(imageId);
  }

  /**
   * Cập nhật thông tin chi tiết của hình ảnh
   */
  updateImageMetadata(imageId: number, metadata: Partial<ImageData>): void {
    // Xây dựng câu lệnh UPDATE động dựa trên các trường có giá trị
    const updateFields = Object.keys(metadata)
      .filter(key => metadata[key as keyof Partial<ImageData>] !== undefined)
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!updateFields) return;
    
    const values = Object.keys(metadata)
      .filter(key => metadata[key as keyof Partial<ImageData>] !== undefined)
      .map(key => metadata[key as keyof Partial<ImageData>]);
    
    const stmt = this.db.prepare(`UPDATE images SET ${updateFields} WHERE id = ?`);
    stmt.run(...values, imageId);
  }
}

export default new ImageRepository();
