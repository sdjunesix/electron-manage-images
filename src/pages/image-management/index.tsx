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
  const [images, setImages] = useState([]);
  const [folders, setFolders] = useState([]);
  const [inputValue, setInputValue] = useState<string>('');

  const fetchData = async () => {
    try {
      // Use Promise.all to fetch images and folders concurrently
      let [root, dataImages, dataFolders] = await Promise.all([
        window.electron.getRoot(),
        window.electron.getImages(),
        window.electron.getFolders(),
      ]);
      // console.log('root folder: ', root);
      // console.log('dataFolders: ', dataFolders);
      // console.log('dataImages: ', dataImages);
      if (!!root) {
        setRootFolder(root.path);
      }
      let currentNode = null;
      if (!!dataFolders?.length) {
        currentNode = dataFolders[0];
        setSelectedNode(currentNode);
      }
      if (!!currentNode && !!dataImages?.length) {
        handleSetImages(dataImages, currentNode);
      }
      setRootData(root);
      setFolders(dataFolders);
      setImages(dataImages);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSetImages = (arrImages: any[] = [], currentNode: any) => {
    const filterImages = arrImages?.filter(img => img?.folders === currentNode?.name);
    const formatImages = filterImages.map(img => ({
      ...img,
      version: img?.data?.current_version,
      caption: img?.data?.versions?.[img?.data?.current_version]?.caption,
      quality: img?.data?.versions?.[img?.data?.current_version]?.quality,
      folders: [img?.folders],
      'Date Added': img?.data?.versions?.[img?.data?.current_version]?.createdAt,
    }));
    setImagesNode(formatImages);
  }

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
        data: { current_version: 'v1.0', versions: { 'v1.0': { quality: 3, caption: 'New caption', createdAt: dayjs().format('YYYY MMM DD') } } },
        children: [] as any[],
      };
      addImageToFolder(currentUnassignedFolder, newImage);
    });
    const updatedRoot = updateById(rootData, '1', currentUnassignedFolder);
    await window.electron.updateTreeData(1, JSON.stringify(updatedRoot));
    fetchData();
  };

  const handleAddFolder = async (folderName: string) => {
    const currentFolderId = orderBy(folders, 'id', 'desc')?.[0]?.id || 0;
    console.log(currentFolderId)
    const newFolder = {
      id: (Number(currentFolderId) + 1).toString(),
      type: 'folder',
      path: rootFolder + '/' + folderName,
      name: folderName,
      data: {},
      children: [] as any[]
    };
    const newRootData = {
      ...rootData,
      children: [
        ...rootData.children,
        newFolder,
      ]
    }
    await window.electron.updateTreeData(1, JSON.stringify(newRootData));
    fetchData();
  }

  useEffect(() => {
    fetchData();
  }, []);

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
                  console.log(inputValue);
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
          nodes={folders}
          currentNode={selectedNode}
          onSelect={(node) => {
            setSelectedNode(node);
            handleSetImages(images, node)
          }}
          className={classNames('', selectedTab === 'Folders' ? '' : 'min-w-60')}
        />
        {selectedTab === 'Images' && (
          <div className="flex-1 px-4">
            <p className="mb-4 p-3 text-muted_foreground bg-muted/50 rounded-lg">
              Showing <span className="text-black">6</span> images
            </p>
            <Table
              rows={imagesNode}
              hiddenColumns={['id', 'type', 'path', 'data', 'children']}
              formatters={{
                'Date Added': (value: any) => dayjs(value).format('D/M/YYYY'),
                quality: (value: any) => <Rating value={value} notHover size={4} />,
                folders: (values: any) => {
                  if (!!values?.length) {
                    return values?.map((item: any, index: number) => (
                      <div key={index} className="flex space-x-1">
                        <Tag  value={item} className="bg-muted border-none" />
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
                  onClick: (row) => setIsModalOpen(true),
                },
              ]}
            />
          </div>
        )}
        {selectedTab === 'Grid' && (
          <div className="flex-1 px-4">
            <p className="mb-4 text-right">
              <span className="py-1 px-2 text-muted_foreground bg-muted/50 rounded-lg">20</span>
            </p>
            <div className="grid grid-cols-4 gap-4">
              {imagesNode.map((image: any) => (
                <ImageCard
                  key={image.id}
                  src={image.src}
                  title={image.title}
                  tags={image.tags}
                  version={image.version}
                  rating={image.rating}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <ModalImage isOpen={isModalOpen} onClose={setIsModalOpen} />
    </div>
  );
};
