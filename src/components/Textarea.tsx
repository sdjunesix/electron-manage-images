import { FC, TextareaHTMLAttributes } from 'react';
import { classNames } from '@utils';

export const Textarea: FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => {
  return (
    <p className="text-sm overflow-hidden p-[1px] rounded-md focus-within:ring-2 focus-within:ring-violet-300 flex">
      <textarea
        className={classNames(
          'w-full rounded-md border !border-line px-3 py-2 mr-0 bg-muted placeholder:text-muted_foreground',
          className
        )}
        {...props}
        style={{ boxShadow: 'unset' }}
      />
    </p>
  );
};
