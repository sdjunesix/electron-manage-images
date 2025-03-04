import { FC, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { RiDeleteBin6Line, RiPencilFill } from 'react-icons/ri';
import { FaPlus } from 'react-icons/fa';
import { Tabs, Table, Rating, Tag, Input, ButtonPrimary, TreeDragDrop } from '@components';
import { ModalImage } from './ModalImage';
import {
  classNames,
  getAssignedFolders,
  getUnassignedFolder,
  addImageToFolder,
  updateById,
  getFilenameWithoutExtension,
  filterNodeType,
  deleteById,
} from '@utils';
import ImageCard from './ImageCard';
import { getRootFolder, selectFiles, selectFolder } from '@services';
import { TreeNode } from '@models/index';
import { orderBy } from 'lodash';

export const ImageManagementPage: FC = () => {
  const [rootData, setRootData] = useState<TreeNode | null>(null);
  const [rootFolder, setRootFolder] = useState<string | null>('');
  const [selectedTab, setSelectedTab] = useState('Images');
  const [selectedNode, setSelectedNode] = useState(null);
  const [imagesNode, setImagesNode] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [folders, setFolders] = useState([]);
  const [inputValue, setInputValue] = useState<string>('');

  const fetchRootFolder = async () => {
    const rootNode: TreeNode = await getRootFolder();
    if (rootNode) setRootFolder(rootNode.path);
  };

  const fetchData = async () => {
    try {
      let [root, dataImages, dataFolders] = await Promise.all([
        window.electron.getRoot(),
        window.electron.getImages(),
        window.electron.getFolders(),
      ]);
      console.log('root: ', root);
      // console.log('dataFolders: ', dataFolders);
      // console.log('dataImages: ', dataImages);
      let currentNode = null;
      if (!!root?.children?.length) {
        currentNode = root?.children[0];
        handleSetImages(currentNode);
        setSelectedNode(currentNode);
      }
      setRootData(root);
      setFolders(dataFolders);
      setImages(dataImages);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSetImages = (currentNode: any) => {
    const filterImages = filterNodeType(currentNode, 'image');
    const formatImages = filterImages.map((img: any) => ({
      ...img,
      version: img?.data?.current_version,
      caption: img?.data?.versions?.[img?.data?.current_version]?.caption,
      quality: img?.data?.versions?.[img?.data?.current_version]?.quality,
      folders: [img?.parent?.name],
      date_added: img?.data?.versions?.[img?.data?.current_version]?.date_added,
    }));
    setImagesNode(formatImages);
  };

  const handleSelectFolder = async () => {
    const path = await selectFolder();
    if (path) {
      setRootFolder(path);
    }
  };

  const handleSelectFiles = async () => {
    const files = await selectFiles();
    await window.electron.moveFiles(files, rootFolder);
    let currentUnassignedFolder = getUnassignedFolder(rootData);
    files.map((f) => {
      const newImage = {
        type: 'image',
        path: rootFolder + '/' + f.split('/').pop(),
        name: getFilenameWithoutExtension(f),
        data: {
          current_version: 'v1.0',
          versions: { 'v1.0': { quality: 3, caption: 'New caption', date_added: dayjs().format('YYYY MMM DD') } },
        },
        children: [] as any[],
      };
      addImageToFolder(currentUnassignedFolder, newImage);
    });
    const updatedRoot = updateById(rootData, '1', currentUnassignedFolder);
    await window.electron.updateTreeData(1, JSON.stringify(updatedRoot));
    fetchData();
  };

  const handleAddFolder = async (folderName: string) => {
    const currentFolderId = orderBy(rootData?.children, 'id', 'desc')?.[0]?.id || 0;
    const newFolder = {
      id: (Number(currentFolderId) + 1).toString(),
      type: 'folder',
      path: rootFolder + '/' + folderName,
      name: folderName,
      data: {},
      children: [] as any[],
    };
    const newRootData = {
      ...rootData,
      children: [...rootData.children, newFolder],
    };
    await window.electron.updateTreeData(1, JSON.stringify(newRootData));
    fetchData();
  };

  const handleUpdateFolder = async (node: TreeNode) => {
    const updatedRoot = updateById(rootData, node?.id, node);
    await window.electron.updateTreeData(1, JSON.stringify(updatedRoot));
    fetchData();
  };

  const handleRemoveFolder = async (node: TreeNode) => {
    const updatedRoot = deleteById(rootData, node?.id);
    await window.electron.updateTreeData(1, JSON.stringify(updatedRoot));
    fetchData();
  };

  const handleRemoveImage = async (node: TreeNode) => {
    const updatedRoot = deleteById(rootData, node?.id);
    await window.electron.updateTreeData(1, JSON.stringify(updatedRoot));
    fetchData();
  };

  const handleMoveNode = async (draggedNode: TreeNode, targetNode: TreeNode, position: 'above' | 'below' | 'inside') => {
    if (draggedNode.name === 'Unassigned') return;
    if (position === 'inside' && targetNode.name === 'Unassigned') return;
    if (position === 'above' && targetNode.name === 'Unassigned') return;

    // const unassignedIndex = rootData.children.findIndex((node) => node.name === 'Unassigned');
    // if (unassignedIndex !== -1 && unassignedIndex + 1 < rootData.children.length) {
    //   const nodeAfterUnassigned = rootData.children[unassignedIndex + 1];
    //   if (nodeAfterUnassigned.id === targetNode.id && position === 'above') return;
    // }

    if (position === 'inside') {
      const targetLevel = targetNode.id.split('.').length;
      console.log(targetNode.id, targetLevel);
      if (targetLevel > 1 && draggedNode.children && draggedNode.children.length > 0) return;
    }

    const newTreeData = [...rootData.children];

    // Function to find and delete node dragged from current position
    const removeNode = (nodes: TreeNode[]): [TreeNode[], TreeNode | null] => {
      let removedNode: TreeNode | null = null;
      let result = [...nodes];

      const index = result.findIndex((node) => node.id === draggedNode.id);
      if (index > -1) {
        removedNode = { ...result[index] };
        result.splice(index, 1);
        return [result, removedNode];
      }

      for (let i = 0; i < result.length; i++) {
        if (result[i].children && result[i].children.length > 0) {
          const [newChildren, found] = removeNode(result[i].children);
          if (found) {
            result[i] = { ...result[i], children: newChildren };
            return [result, found];
          }
        }
      }

      return [result, null];
    };

    // Function to insert node into new position
    const insertNode = (nodes: TreeNode[]): TreeNode[] => {
      if (position === 'inside') {
        return nodes.map((node) => {
          if (node.id === targetNode.id) {
            return {
              ...node,
              children: node.children ? [...node.children, draggedNode] : [draggedNode],
            };
          }

          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: insertNode(node.children),
            };
          }

          return node;
        });
      }

      let result = [...nodes];
      const targetIndex = result.findIndex((node) => node.id === targetNode.id);

      if (targetIndex > -1) {
        const insertIndex = position === 'below' ? targetIndex + 1 : targetIndex;
        result.splice(insertIndex, 0, draggedNode);
        return result;
      }

      return result.map((node) => {
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: insertNode(node.children),
          };
        }
        return node;
      });
    };

    const updateAllIds = (nodes: TreeNode[], parentId = ''): TreeNode[] => {
      if (!nodes || !Array.isArray(nodes)) return nodes;

      let sortedNodes = [...nodes];
      if (parentId === '') {
        const unassignedIdx = sortedNodes.findIndex((node) => node.name === 'Unassigned');
        if (unassignedIdx > 0) {
          const unassignedNode = sortedNodes.splice(unassignedIdx, 1)[0];
          sortedNodes.unshift(unassignedNode);
        }
      }

      return sortedNodes.map((node, index) => {
        const nodeClone = { ...node };
        const positionIndex = index + 1;
        const newId = parentId ? `${parentId}.${positionIndex}` : `${positionIndex}`;

        nodeClone.id = newId;

        if (nodeClone.children && nodeClone.children.length > 0) {
          nodeClone.children = updateAllIds(nodeClone.children, newId);
        }

        return nodeClone;
      });
    };

    // Remove the dragged node from its old position
    const [dataAfterRemoval, removedNode] = removeNode(newTreeData);

    if (!removedNode) return;

    // Reset the dragged node to ensure there are no references to the old object
    draggedNode = removedNode;

    // Insert node into new position
    const finalData = insertNode(dataAfterRemoval);
    const updatedData = updateAllIds(finalData);

    const updatedRoot = { ...rootData, children: updatedData };
    console.log(updatedRoot);
    await window.electron.updateTreeData(1, JSON.stringify(updatedRoot));
    fetchData();
  };

  useEffect(() => {
    fetchRootFolder();
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTab === 'Folders') {
      setSelectedNode(null);
      setImagesNode([]);
    } else {
      if (!!rootData?.children?.length) {
        const currentNode = rootData?.children[0];
        handleSetImages(currentNode);
        setSelectedNode(currentNode);
      }
    }
  }, [selectedTab]);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <Tabs tabs={['Images', 'Grid', 'Folders']} currentTab={selectedTab} onSelect={setSelectedTab} />
        <div className="flex space-x-2">
          <ButtonPrimary onClick={handleSelectFolder}>
            <FaPlus />
            <span>Add Root Folder</span>
          </ButtonPrimary>
          <ButtonPrimary onClick={handleSelectFiles}>
            <FaPlus />
            <span>Add Images</span>
          </ButtonPrimary>
        </div>
      </div>
      <p className={classNames('py-1 text-right truncate', rootFolder ? 'opacity-100' : 'opacity-0')}>
        Root folder: <strong>{rootFolder}</strong>
      </p>
      <div className={classNames('', selectedTab === 'Folders' ? '' : 'mt-6 flex')}>
        {selectedTab === 'Folders' && (
          <div className="flex-1 flex items-center justify-between py-2">
            <h1 className="text-balance font-semibold">Folder Structure</h1>
            <div className="flex items-center space-x-2">
              <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
              <ButtonPrimary
                disabled={!inputValue}
                onClick={() => {
                  handleAddFolder(inputValue);
                  setInputValue('');
                }}
              >
                <FaPlus />
                <span>Add Folder</span>
              </ButtonPrimary>
            </div>
          </div>
        )}
        <TreeDragDrop
          nodes={rootData?.children}
          currentNode={selectedNode}
          onSelect={(node) => {
            if (selectedTab === 'Folders') return;
            setSelectedNode(node);
            handleSetImages(node);
          }}
          className={classNames('h-[calc(100vh-164px)]', selectedTab === 'Folders' ? '' : 'min-w-60')}
          showAction={selectedTab === 'Folders'}
          onUpdate={handleUpdateFolder}
          onDelete={handleRemoveFolder}
          onMove={handleMoveNode}
        />
        {selectedTab === 'Images' && (
          <div className="flex-1 px-4 w-[calc(100%-220px)]">
            <p className="mb-4 p-3 text-muted_foreground bg-muted/50 rounded-lg">
              Showing <span className="text-black">{imagesNode?.length}</span> images
            </p>
            <Table
              rows={imagesNode}
              headers={[
                { title: 'Name', value: 'name' },
                { title: 'Date Added', value: 'date_added' },
                { title: 'Folders', value: 'folders' },
                { title: 'Captions', value: 'caption' },
                { title: 'Version', value: 'version' },
                { title: 'Quality', value: 'quality' },
              ]}
              isRounded={false}
              formatters={{
                date_added: (value: any) => dayjs(value).format('D/M/YYYY'),
                quality: (value: any) => <Rating value={value} notHover size={4} />,
                folders: (values: any) => {
                  if (!!values?.length) {
                    return values?.map((item: any, index: number) => (
                      <div key={index} className="flex space-x-1">
                        <Tag value={item} className="bg-muted border-none" />
                      </div>
                    ));
                  }
                  return null;
                },
                version: (value: any) => <Tag value={value} />,
              }}
              actions={[
                {
                  label: 'Edit Image',
                  icon: <RiPencilFill />,
                  onClick: (row) => {
                    setSelectedImage(row);
                    setIsModalOpen(true);
                  },
                },
                {
                  label: 'Delete Image',
                  icon: <RiDeleteBin6Line />,
                  onClick: (row: any) => handleRemoveImage(row),
                },
              ]}
            />
          </div>
        )}
        {selectedTab === 'Grid' && (
          <div className="flex-1 px-4">
            <p className="mb-4 text-right">
              <span className="py-1 px-2 text-muted_foreground bg-muted/50 rounded-lg">{imagesNode?.length}</span>
            </p>
            <div className="grid grid-cols-4 gap-4">
              {imagesNode?.length ? (
                imagesNode.map((image: any) => (
                  <ImageCard
                    key={image.id}
                    src={image.path}
                    title={image.name}
                    tags={image.tags}
                    version={image.version}
                    rating={image.quality}
                    onClick={() => {
                      setSelectedImage(image);
                      setIsModalOpen(true);
                    }}
                  />
                ))
              ) : (
                <p className="text-center p-4">No data available</p>
              )}
            </div>
          </div>
        )}
      </div>
      <ModalImage data={selectedImage} rootData={rootData} isOpen={isModalOpen} onRefreshData={fetchData} onClose={setIsModalOpen} />
    </div>
  );
};
