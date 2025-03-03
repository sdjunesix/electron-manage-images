import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Modal, ButtonOutline, ButtonPrimary, Rating, Label, Input, ImageView, Tabs, Tag, Textarea, MultiSelect } from '@components';
import dayjs from 'dayjs';
import { TreeNode } from '@models/index';
import { updateById } from '@utils';
import { Option } from 'types/common';

type ModalImageProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  onRefreshData?: () => void;
  data: any;
  rootData: TreeNode | null;
};

export const ModalImage: FC<ModalImageProps> = ({ isOpen, onClose, data, rootData, onRefreshData }) => {
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Folders');
  const [quality, setQuality] = useState(0);
  const [inputName, setInputName] = useState<string>('');
  const [inputCaption, setInputCaption] = useState<string>('');
  const [selectedFolders, setSelectedFolders] = useState<Option[]>([]);
  const [isChange, setIsChange] = useState<boolean>(false);

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
          [version]: { quality, caption: inputCaption, date_added: dayjs().format('YYYY MMM DD') },
        },
      },
      children: [] as any[],
    };
    const updatedRoot = updateById(rootData, data?.id, newImage);
    await window.electron.updateTreeData(1, JSON.stringify(updatedRoot));
    setLoading(false);
    setIsChange(false);
    setSelectedFolders([]);
    onRefreshData();
    onClose(false);
  };

  const handleMoveImage = async () => {
    const folders: any = [];
    const newImage: any = {
      id: null,
      type: data?.type,
      path: data?.path,
      name: inputName,
      data: {
        current_version: data?.data?.current_version,
        versions: data?.data?.versions,
      },
      children: [] as any[],
    };

    rootData?.children?.map((item) => {
      console.log(item)
      const findFolder = selectedFolders?.find((f) => f?.label === item?.name);
      if (findFolder && !item.children?.find((img) => img.name === newImage.name)) {
        const newChildren = [...item.children];
        newChildren.push({
          ...newImage,
          id: `${item.id}.${newChildren.length + 1}`,
        });
        folders.push({
          ...item,
          children: newChildren,
        });
      } else {
        folders.push({
          ...item,
          children: [...item.children].filter((img) => img.name !== newImage.name),
        });
      }
    });
    console.log(folders);
    await window.electron.updateTreeData(1, JSON.stringify({
      ...rootData,
      children: folders
    }));
    setSelectedFolders([]);
    onRefreshData();
    onClose(false);
  };

  useEffect(() => {
    setInputName(data?.name || '');
    setInputCaption(data?.caption || '');
    setQuality(data?.quality || '');
    if (data?.parent) setSelectedFolders([{ label: data?.parent?.name, value: data?.parent?.id }]);
  }, [data]);

  const foldersOptions = useMemo(() => {
    const folders = rootData?.children || [];
    const foldersFormat = folders.map((f, i) => ({ label: f?.name, value: f?.id }));
    return foldersFormat;
  }, [rootData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsChange(false);
        setSelectedFolders([]);
        onClose(false);
      }}
      title=""
      className="w-2/3 min-h-[500px]"
    >
      <div className="flex space-x-6">
        <div className="w-1/2 space-y-4">
          <Input
            value={inputName}
            onChange={(e) => {
              setInputName(e.target.value);
              setIsChange(true);
            }}
          />
          <ImageView src={`file://${data?.path}`} />
          <div>
            <Label children="Quality Rating" className="" />
            <Rating
              maxStars={5}
              value={quality}
              size={7}
              onChange={(value) => {
                setQuality(value);
                setIsChange(true);
              }}
            />
          </div>
        </div>
        <div className="w-1/2">
          <Tabs tabs={['Folders', 'Caption']} className="w-full" currentTab={selectedTab} onSelect={setSelectedTab} />
          {selectedTab === 'Folders' && (
            <div className="mt-2 space-y-4">
              <div className="flex space-x-1 py-1">
                {data?.folders?.map((item: string) => (
                  <Tag value={item} />
                ))}
              </div>
              <div className="flex justify-between space-x-2">
                <MultiSelect options={foldersOptions} values={selectedFolders} onChange={setSelectedFolders} className="w-full" />
                <ButtonOutline disabled={!selectedFolders?.length} onClick={handleMoveImage}>
                  Apply
                </ButtonOutline>
              </div>
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
                onChange={(e) => {
                  setInputCaption(e.target.value);
                  setIsChange(true);
                }}
                placeholder="No caption available"
                className="bg-muted"
              />
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-2">
        <ButtonOutline
          onClick={() => {
            setIsChange(false);
            setSelectedFolders([]);
            onClose(false);
          }}
        >
          Cancel
        </ButtonOutline>
        <ButtonPrimary disabled={loading || !isChange} onClick={onSaveChanges}>
          Save Changes
        </ButtonPrimary>
      </div>
    </Modal>
  );
};
