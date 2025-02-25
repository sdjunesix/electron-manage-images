import React, { useEffect, useState  } from 'react';
import { createRoot } from 'react-dom/client';

import 'react-tabs/style/react-tabs.css';
import { Image } from './models';
import { Sidebar } from "flowbite-react";
import { HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag, HiTable, HiUser, HiViewBoards } from "react-icons/hi";

declare global {
    interface Window {
      electron: {
        selectFolder: () => Promise<string | null>;
        selectFiles: () => Promise<string[]>;
        moveFiles: (files: string[], rootFolder: string) => Promise<{ success: boolean; movedFiles?: string[]; error?: string }>;
        createImage: (image: Image) => Promise<{ success: boolean }>;
        getImageById: (id: string) => Promise<Image>;
        updateImage: (image: Image) => Promise<{ success: boolean }>;
        deleteImage: (id: string) => Promise<{ success: boolean }>;
        listImages: () => Promise<Image[]>;
        updateCaption: (imageId: string, newCaption: string) => Promise<{ success: boolean }>;
        updateQuality: (imageId: string, newQuality: number) => Promise<{ success: boolean }>;
        updateVersion: (imageId: string, newVersion: number) => Promise<{ success: boolean }>;
        updateFolder: (imageId: string, newFolder: string) => Promise<{ success: boolean }>;
        getImageDetailsWithVersions: (imageId: string) => Promise<any>;
      };
    }
}

function App() {
    const [rootFolder, setRootFolder] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [movedFiles, setMovedFiles] = useState<string[]>([]);
    const [unassigned, setUnassigned] = useState<any[]>([]);
    const [assigned, setAssigned] = useState<any[]>([]);
    // const [treeData, setTreeData] = useState<{ assigned: TreeNodeData[], unassigned: TreeNodeData[] }>({ assigned: [], unassigned: [] });

    useEffect(() => {
      const loadData = async () => {
        try {
          const data = await window.electron.listImages();
          setUnassigned(data.filter(item => !item.savedFolder));
          setAssigned(data.filter(item => item.savedFolder));
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

        images.forEach(image => {
          const folders = image.savedFolder ? image.savedFolder.split('/') : [];
          let currentFolder = root;

          folders.forEach(folder => {
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

    const handleSelectFolder = async () => {
        const folder = await window.electron.selectFolder();
        if (folder) setRootFolder(folder);
    };
    const handleSelectFiles = async () => {
        const files = await window.electron.selectFiles();
        setSelectedFiles(files);
    };
    
    const handleMoveFiles = async () => {
        console.log('ROOT FOLDER', rootFolder)
        console.log('FILES', selectedFiles)
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
  return <>

  </>
}

const root = createRoot(document.body);
root.render(<App/>);

export default App;