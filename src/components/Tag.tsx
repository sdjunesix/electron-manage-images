import { classNames } from '@utils';
import { FC } from 'react';

export const Tag: FC<{ value: string; className?: string }> = ({ value, className = '' }) => {
  if (!value) return null;
  return <span className={classNames('px-2.5 py-0.5 border border-line text-xs rounded-full inline-block', className)}>{value}</span>;
};
