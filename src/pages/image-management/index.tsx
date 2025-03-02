import { FC, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { FaPencil } from 'react-icons/fa6';
import { FaPlus } from 'react-icons/fa';
import { Tabs, Tree, Table, Rating, Tag, Input, ButtonPrimary } from '@components';
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
import { selectFiles, selectFolder } from '@services';
import { TreeNode } from '@models/index';
import { orderBy } from 'lodash';

export const ImageManagementPage: FC = () => {
  const [rootData, setRootData] = useState<TreeNode | null>(null);
  const [rootFolder, setRootFolder] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('Images');
  const [selectedNode, setSelectedNode] = useState(null);
  const [imagesNode, setImagesNode] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [folders, setFolders] = useState([]);
  const [inputValue, setInputValue] = useState<string>('');

  const fetchData = async () => {
    try {
      let [root, dataImages, dataFolders] = await Promise.all([
        window.electron.getRoot(),
        window.electron.getImages(),
        window.electron.getFolders(),
      ]);
      // console.log('root: ', root);
      // console.log('dataFolders: ', dataFolders);
      // console.log('dataImages: ', dataImages);
      if (!!root) {
        setRootFolder(root.path);
      }
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
    // transform files to images & add to unassigned folder
    let currentUnassignedFolder = getUnassignedFolder(rootData);
    files.map((f) => {
      const newImage = {
        type: 'image',
        path: f,
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTab === 'Folders') {
      setSelectedNode(null);
      setImagesNode([]);
    }
  }, [selectedTab]);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <Tabs tabs={['Images', 'Grid', 'Folders']} currentTab={selectedTab} onSelect={setSelectedTab} />
        <div className="flex space-x-2">
          <ButtonPrimary disabled={!!rootFolder} onClick={handleSelectFolder}>
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
        <Tree
          nodes={rootData?.children}
          currentNode={selectedNode}
          onSelect={(node) => {
            if (selectedTab === 'Folders') return;
            setSelectedNode(node);
            handleSetImages(node);
          }}
          className={classNames('', selectedTab === 'Folders' ? '' : 'min-w-60')}
          showAction={selectedTab === 'Folders'}
          // quantity={imagesNode?.length}
          onUpdate={handleUpdateFolder}
          onDelete={handleRemoveFolder}
        />
        {selectedTab === 'Images' && (
          <div className="flex-1 px-4">
            <p className="mb-4 p-3 text-muted_foreground bg-muted/50 rounded-lg">
              Showing <span className="text-black">{imagesNode?.length}</span> images
            </p>
            <Table
              rows={imagesNode}
              hiddenColumns={['id', 'type', 'path', 'data', 'children']}
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
                  label: '',
                  icon: <FaPencil />,
                  onClick: (row) => {
                    setSelectedImage(row);
                    setIsModalOpen(true);
                  },
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
              {imagesNode.map((image: any) => (
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
              ))}
            </div>
          </div>
        )}
      </div>
      <ModalImage data={selectedImage} rootData={rootData} isOpen={isModalOpen} onRefreshData={fetchData} onClose={setIsModalOpen} />
    </div>
  );
};
