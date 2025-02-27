import { Dispatch, FC, SetStateAction, useState } from 'react';
import { Modal, ButtonPrimary, Label, Input, SingleSelect } from '@components';
import { optionsFolder } from '@constants';

type ModalNewFolderProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
};

export const ModalNewFolder: FC<ModalNewFolderProps> = ({ isOpen, onClose }) => {
  const [selectedOptionFolder, setSelectedOptionFolder] = useState(null);

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)} title="Add New Folder" className="w-[300px]">
      <div className='mt-4'>
        <Label children="Parent Folder (Optional)" />
        <SingleSelect options={optionsFolder} value={selectedOptionFolder} onChange={setSelectedOptionFolder} className="w-full" />
      </div>
      <div className='mt-4'>
        <Label children="Folder Name" />
        <Input placeholder="Enter folder name" />
      </div>
      <ButtonPrimary className='w-full mt-4'>Save Changes</ButtonPrimary>
    </Modal>
  );
};
