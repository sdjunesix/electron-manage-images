// src/database/repositories/CaptionRepository.ts
import DatabaseManager from '../index';

interface CaptionData {
  id?: number;
  image_id: number;
  ai_service: string;
  caption_text: string;
  generation_date?: string;
  is_manual?: boolean;
  confidence_score?: number;
  prompt_used?: string;
}

class CaptionRepository {
  private db = DatabaseManager.getDatabase();

  /**
   * Thêm caption mới hoặc cập nhật caption đã tồn tại
   */
  addOrUpdateCaption(captionData: CaptionData): number {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO image_captions 
      (image_id, ai_service, caption_text, generation_date, is_manual, confidence_score, prompt_used)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      captionData.image_id,
      captionData.ai_service,
      captionData.caption_text,
      captionData.generation_date || new Date().toISOString(),
      captionData.is_manual ? 1 : 0,
      captionData.confidence_score || null,
      captionData.prompt_used || null
    );
    
    return result.lastInsertRowid as number;
  }

  /**
   * Lấy caption cho một hình ảnh
   */
  getByImageId(imageId: number): CaptionData | null {
    const stmt = this.db.prepare('SELECT * FROM image_captions WHERE image_id = ? ORDER BY generation_date DESC LIMIT 1');
    return stmt.get(imageId) as CaptionData | null;
  }

  /**
   * Lấy tất cả caption cho một hình ảnh
   */
  getAllByImageId(imageId: number): CaptionData[] {
    const stmt = this.db.prepare('SELECT * FROM image_captions WHERE image_id = ? ORDER BY generation_date DESC');
    return stmt.all(imageId) as CaptionData[];
  }

  /**
   * Xóa caption của một hình ảnh
   */
  deleteByImageId(imageId: number): void {
    const stmt = this.db.prepare('DELETE FROM image_captions WHERE image_id = ?');
    stmt.run(imageId);
  }

  /**
   * Xóa caption theo ID
   */
  deleteById(captionId: number): void {
    const stmt = this.db.prepare('DELETE FROM image_captions WHERE id = ?');
    stmt.run(captionId);
  }

  /**
   * Thống kê số lượng caption đã sinh theo dịch vụ AI
   */
  countByAIService(aiService: string): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM image_captions WHERE ai_service = ?');
    const result = stmt.get(aiService) as { count: number };
    return result.count;
  }
}

export default new CaptionRepository();
