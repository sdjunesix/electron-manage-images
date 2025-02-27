import { FC } from 'react';
import { classNames } from '@utils';

type TabsProps = {
  tabs: string[];
  currentTab: string;
  onSelect: (tab: string) => void;
  className?: string;
};

export const Tabs: FC<TabsProps> = ({ tabs = [], currentTab = '', onSelect, className = '' }) => {
  return (
    <ul className={classNames('bg-muted w-fit rounded-md p-1 overflow-hidden flex items-center', className)}>
      {tabs.map((tab, index) => {
        return (
          <li
            key={index}
            className={classNames(
              'flex-1 text-muted_foreground font-medium text-sm py-1.5 px-3 rounded-sm transition-all duration-300',
              currentTab === tab ? '!text-black bg-white' : ''
            )}
          >
            <button type='button' className='w-full' onClick={() => onSelect(tab)}>{tab}</button>
          </li>
        );
      })}
    </ul>
  );
};
