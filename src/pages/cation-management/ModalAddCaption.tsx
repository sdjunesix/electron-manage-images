import { Dispatch, FC, SetStateAction, useState } from 'react';
import { Modal, ButtonPrimary, SingleSelect } from '@components';
import { optionsFolder, optionsVersion } from '@constants';

type ModalAddCaptionProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
};

export const ModalAddCaption: FC<ModalAddCaptionProps> = ({ isOpen, onClose }) => {
  const [selectedOptionVersion, setSelectedVersion] = useState(null);

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)} title="Select Prompt Version" className="w-[450px]">
      <p className='text-muted_foreground mt-1.5 mb-4'>Choose which prompt version to use for generating captions</p>
      <SingleSelect options={optionsVersion} value={selectedOptionVersion} onChange={setSelectedVersion} className="w-full" />
      <ButtonPrimary className="w-full mt-4">Run</ButtonPrimary>
    </Modal>
  );
};
