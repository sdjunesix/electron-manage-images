
import { Image, Node, TreeNode } from './models';
//========================================================================================//
export function addObject(obj: any, targetId: string, newObject: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => addObject(item, targetId, newObject));
    } else if (typeof obj === "object" && obj !== null) {
      if (obj.id === targetId && obj.type === "folder") {
        return { ...obj, children: [...obj.children, newObject] };
      }
      return { ...obj, children: addObject(obj.children, targetId, newObject) };
    }
    return obj;
  }
  
export  function deleteById(obj: any, targetId: string): any {
    if (Array.isArray(obj)) {
      return obj.filter(item => item.id !== targetId).map(item => deleteById(item, targetId));
    } else if (typeof obj === "object" && obj !== null) {
      return { ...obj, children: deleteById(obj.children, targetId) };
    }
    return obj;
  }
  
export  function updateById(obj: any, targetId: string, updates: Partial<any>): any {
    if (Array.isArray(obj)) {
      return obj.map(item => updateById(item, targetId, updates));
    } else if (typeof obj === "object" && obj !== null) {
      if (obj.id === targetId) {
        return { ...obj, ...updates };
      }
      return { ...obj, children: updateById(obj.children, targetId, updates) };
    }
    return obj;
  }
  
export function getById(obj: any, targetId: string): any | null {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = getById(item, targetId);
        if (result) return result;
      }
    } else if (typeof obj === "object" && obj !== null) {
      if (obj.id === targetId) return obj;
      return getById(obj.children, targetId);
    }
    return null;
  }
  
export function getImages(node: any): any[] {
    let images: any[] = [];
  
    if (node.type === "image") {
        images.push(node);
    }
  
    if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
            images = images.concat(getImages(child));
        }
    }
    return images;
  }
  
export  function filterFolders(node: TreeNode): TreeNode | null {
    if (node.type !== "folder") return null;
  
    const filteredChildren = node.children
      ?.map(filterFolders)
      .filter((child): child is TreeNode => child !== null) || [];
  
    return { ...node, children: filteredChildren };
  }
  
export  function getFoldersOnly(tree: TreeNode): TreeNode[] {
    return tree.children
      ?.map(filterFolders)
      .filter((child): child is TreeNode => child !== null) || [];
  }
  
export  function getFolders(node: any): any[] {
    if (node.type !== "folder" && node.type !== "root") {
      return null; // Exclude non-folder nodes
    }
  
    return {
      ...node,
      children: node.children
          ? node.children.map(getFolders).filter(Boolean) // Recursively filter children
          : []
    };
  }
  

// export  function getUnassignedFolder(folders: any[]): any {
//   const matchedFolders = folders.filter(f => f.id === '1')
//   return matchedFolders[0]
// }

export function getUnassignedFolder(root: any): any {
  for (const folder of root.children) {
    if (folder.id === "1") {
      return folder; // Return immediately when found
    }
  }
  return null; // Return null if not found
}

// export function getAssignedFolders(folders: any[]): any[] {
//   return folders.filter(f => f.id !== '1')
// }
export function getAssignedFolders(root: any): any[] {
  const assignedFolders: any[] = [];

  for (const folder of root.children) {
    if (folder.id !== "1") {
      assignedFolders.push(folder); // Add folder if it's not '1'
    }
  }

  return assignedFolders;
}

  
export  function updateTree(obj: any, targetId: string, action: "add" | "delete" | "update", payload?: any): any {
    if (Array.isArray(obj)) {
      if (action === "delete") {
        return obj.filter(item => item.id !== targetId).map(item => updateTree(item, targetId, action, payload));
      }
      return obj.map(item => updateTree(item, targetId, action, payload));
    } else if (typeof obj === "object" && obj !== null) {
      if (obj.id === targetId) {
        if (action === "update") return { ...obj, ...payload };
        if (action === "add") return { ...obj, children: [...obj.children, payload] };
      }
      return { ...obj, children: updateTree(obj.children, targetId, action, payload) };
    }
    return obj;
  }

export function addImageToFolder(folder: any, newImageData: any): any {
  // Generate new ID
  const newId = `${folder.id}.${folder.children.length + 1}`
  // Create new image object
  const newImage = {
    id: newId,
    type: "image",
    path: newImageData.path,
    name: newImageData.name || `Image ${newId}`,
    data: newImageData.data || {},
    children: [] as any[]
  };
  // Add to children
  folder.children.push(newImage);
  
  return folder; // Return updated folder
}

export function getFilenameWithoutExtension(filePath: string): string {
  return filePath.split('/').pop()?.replace(/\.png$/, '') ?? '';
}