// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import { Image } from "./models/Image";

contextBridge.exposeInMainWorld('electron', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectFiles: () => ipcRenderer.invoke('select-files'),
  moveFiles: (files: string[], rootFolder: string) => ipcRenderer.invoke('move-files', files, rootFolder),
  createImage: (image: Image) => ipcRenderer.invoke('create-image', image),
  getImageById: (id: string) => ipcRenderer.invoke('get-image-by-id', id),
  updateImage: (image: Image) => ipcRenderer.invoke('update-image', image),
  deleteImage: (id: string) => ipcRenderer.invoke('delete-image', id),
  listImages: () => ipcRenderer.invoke('list-images'),
});
