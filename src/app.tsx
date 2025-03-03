import { Fragment, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import { ROUTES } from '@constants';
import { Image, TreeNode } from './models';

declare global {
  interface Window {
    electron: {
      getRootFolder: () => Promise<string | null>;
      selectFolder: () => Promise<string | null>;
      selectFiles: () => Promise<string[]>;
      moveFiles: (files: string[], rootFolder: string) => Promise<{ success: boolean; movedFiles?: string[]; error?: string }>;

      setRootFolder: () => any;

      updateCaption: (imageId: string, newCaption: string) => Promise<{ success: boolean }>;
      updateQuality: (imageId: string, newQuality: number) => Promise<{ success: boolean }>;
      updateVersion: (imageId: string, newVersion: number) => Promise<{ success: boolean }>;
      updateFolder: (imageId: string, newFolder: string) => Promise<{ success: boolean }>;
      getImageDetailsWithVersions: (imageId: string) => Promise<any>;

      updateTreeData: (id: number, data: string) => Promise<any>;
      getRoot: () => Promise<TreeNode>;
      getImages: () => Promise<any[]>;
      getImageById: (imageId: string) => Promise<any>;
      getFolders: () => Promise<any[]>;
      updateImageQuality: (obj: any, targetId: string, newObject: any) => Promise<any>;


    };
  }
}

const App = () => {
  const [rootFolder, setRootFolder] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [movedFiles, setMovedFiles] = useState<string[]>([]);
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [assigned, setAssigned] = useState<any[]>([]);
  // const [treeData, setTreeData] = useState<{ assigned: TreeNodeData[], unassigned: TreeNodeData[] }>({ assigned: [], unassigned: [] });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await window.electron.getImages();
        setUnassigned(data.filter((item: { savedFolder: any; }) => !item.savedFolder));
        setAssigned(data.filter((item: { savedFolder: any; }) => item.savedFolder));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    interface TreeNode {
      id: string;
      label: string;
      children?: TreeNode[];
    }

    const buildTree = (images: Image[]): TreeNode[] => {
      const root: TreeNode = { id: 'root', label: 'Root', children: [] };
      const folderMap: { [key: string]: TreeNode } = { '': root };

      images.forEach((image) => {
        const folders = image.savedFolder ? image.savedFolder.split('/') : [];
        let currentFolder = root;

        folders.forEach((folder) => {
          if (!folderMap[folder]) {
            const newFolder: TreeNode = { id: folder, label: folder, children: [] };
            folderMap[folder] = newFolder;
            currentFolder.children!.push(newFolder);
          }
          currentFolder = folderMap[folder];
        });

        currentFolder.children!.push({ id: image.id, label: image.name });
      });

      return [root];
    };

    const assignedTree = buildTree(assigned);
    const unassignedTree = buildTree(unassigned);
    // setTreeData({ assigned: assignedTree, unassigned: unassignedTree });
  }, [unassigned, assigned]);

  const handleMoveFiles = async () => {
    if (!rootFolder) {
      alert('Please select a root folder first.');
      return;
    }
    if (selectedFiles.length === 0) {
      alert('Please select files to move.');
      return;
    }

    const result = await window.electron.moveFiles(selectedFiles, rootFolder);

    if (result.success) {
      setMovedFiles(result.movedFiles || []);
      alert('Files moved successfully!');
    } else {
      alert(`Error moving files: ${result.error}`);
    }
  };

  return (
    <div className="w-full h-screen bg-white text-black text-sm font-normal">
      <HashRouter>
        <div className="flex h-full">
          <nav className="w-1/4 bg-black text-white/70">
            <div className="flex justify-between py-3 px-4">
              <h1 className="font-bold text-xl">
                <Link to="/">My App</Link>
              </h1>
            </div>
            <div className="flex flex-col space-y-1 p-2">
              {ROUTES.map((page, index) => {
                const { path, title, Icon } = page;

                return (
                  <Fragment key={index}>
                    {path === '/settings' && <div className="border-t border-white/10"></div>}
                    <NavLink
                      to={path}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded flex items-center space-x-2 ${isActive ? 'bg-gray-900' : 'hover:bg-gray-700'}`
                      }
                    >
                      <Icon />
                      <span>{title}</span>
                    </NavLink>
                  </Fragment>
                );
              })}
            </div>
          </nav>

          <div className="flex-1 overflow-auto">
            <Routes>
              {ROUTES.map((page, index) => {
                const { path, Component } = page;
                return <Route key={index} path={path} element={<Component />} />;
              })}
            </Routes>
          </div>
        </div>
      </HashRouter>
    </div>
  );
};

export default App;
