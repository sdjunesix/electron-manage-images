import { FC, useEffect, useRef, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { classNames } from '@utils';
import { Action } from './Table';

type DropdownProps = {
  actions: Action[];
  value: any;
  position?: 'top-left' | 'bottom-left' | 'top-right' | 'bottom-right';
};

export const Dropdown: FC<DropdownProps> = ({ actions, value, position = 'bottom-left' }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPositionClass = () => {
    switch (position) {
      case 'top-left':
        return 'bottom-full right-0 mb-1';
      case 'top-right':
        return 'bottom-full left-0 mb-1';
      case 'bottom-left':
        return 'top-full right-0 mt-1';
      case 'bottom-right':
        return 'top-full left-0 mt-1'
      default:
        return 'right-0 mt-1';
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-fit">
      <button
        type="button"
        title={''}
        onClick={() => setOpen(!open)}
        className="px-2.5 h-8 rounded-md hover:bg-accent hover:text-white flex items-center justify-center"
      >
        <BsThreeDotsVertical />
      </button>

      {open && (
        <div className={classNames('absolute w-40 bg-white border rounded shadow-lg z-10 py-1', getPositionClass())}>
          {actions.map((action, i) => (
            <button
              key={i}
              type="button"
              className="px-2.5 py-1 w-full hover:bg-accent hover:text-white flex items-center space-x-2"
              onClick={() => {
                action.onClick(value);
                setOpen(false);
              }}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
