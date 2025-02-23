import React, { useEffect, useState, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronFirst, 
  ChevronLast, 
  MoreVertical 
} from 'lucide-react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Image } from './models/Image';

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
      };
    }
}

// TreeNode Component
interface TreeNodeData {
  id: string;
  label: string;
  children?: TreeNodeData[];
}

interface TreeNodeProps {
  node: TreeNodeData;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = node.children && node.children.length > 0;
  
    return (
      <div className="ml-4">
        <div
          className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded"
          onClick={() => setIsOpen(!isOpen)}
        >
          {hasChildren && (
            <span className="mr-2">
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
          <span>{node.label}</span>
        </div>
        {hasChildren && isOpen && (
          <div className="ml-4">
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Main TreeView Component
interface TreeViewProps {
  title: string;
  data: TreeNodeData[];
}

const TreeView: React.FC<TreeViewProps> = ({ title, data }) => {
  return (
    <div className="p-4 bg-white rounded shadow w-full max-w-md">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      {data.map((node: TreeNodeData) => (
      <TreeNode key={node.id} node={node} />
      ))}
    </div>
  );
};

interface GridViewProps {
  data: TreeNodeData[];
}

const GridView: React.FC<GridViewProps> = ({ data }) => {
  return (
    <div className="p-4 bg-white rounded shadow w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((node) => (
            <tr key={node.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{node.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{node.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// implement ListView component
interface ListViewProps {
  data: TreeNodeData[];
}

const ListView: React.FC<ListViewProps> = ({ data }) => {
  return (
    <div className="p-4 bg-white rounded shadow w-full">
      <ul className="divide-y divide-gray-200">
        {data.map((node) => (
          <li key={node.id} className="py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{node.label}</p>
                <p className="text-sm text-gray-500 truncate">{node.id}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const SidebarContext = createContext({ expanded: true })

import { ReactNode } from 'react';

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const [expanded, setExpanded] = useState(true)
  
  return (
    <aside className="h-screen">
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src="https://img.logoipsum.com/243.svg"
            className={`overflow-hidden transition-all ${
              expanded ? "w-32" : "w-0"
            }`}
            alt=""
          />
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        <div className="border-t flex p-3">
          <img
            src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true"
            alt=""
            className="w-10 h-10 rounded-md"
          />
          <div
            className={`
              flex justify-between items-center
              overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
          `}
          >
            <div className="leading-4">
              <h4 className="font-semibold">John Doe</h4>
              <span className="text-xs text-gray-600">johndoe@gmail.com</span>
            </div>
            <MoreVertical size={20} />
          </div>
        </div>
      </nav>
    </aside>
  )
}

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  alert?: boolean;
}

export function SidebarItem({ icon, text, active, alert }: SidebarItemProps) {
  const { expanded } = useContext(SidebarContext)
  
  return (
    <li
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${
          active
            ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
            : "hover:bg-indigo-50 text-gray-600"
        }
    `}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {!expanded && (
        <div
          className={`
          absolute left-full rounded-md px-2 py-1 ml-6
          bg-indigo-100 text-indigo-800 text-sm
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
      `}
        >
          {text}
        </div>
      )}
    </li>
  )
}

function App() {
    const [rootFolder, setRootFolder] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [movedFiles, setMovedFiles] = useState<string[]>([]);
    const [unassigned, setUnassigned] = useState<any[]>([]);
    const [assigned, setAssigned] = useState<any[]>([]);
    const [treeData, setTreeData] = useState<{ assigned: TreeNodeData[], unassigned: TreeNodeData[] }>({ assigned: [], unassigned: [] });

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
      setTreeData({ assigned: assignedTree, unassigned: unassignedTree });
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
  
    return (
      <div className="flex h-screen">
        <Sidebar>
          <SidebarItem icon={<ChevronDown size={16} />} text="Dashboard" active={true} />
          <SidebarItem icon={<ChevronDown size={16} />} text="Projects" active ={true}/>  
        </Sidebar>
        <div className="w-64 bg-gray-800 text-white p-4">
          <h1 className="text-2xl font-bold mb-4">Sidebar</h1>
          <ul>
            <li className="mb-2"><button onClick={handleSelectFolder} className="w-full text-left">Select Root Folder</button></li>
            <li className="mb-2"><button onClick={handleSelectFiles} className="w-full text-left">Select Files to Move</button></li>
            <li className="mb-2"><button onClick={handleMoveFiles} className="w-full text-left">Move Files</button></li>
          </ul>
          {rootFolder && <p>Root Folder: {rootFolder}</p>}
          {selectedFiles.length > 0 && (
            <div>
              <h3>Selected Files:</h3>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file}</li>
                ))}
              </ul>
            </div>
          )}
          {movedFiles.length > 0 && (
            <div>
              <h3>Moved Files:</h3>
              <ul>
                {movedFiles.map((file, index) => (
                  <li key={index}>{file}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex-1 p-4">
          <Tabs>
            <TabList>
              <Tab>Tree and Grid View</Tab>
              <Tab>List View</Tab>
              <Tab>Other Tab</Tab>
            </TabList>

            <TabPanel>
              <div className="flex">
                <div className="w-1/2">
                  <TreeView title="Assigned Tree" data={treeData.assigned} />
                </div>
                <div className="w-1/2">
                  <TreeView title="Unassigned Tree" data={treeData.unassigned} />
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <ListView data={treeData.assigned} />
            </TabPanel>
            <TabPanel>
              <div>
                <h1>Other Content</h1>
                {/* Add other content here */}
              </div>
            </TabPanel>
          </Tabs>
        </div>
      </div>
    );
}

const root = createRoot(document.body);
root.render(<App/>);

export default App;