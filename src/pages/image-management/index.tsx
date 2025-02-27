import { FC, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { FaPencil, FaCheck } from 'react-icons/fa6';
import { FaPlus } from 'react-icons/fa';
import { Tabs, Tree, Table, ImageView, Rating, Tag, Input, ButtonPrimary } from '@components';
import { ModalImage } from './ModalImage';
import { classNames } from '@utils';
import { Image } from '@models/index';
import ImageCard from './ImageCard';

export const mockTreeData: any = [
  {
    id: '1',
    name: 'Root 1',
    children: [
      {
        id: '1-1',
        name: 'Folder A',
        children: [
          { id: '1-1-1', name: 'File A1' },
          { id: '1-1-2', name: 'File A2' },
        ],
      },
      {
        id: '1-2',
        name: 'Folder B',
        children: [{ id: '1-2-1', name: 'File B1' }],
      },
    ],
  },
  {
    id: '2',
    name: 'Root 2',
    children: [
      {
        id: '2-1',
        name: 'Folder A',
        children: null,
      },
      {
        id: '2-2',
        name: 'Folder B',
        children: [{ id: '2-2-1', name: 'File B1' }],
      },
    ],
  },
];

// 'Name', 'Date Added', 'Folders', 'Captions', 'Version', 'Quality', 'Actions'
const mockTableData: any = [
  { id: 1, name: 'Product A', quality: 2, version: 'v1.1', captions: true, 'Date Added': Date(), folders: ['Test'] },
  { id: 2, name: 'Product B', quality: 1, version: '', captions: false, 'Date Added': Date(), folders: [] },
  { id: 3, name: 'Product C', quality: 4, version: '', captions: true, 'Date Added': Date(), folders: [] },
];

export const ImageManagementPage: FC = () => {
  const [selectedTab, setSelectedTab] = useState('Images');
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [images, setImages] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.electron.listImages();
      setImages(data);
    };
    fetchData();
  }, [])

  return (
    <div className="p-5">
      <Tabs tabs={['Images', 'Grid', 'Folders']} currentTab={selectedTab} onSelect={setSelectedTab} />
      <div className={classNames('', selectedTab === 'Folders' ? '' : 'mt-6 flex')}>
        {selectedTab === 'Folders' && (
          <div className="flex-1 flex items-center justify-between py-2">
            <h1 className="text-balance font-semibold">Folder Structure</h1>
            <div className="flex items-center space-x-2">
              <Input />
              <ButtonPrimary disabled={false}>
                <FaPlus />
                <span>Add Folder</span>
              </ButtonPrimary>
            </div>
          </div>
        )}
        <Tree
          nodes={mockTreeData}
          currentNode={selectedNode}
          onSelect={setSelectedNode}
          className={classNames('', selectedTab === 'Folders' ? '' : 'min-w-60')}
        />
        {selectedTab === 'Images' && (
          <div className="flex-1 px-4">
            <p className="mb-4 p-3 text-muted_foreground bg-muted/50 rounded-lg">
              Showing <span className="text-black">6</span> images
            </p>
            <Table
              rows={images}
              hiddenColumns={['id']}
              formatters={{
                'Date Added': (value: any) => dayjs(value).format('D/M/YYYY'),
                quality: (value: any) => <Rating value={value} notHover size={4} />,
                folders: (values: any) => {
                  if (!!values?.length) {
                    return values?.map((item: any, index: number) => (
                      <div className='flex space-x-1'>
                      <Tag key={index} value={item} className="bg-muted border-none" />
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
              {images.map((image: any) => (
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
