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
    <div ref={selectRef} className={classNames('relative min-w-28', className)}>
      <div
        className="flex items-center justify-between space-x-1 px-3 py-2 border border-line rounded-md cursor-pointer max-h-[38px]"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{selected?.label || 'Select...'}</span>
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

interface MultiSelectProps {
  options: Option[];
  values: Option[];
  onChange: (selected: Option[]) => void;
  className?: string;
}

export const MultiSelect: FC<MultiSelectProps> = ({ options, values, onChange, className = '' }) => {
  const selectRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option: Option) => {
    if (values.find((opt) => opt.value === option.value)) {
      onChange(values.filter((opt) => opt.value !== option.value));
    } else {
      onChange([...values, option]);
    }
  };

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
    <div ref={selectRef} className={classNames('relative min-w-28', className)}>
      <div className="flex items-center justify-between space-x-1 px-3 py-2 border border-line rounded-md cursor-pointer max-h-[38px]" onClick={toggleDropdown}>
        <div className="flex flex-wrap gap-1">
          {values.length > 0 ? (
            values.map((ops, index) => (
              <span key={index} className="bg-accent text-white text-sm px-1 py-0.5 rounded flex items-center">
                {options.find((opt) => opt.value === ops.value)?.label}
              </span>
            ))
          ) : (
            <span className="text-muted_foreground">Select...</span>
          )}
        </div>
        <FaChevronDown className={classNames('w-3 h-3 transition-all', isOpen ? 'rotate-180 ease-out' : 'ease-in')} />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded-md shadow-lg overflow-hidden z-50 p-1">
          {options.map((opt: Option) => (
            <div
              key={opt.value}
              className='px-3 py-2 cursor-pointer rounded-md transition-all relative pl-5 hover:text-white hover:bg-accent_50'
              onClick={() => handleSelect(opt)}
            >
              {values.find((ops) => ops?.value === opt.value) && <FaCheck className="absolute top-3 left-0.5" />}
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
