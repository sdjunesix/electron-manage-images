/**
 * Electron File System Scanner
 * Date: 2025-03-04 08:20:12
 * User: sdjunesix
 */
import { app, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { TreeNode } from '../models';
import { TreeNodeType } from './fileSystemTree';

/**
 * Configuration for the file scanner
 */
interface ScannerConfig {
  imageExtensions: string[];  // File extensions to treat as images
  excludeDirs: string[];      // Directories to exclude from scanning
  maxDepth?: number;          // Maximum folder depth to scan (undefined for no limit)
  generateThumbnails?: boolean; // Whether to generate thumbnails during scan
}

/**
 * Default scanner configuration
 */
const defaultConfig: ScannerConfig = {
  imageExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'],
  excludeDirs: ['.git', 'node_modules', '.DS_Store'],
  maxDepth: undefined,
  generateThumbnails: false
};

/**
 * Select a root folder using Electron's dialog
 * @returns Selected folder path or undefined if canceled
 */
export async function selectRootFolder(): Promise<string | undefined> {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select Root Folder'
  });

  if (canceled || filePaths.length === 0) {
    return undefined;
  }

  return filePaths[0];
}

/**
 * Generate a unique ID for a node in the tree
 * @param parentId The ID of the parent node
 * @param name The name of the current node
 */
function generateNodeId(parentId: string, name: string): string {
  if (!parentId) {
    return crypto.createHash('md5').update(name).digest('hex').substring(0, 8);
  }
  return `${parentId}.${crypto.createHash('md5').update(name).digest('hex').substring(0, 6)}`;
}

/**
 * Check if a file is an image based on its extension
 * @param filePath The file path to check
 * @param imageExtensions List of valid image extensions
 */
function isImageFile(filePath: string, imageExtensions: string[]): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return imageExtensions.includes(ext);
}

/**
 * Create an ImageNode with default version data
 * @param id Node ID
 * @param filePath File path
 * @param fileName File name
 */
function createImageNode(id: string, filePath: string, fileName: string): TreeNode {
  const stats = fs.statSync(filePath);
  const createdAt = new Date(stats.birthtime).toISOString().split('T')[0];
  
  return {
    id,
    type: TreeNodeType.IMAGE,
    path: filePath,
    name: fileName,
    data: {
      current_version: 'v1.0',
      versions: {
        'v1.0': {
          quality: 3, // Default quality
          caption: fileName, // Use filename as default caption
          createdAt
        }
      }
    },
    children: []
  };
}

/**
 * Recursively scan a directory and build a folder node
 * @param currentPath The current directory path
 * @param parentId The ID of the parent node
 * @param config Scanner configuration
 * @param currentDepth Current recursion depth
 */
export function scanDirectory(
  currentPath: string,
  parentId: string = '',
  config: ScannerConfig = defaultConfig,
  currentDepth: number = 0
): TreeNode {
  // Check max depth
  if (config.maxDepth !== undefined && currentDepth > config.maxDepth) {
    return {
      id: generateNodeId(parentId, path.basename(currentPath)),
      type: TreeNodeType.FOLDER,
      path: currentPath, 
      name: path.basename(currentPath),
      children: []
    };
  }

  // Create current folder node
  const folderName = path.basename(currentPath);
  const folderId = generateNodeId(parentId, folderName);
  
  // Initialize as a plain TreeNode object
  const folderNode: TreeNode = {
    id: folderId,
    type: TreeNodeType.FOLDER,
    path: currentPath,
    name: folderName,
    data: {},
    children: []
  };
  
  try {
    // Read directory contents
    const items = fs.readdirSync(currentPath);
    
    // Process each item
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Skip excluded directories
        if (config.excludeDirs.includes(item)) continue;
        
        // Recursively scan subdirectory
        const subFolder = scanDirectory(
          itemPath,
          folderId,
          config,
          currentDepth + 1
        );
        folderNode.children?.push(subFolder);
        
      } else if (stats.isFile()) {
        // Check if it's an image file
        if (isImageFile(itemPath, config.imageExtensions)) {
          const imageId = generateNodeId(folderId, item);
          const imageNode = createImageNode(imageId, itemPath, item);
          folderNode.children?.push(imageNode);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${currentPath}:`, error);
  }
  
  return folderNode;
}

/**
 * Scan a root folder and build a complete file system tree
 * @param rootPath The root directory path to scan
 * @param config Scanner configuration
 * @returns A plain TreeNode object representing the root of the file system
 */
export function scanRootFolder(
  rootPath: string,
  config: ScannerConfig = defaultConfig
): TreeNode {
  // Create a root node
  const rootNode: TreeNode = {
    id: '',
    type: TreeNodeType.ROOT,
    path: rootPath,
    name: path.basename(rootPath),
    data: {},
    children: []
  };
  
  try {
    // Get items in the root directory
    const items = fs.readdirSync(rootPath);
    
    // Process each item
    for (const item of items) {
      const itemPath = path.join(rootPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Skip excluded directories
        if (config.excludeDirs.includes(item)) continue;
        
        // Scan subdirectory
        const folderNode = scanDirectory(itemPath, rootNode.id || '', config);
        rootNode.children?.push(folderNode);
        
      } else if (stats.isFile()) {
        // Check if it's an image file
        if (isImageFile(itemPath, config.imageExtensions)) {
          const imageId = generateNodeId(rootNode.id || '', item);
          const imageNode = createImageNode(imageId, itemPath, item);
          rootNode.children?.push(imageNode);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning root folder ${rootPath}:`, error);
  }
  
  return rootNode;
}

/**
 * Save the file system tree to a JSON file
 * @param tree The tree to save
 * @param filePath The path to save to
 */
export function saveTreeToFile(tree: TreeNode, filePath: string): void {
  try {
    const jsonData = JSON.stringify(tree, null, 2);
    fs.writeFileSync(filePath, jsonData, 'utf8');
    console.log(`Tree saved to ${filePath}`);
  } catch (error) {
    console.error('Error saving tree:', error);
  }
}

/**
 * Load a file system tree from a JSON file
 * @param filePath The path to load from
 */
export function loadTreeFromFile(filePath: string): TreeNode | null {
  try {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData) as TreeNode;
  } catch (error) {
    console.error('Error loading tree:', error);
    return null;
  }
}

/**
 * Helper function to count all descendants of a TreeNode
 */
export function countDescendants(node: TreeNode): number {
  if (!node.children || node.children.length === 0) return 0;
  
  return node.children.reduce(
    (count, child) => count + 1 + countDescendants(child),
    0
  );
}

/**
 * Helper function to find all images in the tree
 */
export function getAllImages(node: TreeNode): TreeNode[] {
  const images: TreeNode[] = [];
  
  if (!node.children) return images;
  
  // Add direct image children
  images.push(...node.children.filter(child => child.type === TreeNodeType.IMAGE));
  
  // Add images from subdirectories
  const folders = node.children.filter(child => 
    child.type === TreeNodeType.FOLDER || child.type === TreeNodeType.ROOT
  );
  
  for (const folder of folders) {
    images.push(...getAllImages(folder));
  }
  
  return images;
}

/**
 * Update main process IPC handlers to use plain TreeNode objects
 */
// export function setupElectronHandlers() {
//   // Example of how to update the main.ts IPC handlers
//   let currentTree: TreeNode | null = null;

//   ipcMain.handle('select-folder', async () => {
//     const folderPath = await selectRootFolder();
//     if (folderPath) {
//       currentTree = scanRootFolder(folderPath);
//       return {
//         success: true,
//         path: folderPath,
//         stats: {
//           totalItems: countDescendants(currentTree) + 1,
//           imageCount: getAllImages(currentTree).length,
//           folderCount: countDescendants(currentTree) + 1 - getAllImages(currentTree).length
//         }
//       };
//     }
//     return { success: false };
//   });

//   ipcMain.handle('get-tree-data', () => {
//     return currentTree;
//   });

//   // Other handlers...
// }