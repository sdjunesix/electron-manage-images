import { Dispatch, FC, SetStateAction, useState } from 'react';
import { FiFolderPlus } from 'react-icons/fi';
import { Modal, ButtonOutline, ButtonPrimary, Rating, Label, Input, ImageView, Tabs, Tag, Textarea, Tree } from '@components';
import { mockTreeData } from '@pages/image-management';

type ModalImageProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
};

export const ModalImage: FC<ModalImageProps> = ({ isOpen, onClose }) => {
  const [star, setStar] = useState(0);
  const [selectedTab, setSelectedTab] = useState('Images');

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)} title="" className="w-2/3 min-h-[500px]">
      <div className="flex space-x-6">
        <div className="w-1/2 space-y-4">
          <Input />
          <ImageView src={`https://preview--imaginerix-flow.lovable.app/captions`} />
          <div>
            <Label children="Quality Rating" className='bg-muted' />
            <Rating maxStars={5} value={star} size={7} onChange={setStar} />
          </div>
        </div>
        <div className="w-1/2">
          <Tabs tabs={['Images', 'Caption']} className="w-full" currentTab={selectedTab} onSelect={setSelectedTab} />
          {selectedTab === 'Images' && (
            <div className="mt-2 space-y-4">
              <div>
                <p className="flex items-center space-x-2">
                  <Input />
                  <ButtonOutline className="text-xl" disabled={false} onClick={() => {}}>
                    <FiFolderPlus />
                  </ButtonOutline>
                </p>
              </div>
              <Tree nodes={mockTreeData} currentNode={null} onSelect={() => {}} className='border border-line p-2 rounded-md' />
            </div>
          )}
          {selectedTab === 'Caption' && (
            <div className="mt-2 space-y-4">
              <div>
                <p className="flex items-center space-x-2">
                  <Tag value="v1.3" />
                  <span>0 words</span>
                </p>
              </div>
              <Textarea placeholder="No caption available" />
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-2">
        <ButtonOutline disabled={false} onClick={() => onClose(false)}>
          Cancel
        </ButtonOutline>
        <ButtonPrimary disabled={false}>Save Changes</ButtonPrimary>
      </div>
    </Modal>
  );
};
