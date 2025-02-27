"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  selectFolder: () => electron.ipcRenderer.invoke("select-folder"),
  selectFiles: () => electron.ipcRenderer.invoke("select-files"),
  moveFiles: (files, rootFolder) => electron.ipcRenderer.invoke("move-files", files, rootFolder),
  createImage: (image) => electron.ipcRenderer.invoke("create-image", image),
  getImageById: (id) => electron.ipcRenderer.invoke("get-image-by-id", id),
  updateImage: (image) => electron.ipcRenderer.invoke("update-image", image),
  deleteImage: (id) => electron.ipcRenderer.invoke("delete-image", id),
  listImages: () => electron.ipcRenderer.invoke("list-images"),
  insertNode: (node) => electron.ipcRenderer.invoke("insert-node", node),
  updateNode: (nodeId, newNode) => electron.ipcRenderer.invoke("update-node", nodeId, newNode),
  deleteNode: (nodeId) => electron.ipcRenderer.invoke("delete-node", nodeId),
  getNode: (nodeId) => electron.ipcRenderer.invoke("select-node", nodeId),
  updateCaption: (imageId, newCaption) => electron.ipcRenderer.invoke("update-caption", imageId, newCaption),
  updateQuality: (imageId, newQuality) => electron.ipcRenderer.invoke("update-quality", imageId, newQuality),
  updateVersion: (imageId, newVersion) => electron.ipcRenderer.invoke("update-version", imageId, newVersion),
  updateFolder: (imageId, newFolder) => electron.ipcRenderer.invoke("update-folder", imageId, newFolder),
  getImageDetailsWithVersions: (imageId) => electron.ipcRenderer.invoke("get-image-details-with-versions", imageId)
});
