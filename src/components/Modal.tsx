import { FC, ReactNode } from 'react';
import { IoClose } from 'react-icons/io5';
import { classNames } from '@utils';

type ModalProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
};

export const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 bg-opacity-50 z-50">
      <div className={classNames('bg-white rounded-lg shadow-lg min-w-96 p-6 relative', className)}>
        {title && <h2 className="text-xl font-bold">{title}</h2>}
        <button type="button" title={''} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl" onClick={onClose}>
          <IoClose />
        </button>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
};
