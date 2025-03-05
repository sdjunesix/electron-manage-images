import DatabaseManager from '../index';
import path from 'path';

interface FolderData {
  id?: number;
  name: string;
  full_path: string;
  parent_folder_id?: number | null;
  root_folder_id?: number | null;
  is_root?: boolean;
  created_at?: string;
  last_scanned?: string | null;
}

class FolderRepository {
  private db = DatabaseManager.getDatabase();

  /**
   * Thêm thư mục mới hoặc cập nhật thư mục đã tồn tại
   */
  addOrUpdateFolder(folderData: FolderData): number {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO folders 
      (name, full_path, parent_folder_id, root_folder_id, is_root, last_scanned)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      folderData.name,
      folderData.full_path,
      folderData.parent_folder_id || null,
      folderData.root_folder_id || null,
      folderData.is_root ? 1 : 0,
      folderData.last_scanned || null
    );
    
    return result.lastInsertRowid as number;
  }

  /**
   * Thêm thư mục gốc mới
   */
  addRootFolder(folderPath: string): number {
    const rootFolder: FolderData = {
      name: path.basename(folderPath),
      full_path: folderPath,
      is_root: true,
      last_scanned: new Date().toISOString()
    };
    
    const result = this.addOrUpdateFolder(rootFolder);
    
    // Cập nhật root_folder_id với chính ID của folder này
    const updateStmt = this.db.prepare(`
      UPDATE folders SET root_folder_id = ? WHERE id = ?
    `);
    updateStmt.run(result, result);
    
    return result;
  }

  /**
   * Thêm thư mục con
   */
  addChildFolder(folderPath: string, parentFolderId: number, rootFolderId: number): number {
    const childFolder: FolderData = {
      name: path.basename(folderPath),
      full_path: folderPath,
      parent_folder_id: parentFolderId,
      root_folder_id: rootFolderId,
      is_root: false
    };
    
    return this.addOrUpdateFolder(childFolder);
  }

  /**
   * Lấy thư mục theo đường dẫn
   */
  getByPath(folderPath: string): FolderData | null {
    const stmt = this.db.prepare('SELECT * FROM folders WHERE full_path = ?');
    return stmt.get(folderPath) as FolderData | null;
  }

  /**
   * Lấy thư mục theo ID
   */
  getById(folderId: number): FolderData | null {
    const stmt = this.db.prepare('SELECT * FROM folders WHERE id = ?');
    return stmt.get(folderId) as FolderData | null;
  }

  /**
   * Lấy tất cả thư mục gốc
   */
  getAllRootFolders(): FolderData[] {
    const stmt = this.db.prepare('SELECT * FROM folders WHERE is_root = 1');
    return stmt.all() as FolderData[];
  }

  /**
   * Lấy các thư mục con trực tiếp
   */
  getChildFolders(parentFolderId: number): FolderData[] {
    const stmt = this.db.prepare('SELECT * FROM folders WHERE parent_folder_id = ?');
    return stmt.all(parentFolderId) as FolderData[];
  }

  /**
   * Cập nhật thời gian quét folder
   */
  updateLastScanned(folderId: number): void {
    const stmt = this.db.prepare(`
      UPDATE folders SET last_scanned = ? WHERE id = ?
    `);
    stmt.run(new Date().toISOString(), folderId);
  }

  /**
   * Xóa thư mục khỏi database
   */
  deleteFolder(folderId: number): void {
    // Xóa các thư mục con trước
    const childFolders = this.getChildFolders(folderId);
    for (const child of childFolders) {
      if (child.id) this.deleteFolder(child.id);
    }
    
    // Xóa thư mục chính
    const stmt = this.db.prepare('DELETE FROM folders WHERE id = ?');
    stmt.run(folderId);
  }
}

export default new FolderRepository();
