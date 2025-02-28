// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import { Image, Node } from "./models";

contextBridge.exposeInMainWorld('electron', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectFiles: () => ipcRenderer.invoke('select-files'),
  moveFiles: (files: string[], rootFolder: string) => ipcRenderer.invoke('move-files', files, rootFolder),
  createImage: (image: Image) => ipcRenderer.invoke('create-image', image),
  
  updateImage: (image: Image) => ipcRenderer.invoke('update-image', image),
  deleteImage: (id: string) => ipcRenderer.invoke('delete-image', id),
  // listImages: () => ipcRenderer.invoke('list-images'),

  insertNode: (node: Node) => ipcRenderer.invoke('insert-node', node),
  updateNode: (nodeId: string, newNode: Node) => ipcRenderer.invoke('update-node', nodeId, newNode),
  deleteNode: (nodeId: string) => ipcRenderer.invoke('delete-node', nodeId),
  getNode: (nodeId: string) => ipcRenderer.invoke('select-node', nodeId),

  updateCaption: (imageId: string, newCaption: string) => ipcRenderer.invoke('update-caption', imageId, newCaption),
  updateQuality: (imageId: string, newQuality: number) => ipcRenderer.invoke('update-quality', imageId, newQuality),
  updateVersion: (imageId: string, newVersion: number) => ipcRenderer.invoke('update-version', imageId, newVersion),
  updateFolder: (imageId: string, newFolder: string) => ipcRenderer.invoke('update-folder', imageId, newFolder),

  getImageDetailsWithVersions: (imageId: string) => ipcRenderer.invoke('get-image-details-with-versions', imageId),

  updateTree: (obj: any, targetId: string, action: "add" | "delete" | "update", payload?: any) => ipcRenderer.invoke('update-tree', obj, targetId, action, payload),
  // getImages: () => ipcRenderer.invoke('get-images'),
  getImageById: (imageId: string) => ipcRenderer.invoke('get-image-by-id', imageId),
  // getFolders: () => ipcRenderer.invoke('get-folders'),
  updateImageQuality: (obj: any, targetId: string, newObject: any) => ipcRenderer.invoke('update-image-quality', obj, targetId, newObject),
  updateImageCaption: (obj: any, targetId: string, newObject: any) => ipcRenderer.invoke('update-image-caption', obj, targetId, newObject),
  updateImageVersion: (obj: any, targetId: string, newObject: any) => ipcRenderer.invoke('update-image-version', obj, targetId, newObject),

});
