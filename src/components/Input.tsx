import { FC, InputHTMLAttributes } from 'react';
import { classNames } from '@utils';

export const Input: FC<InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <p className="flex-1 text-sm overflow-hidden p-[1px] rounded-md focus-within:ring-2 focus-within:ring-violet-400">
      <input className={classNames('w-full rounded-md border border-line px-3 py-2 placeholder:text-muted_foreground focus:outline-none', className)} {...props} />
    </p>
  );
};
