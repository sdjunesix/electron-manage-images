import { TreeNode } from "@models/index";

export const getRootFolder = async (): Promise<TreeNode | null> => {
  const row: TreeNode = await window.electron.getRootFolder();
  return row || null;
};

export const getRootFolders = async (): Promise<TreeNode | null> => {
  const row: TreeNode = await window.electron.getRootFolders();
  return row || null;
};

export const selectFolder = async (): Promise<any | null> => {
  const path = await window.electron.selectFolder();
  return path || null;
};

export const selectFiles = async (): Promise<string[] | null> => {
  const files = await window.electron.selectFiles();
  return files || null;
};
