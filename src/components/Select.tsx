import { FC, useEffect, useRef, useState } from 'react';
import { classNames } from '@utils';
import { Option } from 'types/common';
import { FaChevronDown, FaCheck } from 'react-icons/fa6';

type SingleSelectProps = {
  options: Option[];
  value: Option;
  onChange: (value: Option) => void;
  className?: string;
};

export const SingleSelect: FC<SingleSelectProps> = ({ options, value: selected, onChange, className = '' }) => {
  const selectRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className={`relative min-w-28 ${className}`}>
      <div
        className="flex items-center justify-between space-x-1 px-3 py-2 border border-line rounded-md cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{selected?.label || 'Select'}</span>
        <FaChevronDown className={classNames('w-3 h-3 transition-all', isOpen ? 'rotate-180 ease-out' : 'ease-in')} />
      </div>

      {isOpen && (
        <ul className="absolute left-0 right-0 mt-1 bg-white border rounded-md shadow-lg overflow-hidden z-50 p-1">
          {options.map((option: Option) => (
            <li
              key={option.value}
              className="px-3 py-2 cursor-pointer rounded-md transition-all relative pl-5 hover:text-white hover:bg-accent_50"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {selected?.value === option.value && <FaCheck className="absolute top-3 left-0.5" />}
              <span>{option.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
