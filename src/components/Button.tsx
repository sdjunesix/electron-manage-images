import { FC, ReactNode } from 'react';
import { classNames } from '@utils';

type ButtonProps = {
  type?: 'button' | 'submit';
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export const ButtonPrimary: FC<ButtonProps> = ({ type = 'button', children, onClick, disabled, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        'text-sm px-4 py-2 rounded-md hover:bg-accent_50 transition bg-accent text-white whitespace-nowrap',
        'disabled:bg-gray-400 disabled:cursor-not-allowed',
        'flex items-center justify-center space-x-2',
        className
      )}
    >
      {children}
    </button>
  );
};

export const ButtonOutline: FC<ButtonProps> = ({ type = 'button', children, onClick, disabled, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        'text-sm px-4 py-2 rounded-md hover:bg-accent_50 transition bg-white text-black whitespace-nowrap',
        'disabled:bg-white disabled:text-gray-400 disabled:cursor-not-allowed',
        'border border-line hover:text-white',
        'flex items-center justify-center space-x-2',
        className
      )}
    >
      {children}
    </button>
  );
};
