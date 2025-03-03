import { FC, ReactNode } from 'react';
import { classNames } from '@utils';

type LabelProps = {
  htmlFor?: string;
  className?: string;
  children: ReactNode;
};

export const Label: FC<LabelProps> = ({ htmlFor, className = '', children }) => {
  return (
    <label htmlFor={htmlFor} className={classNames('block font-medium text-sm', className)}>
      {children}
    </label>
  );
};
