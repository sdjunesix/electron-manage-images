import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { FiFolderPlus } from 'react-icons/fi';
import { Modal, ButtonOutline, ButtonPrimary, Rating, Label, Input, ImageView, Tabs, Tag, Textarea, Tree } from '@components';
import dayjs from 'dayjs';
import { TreeNode } from '@models/index';
import { updateById } from '@utils';

type ModalImageProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  onRefreshData?: () => void;
  folders?: any;
  data: any;
  rootData: TreeNode | null;
};

export const ModalImage: FC<ModalImageProps> = ({ isOpen, onClose, folders = [], data, rootData, onRefreshData }) => {
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Folders');
  const [quality, setQuality] = useState(0);
  const [inputName, setInputName] = useState<string>('');
  const [inputCaption, setInputCaption] = useState<string>('');
  const [inputFolder, setInputFolder] = useState<string>('');

  const onSaveChanges = async () => {
    setLoading(true);
    const versionSuffix = data?.current_version?.split('.')?.[1] || 0;
    const versionPrefix = data?.current_version?.split('.')?.[0] || 'v1';
    const version = `${versionPrefix}.${Number(versionSuffix) + 1}`;
    const newImage = {
      id: data?.id,
      type: data?.type,
      path: data?.path,
      name: inputName,
      data: {
        current_version: version,
        versions: { 
          ...data.data?.versions,
          [version]: { quality, caption: inputCaption, date_added: dayjs().format('YYYY MMM DD') }
        },
      },
      children: [] as any[],
    };
    const updatedRoot = updateById(rootData, data?.id, newImage);
    await window.electron.updateTreeData(1, JSON.stringify(updatedRoot));
    setLoading(false);
    onClose(false);
    onRefreshData();
  };

  useEffect(() => {
    setInputName(data?.name || '');
    setInputCaption(data?.caption || '');
    setQuality(data?.quality || '');
  }, [data]);

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)} title="" className="w-2/3 min-h-[500px]">
      <div className="flex space-x-6">
        <div className="w-1/2 space-y-4">
          <Input value={inputName} onChange={(e) => setInputName(e.target.value)} />
          <ImageView src={`file://${data?.path}`} />
          <div>
            <Label children="Quality Rating" className="" />
            <Rating maxStars={5} value={quality} size={7} onChange={setQuality} />
          </div>
        </div>
        <div className="w-1/2">
          <Tabs tabs={['Folders', 'Caption']} className="w-full" currentTab={selectedTab} onSelect={setSelectedTab} />
          {selectedTab === 'Folders' && (
            <div className="mt-2 space-y-4">
              <div>
                <p className="flex items-center space-x-2">
                  <Input value={inputFolder} onChange={(e) => setInputFolder(e.target.value)} />
                  <ButtonOutline className="text-xl" disabled={false} onClick={() => {}}>
                    <FiFolderPlus />
                  </ButtonOutline>
                </p>
              </div>
              <Tree nodes={folders} currentNode={null} onSelect={() => {}} className="border border-line p-2 rounded-md" />
            </div>
          )}
          {selectedTab === 'Caption' && (
            <div className="mt-2 space-y-4">
              <div>
                <p className="flex items-center space-x-2">
                  <Tag value={data?.version} />
                  <span>{inputCaption?.trim()?.split(' ')?.length} words</span>
                </p>
              </div>
              <Textarea
                value={inputCaption}
                onChange={(e) => setInputCaption(e.target.value)}
                placeholder="No caption available"
                className="bg-muted"
              />
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-2">
        <ButtonOutline disabled={false} onClick={() => onClose(false)}>
          Cancel
        </ButtonOutline>
        <ButtonPrimary
          disabled={loading}
          onClick={onSaveChanges}
        >
          Save Changes
        </ButtonPrimary>
      </div>
    </Modal>
  );
};
