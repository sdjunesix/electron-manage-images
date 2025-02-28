import { db } from './init';

export const addRootFolder = async (name: string, path: string) => {
  await db.runAsync(`INSERT INTO tree (name, path, type, parent_id) VALUES (?, ?, 'root', NULL)`, [name, path]);
};

// export const getFolders = async () => await db.allAsync(`SELECT * FROM tree WHERE type = 'folder'`);
