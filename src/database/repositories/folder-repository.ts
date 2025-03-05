import path from 'path';
import { db } from '../index';

interface FolderData {
  id?: number;
  name: string;
  full_path: string;
  parent_folder_id?: number | null;
  root_folder_id?: number | null;
  is_root?: boolean;
  is_default?: boolean;
  is_virtual?: boolean;
  created_at?: string;
  last_scanned?: string | null;
}

class FolderRepository {
  /**
   * Thêm thư mục mới hoặc cập nhật thư mục đã tồn tại
   */
  addOrUpdateFolder(folderData: FolderData): number {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO folders 
      (name, full_path, parent_folder_id, root_folder_id, is_root, is_default, is_virtual)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      folderData.name,
      folderData.full_path,
      folderData.parent_folder_id || null,
      folderData.root_folder_id || null,
      folderData.is_root ? 1 : 0, // Chuyển boolean thành 1/0
      folderData.is_default ? 1 : 0, // Chuyển boolean thành 1/0
      folderData.is_virtual ? 1 : 0 // Chuyển boolean thành 1/0
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
      last_scanned: new Date().toISOString(),
    };

    const result = this.addOrUpdateFolder(rootFolder);

    // Cập nhật root_folder_id với chính ID của folder này
    const updateStmt = db.prepare(`
      UPDATE folders SET root_folder_id = ? WHERE id = ?
    `);
    updateStmt.run(result, result);

    return result;
  }

  /**
   * Thêm thư mục con
   */
  addChildFolder(folderPath: string, parentFolderId: number, rootFolderId: number, isDefault: boolean = false): number {
    const childFolder: FolderData = {
      name: path.basename(folderPath),
      full_path: folderPath,
      parent_folder_id: parentFolderId,
      root_folder_id: rootFolderId,
      is_root: false,
      is_default: isDefault,
    };

    return this.addOrUpdateFolder(childFolder);
  }

  /**
   * Lấy folder mặc định của một root folder
   */
  getDefaultFolder(rootFolderId: number): FolderData | null {
    const stmt = db.prepare('SELECT * FROM folders WHERE root_folder_id = ? AND is_default = 1');
    return stmt.get(rootFolderId) as FolderData | null;
  }

  /**
   * Kiểm tra xem folder có phải là default không
   */
  isDefaultFolder(folderId: number): boolean {
    const stmt = db.prepare('SELECT is_default FROM folders WHERE id = ?');
    const result = stmt.get(folderId) as { is_default: number } | undefined;
    return result ? result.is_default === 1 : false;
  }

  /**
   * Lấy thư mục theo đường dẫn
   */
  getByPath(folderPath: string): FolderData | null {
    const stmt = db.prepare('SELECT * FROM folders WHERE full_path = ?');
    return stmt.get(folderPath) as FolderData | null;
  }

  /**
   * Lấy thư mục theo ID
   */
  getById(folderId: number): FolderData | null {
    const stmt = db.prepare('SELECT * FROM folders WHERE id = ?');
    return stmt.get(folderId) as FolderData | null;
  }

  /**
   * Lấy tất cả thư mục gốc
   */
  getAllRootFolders(): FolderData[] {
    const stmt = db.prepare('SELECT * FROM folders WHERE is_root = 1');
    return stmt.all() as FolderData[];
  }

  /**
   * Lấy các thư mục con trực tiếp
   */
  getChildFolders(parentFolderId: number): FolderData[] {
    const stmt = db.prepare('SELECT * FROM folders WHERE parent_folder_id = ?');
    return stmt.all(parentFolderId) as FolderData[];
  }

  /**
   * Cập nhật thời gian quét folder
   */
  updateLastScanned(folderId: number): void {
    const stmt = db.prepare(`
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
    const stmt = db.prepare('DELETE FROM folders WHERE id = ?');
    stmt.run(folderId);
  }

  /**
   * Thêm folder ảo (chỉ tồn tại trong database)
   */
  addVirtualFolder(
    name: string,
    virtualPath: string,
    parentFolderId: number,
    rootFolderId: number,
    isDefault: boolean = false
  ): number {
    const folderData: FolderData = {
      name: name,
      full_path: virtualPath, // Đường dẫn ảo, không có thực
      parent_folder_id: parentFolderId,
      root_folder_id: rootFolderId,
      is_root: false,
      is_default: isDefault,
      is_virtual: true, // Thêm flag đánh dấu đây là folder ảo
    };

    return this.addOrUpdateFolder(folderData);
  }

  /**
   * Lấy folder mặc định của một root folder
   */
  getDefaultFolderByRoot(rootFolderId: number): FolderData | null {
    try {
      const stmt = db.prepare('SELECT * FROM folders WHERE root_folder_id = ? AND is_default = 1');
      const result = stmt.get(rootFolderId) as FolderData | null;

      console.log(`Tìm Unassigned folder cho root_id=${rootFolderId}: `, result ? 'Đã tìm thấy' : 'Không tìm thấy');

      return result;
    } catch (error) {
      console.error('Lỗi tìm default folder:', error);
      return null;
    }
  }

  /**
   * Lấy tất cả thư mục con trực tiếp của một thư mục gốc
   */
  getChildFoldersByRootId(rootFolderId: number): FolderData[] {
    const stmt = db.prepare('SELECT * FROM folders WHERE root_folder_id = ? AND id != ?');
    return stmt.all(rootFolderId, rootFolderId) as FolderData[];
  }

  /**
   * Lấy thư mục Unassigned của một root folder
   */
  getUnassignedFolder(rootFolderId: number): FolderData | null {
    const stmt = db.prepare('SELECT * FROM folders WHERE root_folder_id = ? AND is_default = 1');
    return stmt.get(rootFolderId) as FolderData | null;
  }

  /**
   * Lấy tất cả thư mục theo cấp (flat list)
   */
  getAllFoldersByRootId(rootFolderId: number): FolderData[] {
    const stmt = db.prepare('SELECT * FROM folders WHERE root_folder_id = ? ORDER BY name');
    return stmt.all(rootFolderId) as FolderData[];
  }

  /**
   * Lấy tất cả thư mục theo cấu trúc cây (tree)
   */
  getFolderTree(rootFolderId: number): any {
    // Lấy root folder
    const rootFolder = this.getById(rootFolderId);
    if (!rootFolder) return null;

    // Hàm đệ quy để xây dựng cây
    const buildTree = (folderId: number): any => {
      const folder = this.getById(folderId);
      if (!folder) return null;

      const childFolders = this.getChildFolders(folderId);
      const children = childFolders.map((child) => buildTree(child.id!));

      return {
        ...folder,
        children: children,
      };
    };

    return buildTree(rootFolderId);
  }
}

export default new FolderRepository();
