import { FC, useEffect, useRef, useState } from 'react';
import { FiFolder } from 'react-icons/fi';
import { ButtonOutline, Tree } from '@components';
import { mockTreeData } from '@pages/image-management';
import { ModalNewFolder } from './ModalNewFolder';
import { FaPlus } from 'react-icons/fa';

export const DropdownFolder: FC = () => {
  const dropdownFolderRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [openNewFolder, setOpenNewFolder] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownFolderRef.current && !dropdownFolderRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownFolderRef} className="relative w-fit">
      <ButtonOutline className="text-xl" onClick={() => setOpen(!open)}>
        <FiFolder />
      </ButtonOutline>

      {open && (
        <div className="absolute left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 w-[300px]">
          <div className="p-2 border-b border-line">
            <ButtonOutline className="w-full" onClick={() => setOpenNewFolder(!openNewFolder)}>
              <FaPlus />
              <span>Add Folder</span>
            </ButtonOutline>
          </div>
          <Tree nodes={mockTreeData} currentNode={selectedNode} onSelect={setSelectedNode} className="w-full p-2" />
        </div>
      )}
      <ModalNewFolder isOpen={openNewFolder} onClose={setOpenNewFolder} />
    </div>
  );
};
