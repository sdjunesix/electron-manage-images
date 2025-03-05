// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import { Image, Node } from "./models";

contextBridge.exposeInMainWorld('electron', {
  getRootFolder: () => ipcRenderer.invoke('get-root-folder'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectFiles: () => ipcRenderer.invoke('select-files'),
  moveFiles: (files: string[], rootFolder: string) => ipcRenderer.invoke('move-files', files, rootFolder),

  getImageDetailsWithVersions: (imageId: string) => ipcRenderer.invoke('get-image-details-with-versions', imageId),

  updateTreeData: (id: number, data: string) => ipcRenderer.invoke('update-tree-data', id, data),
  getRoot: () => ipcRenderer.invoke('get-root'),
  getImages: () => ipcRenderer.invoke('get-images'),
  // getImageById: (imageId: string) => ipcRenderer.invoke('get-image-by-id', imageId),
  getFolders: () => ipcRenderer.invoke('get-folders'),
  updateImageQuality: (obj: any, targetId: string, newObject: any) => ipcRenderer.invoke('update-image-quality', obj, targetId, newObject),
  updateImageCaption: (obj: any, targetId: string, newObject: any) => ipcRenderer.invoke('update-image-caption', obj, targetId, newObject),
  updateImageVersion: (obj: any, targetId: string, newObject: any) => ipcRenderer.invoke('update-image-version', obj, targetId, newObject),

  getImagesFromFolder: (folderPath: string) => ipcRenderer.invoke('get-images-from-folder'),

  setRootFolder: (folderPath: string) => ipcRenderer.invoke('set-root-folder', folderPath),
  reScanRootFolder: (folderPath: string) => ipcRenderer.invoke('re-scan-root-folder', folderPath),
  isDirectory: (path: string) => ipcRenderer.invoke('is-directory', path),
  getRootFolders: () => ipcRenderer.invoke('get-root-folders'),
  getFolderById: (folderId: number) => ipcRenderer.invoke('get-folder-by-id', folderId),
  getFolderByPath: (folderPath: string) => ipcRenderer.invoke('get-folder-by-path', folderPath),
  getChildFolders: (folderId: number) => ipcRenderer.invoke('get-child-folders', folderId),
  getDirectSubfolders: (rootFolderId: number) => ipcRenderer.invoke('get-direct-subfolders', rootFolderId),
  getAllFoldersByRoot: (rootFolderId: number) => ipcRenderer.invoke('get-all-folders-by-root', rootFolderId),
  getFolderTree: (rootFolderId: number) => ipcRenderer.invoke('get-folder-tree', rootFolderId),

  getImagesByFolder: (folderId: number) => ipcRenderer.invoke('get-images-by-folder', folderId),
  getImageById: (imageId: number) => ipcRenderer.invoke('get-image-by-id', imageId),
  getImageCaption: (imageId: number) => ipcRenderer.invoke('get-image-caption', imageId),
  updateImageRating: (imageId: number, rating: number) => ipcRenderer.invoke('update-image-rating', imageId, rating),
  moveImageToFolder: (imageId: number, targetFolderId: number) => ipcRenderer.invoke('move-image-to-folder', imageId, targetFolderId),
  readImageFile: (imagePath: string) => ipcRenderer.invoke('read-image-file', imagePath)
});
