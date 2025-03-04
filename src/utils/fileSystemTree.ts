/**
 * File System Tree Structure - Complete Implementation
 * Current Date: 2025-03-04 04:21:08
 * Author: sdjunesix
 */

/**
 * Represents the type of a node in the file system tree
 */
export enum TreeNodeType {
    ROOT = 'root',
    FOLDER = 'folder',
    IMAGE = 'image'
  }
  
  /**
   * Interface for image version data
   */
  export interface ImageVersionData {
    quality: number;
    caption: string;
    createdAt: string;
  }
  
  /**
   * Interface for image data with versions
   */
  export interface ImageData {
    current_version: string;
    versions: Record<string, ImageVersionData>;
  }
  
  /**
   * Base class for all tree nodes
   */
  export abstract class TreeNode {
    id: string;
    type: TreeNodeType;
    path: string;
    name: string;
    data: Record<string, any>;
    children: TreeNode[];
  
    constructor(
      id: string,
      type: TreeNodeType,
      path: string,
      name: string,
      data: Record<string, any> = {},
      children: TreeNode[] = []
    ) {
      this.id = id;
      this.type = type;
      this.path = path;
      this.name = name;
      this.data = data;
      this.children = children;
    }
  
    /**
     * Add a child node to this node
     */
    addChild(child: TreeNode): void {
      this.children.push(child);
    }
  
    /**
     * Remove a child node by its ID
     */
    removeChild(childId: string): boolean {
      const initialLength = this.children.length;
      this.children = this.children.filter(child => child.id !== childId);
      return this.children.length !== initialLength;
    }
  
    /**
     * Find a child node by its ID (non-recursive)
     */
    findChild(childId: string): TreeNode | undefined {
      return this.children.find(child => child.id === childId);
    }
  
    /**
     * Find any descendant node by its ID (recursive)
     */
    findDescendant(nodeId: string): TreeNode | undefined {
      // Check if this is the node we're looking for
      if (this.id === nodeId) return this;
  
      // Look through children
      for (const child of this.children) {
        const found = child.findDescendant(nodeId);
        if (found) return found;
      }
  
      return undefined;
    }
  
    /**
     * Count all descendant nodes
     */
    countDescendants(): number {
      return this.children.reduce(
        (count, child) => count + 1 + child.countDescendants(),
        0
      );
    }
  
    /**
     * Convert the node to a plain object
     */
    toJSON(): any {
      return {
        id: this.id,
        type: this.type,
        path: this.path,
        name: this.name,
        data: this.data,
        children: this.children.map(child => child.toJSON())
      };
    }
  }
  
  /**
   * Represents a folder in the tree structure
   */
  export class FolderNode extends TreeNode {
    constructor(
      id: string,
      path: string,
      name: string,
      data: Record<string, any> = {},
      children: TreeNode[] = []
    ) {
      super(id, TreeNodeType.FOLDER, path, name, data, children);
    }
  
    /**
     * Get all image nodes in this folder (non-recursive)
     */
    getImages(): TreeNode[] {
      return this.children.filter(child => child.type === TreeNodeType.IMAGE);
    }
  
    /**
     * Get all folder nodes in this folder (non-recursive)
     */
    getFolders(): FolderNode[] {
      return this.children.filter(
        child => child.type === TreeNodeType.FOLDER
      ) as FolderNode[];
    }
  
    /**
     * Get all image nodes in this folder and subfolders (recursive)
     */
    getAllImages(): TreeNode[] {
      const images: TreeNode[] = [];
      
      // Add direct image children
      images.push(...this.getImages());
      
      // Add images from subfolders
      for (const folder of this.getFolders()) {
        images.push(...folder.getAllImages());
      }
      
      return images;
    }
  }
  
  /**
   * Represents the root node of the file system tree
   */
  export class RootNode extends FolderNode {
    constructor(
      path: string,
      name: string,
      data: Record<string, any> = {},
      children: TreeNode[] = []
    ) {
      super('', path, name, data, children);
      this.type = TreeNodeType.ROOT;
    }
  }
  
  /**
   * Represents an image in the tree structure
   */
  export class ImageNode extends TreeNode {
    declare data: ImageData;
  
    constructor(
      id: string,
      path: string,
      name: string,
      data: ImageData
    ) {
      super(id, TreeNodeType.IMAGE, path, name, data, []);
    }
  
    /**
     * Get the current version data of the image
     */
    getCurrentVersion(): ImageVersionData | undefined {
      const versionKey = this.data.current_version;
      return this.data.versions[versionKey];
    }
  
    /**
     * Get version data by version key
     */
    getVersion(version: string): ImageVersionData | undefined {
      return this.data.versions[version];
    }
  
    /**
     * Add a new version to this image
     */
    addVersion(
      versionKey: string,
      versionData: ImageVersionData,
      setCurrent: boolean = true
    ): void {
      this.data.versions[versionKey] = versionData;
      if (setCurrent) {
        this.data.current_version = versionKey;
      }
    }
  
    /**
     * Set the current version
     */
    setCurrentVersion(versionKey: string): boolean {
      if (this.data.versions[versionKey]) {
        this.data.current_version = versionKey;
        return true;
      }
      return false;
    }
  
    /**
     * Get all available version keys
     */
    getVersions(): string[] {
      return Object.keys(this.data.versions);
    }
  
    /**
     * Get image quality from current version
     */
    getQuality(): number | undefined {
      const currentVersion = this.getCurrentVersion();
      return currentVersion?.quality;
    }
  
    /**
     * Get image caption from current version
     */
    getCaption(): string | undefined {
      const currentVersion = this.getCurrentVersion();
      return currentVersion?.caption;
    }
  }
  
  /**
   * Factory for creating tree structures from plain objects
   */
  export class TreeFactory {
    /**
     * Create a tree structure from a JSON object
     */
    static fromJSON(jsonData: any): TreeNode {
      const { id, type, path, name, data, children } = jsonData;
  
      let node: TreeNode;
  
      switch (type) {
        case TreeNodeType.ROOT:
          node = new RootNode(path, name, data);
          break;
          
        case TreeNodeType.FOLDER:
          node = new FolderNode(id, path, name, data);
          break;
          
        case TreeNodeType.IMAGE:
          node = new ImageNode(id, path, name, data as ImageData);
          break;
          
        default:
          throw new Error(`Unknown node type: ${type}`);
      }
  
      // Recursively process children
      if (Array.isArray(children)) {
        for (const childData of children) {
          const childNode = TreeFactory.fromJSON(childData);
          node.addChild(childNode);
        }
      }
  
      return node;
    }
  }
  
  // Example usage
  // Uncomment the following code to test the implementation
  
  
  // Example JSON data
//   const jsonData = {
//     "id": "",
//     "type": "root",
//     "path": "/Users/sdjune6/ws/electron-manage-images",
//     "name": "Root Folder Galaxy",
//     "data": {},
//     "children": [
//       { 
//         "id": "1",
//         "type": "folder",
//         "path": "/Users/sdjune6/ws/electron-manage-images/unassigned",
//         "name": "Unassigned",
//         "data": {},
//         "children": [
//           {
//             "id": "1.1",
//             "type": "image",
//             "path": "/Users/sdjune6/ws/electron-manage-images",
//             "name": "Root Folder Galaxy",
//             "data": {
//               "current_version": "v1.3",
//               "versions": {
//                 "v1.3": {
//                   "quality": 4,
//                   "caption": "This is caption",
//                   "createdAt": "2025 Feb 27"
//                 }
//               }
//             },
//             "children": []
//           }
//         ]
//       },
//       {
//         "id": "2",
//         "type": "folder",
//         "path": "/Users/sdjune6/ws/electron-manage-images",
//         "name": "Iterator",
//         "children": [
//           {
//             "id": "2.1",
//             "type": "folder",
//             "path": "/Users/sdjune6/ws/electron-manage-images",
//             "name": "Rooms",
//             "children": [
//               {
//                 "id": "2.1.1",
//                 "type": "image",
//                 "path": "/Users/sdjune6/ws/electron-manage-images",
//                 "name": "Image 1",
//                 "data": {
//                   "current_version": "v1.3",
//                   "versions": {
//                     "v1.3": {
//                       "quality": 4,
//                       "caption": "This is caption",
//                       "createdAt": "2025 Feb 27"
//                     }
//                   }
//                 },
//                 "children": []
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   };
  
//   // Create a tree structure from JSON
//   const fileTree = TreeFactory.fromJSON(jsonData) as RootNode;
//   console.log(`Created file tree with name: ${fileTree.name}`);
//   console.log(`Total nodes in tree: ${fileTree.countDescendants() + 1}`);
  
//   // Find a specific node
//   const imageNode = fileTree.findDescendant("2.1.1") as ImageNode;
//   if (imageNode) {
//     console.log(`Found image: ${imageNode.name}`);
//     console.log(`Current version: ${imageNode.data.current_version}`);
//     console.log(`Quality: ${imageNode.getQuality()}`);
//     console.log(`Caption: ${imageNode.getCaption()}`);
//   }
  
//   // Create a new image version
//   if (imageNode) {
//     imageNode.addVersion("v1.4", {
//       quality: 5,
//       caption: "Updated caption",
//       createdAt: "2025 Mar 04"
//     });
//     console.log(`Added new version. Current version is now: ${imageNode.data.current_version}`);
//     console.log(`New quality: ${imageNode.getQuality()}`);
//   }
  
//   // Get all images in the tree
//   const allImages = fileTree.getAllImages() as ImageNode[];
//   console.log(`Total images: ${allImages.length}`);
//   allImages.forEach(image => {
//     console.log(`- ${image.name} (quality: ${image.getQuality()})`);
//   });
  
//   // Convert back to JSON
//   const jsonOutput = fileTree.toJSON();
// //   console.log('Tree structure as JSON:', JSON.stringify(jsonOutput, null, 2).substring(0, 100) + '...');
//   console.log('Tree structure as JSON:', JSON.stringify(jsonOutput))
