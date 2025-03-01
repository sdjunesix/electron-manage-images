// import { TreeNodeResponse } from "types/response";

export const getRootFolder = async (): Promise<string | null> => {
  const row: string = await window.electron.getRootFolder();
  return row || null;
};

export const selectFolder = async (): Promise<string | null> => {
  const path = await window.electron.selectFolder();
  return path || null;
};

export const selectFiles = async (): Promise<string[] | null> => {
  const files = await window.electron.selectFiles();
  return files || null;
};
