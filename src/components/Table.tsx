import { FC, isValidElement, JSX, useMemo } from 'react';
import { classNames } from '@utils';
import { Dropdown } from './Dropdown';

export interface RowData {
  [key: string]: any;
}
type HeadersColumn = {
  title: string;
  value: string;
  width?: number;
};
type Formatter = (value: any) => any;
export type Action = { label: string; icon?: JSX.Element; onClick: (row: RowData) => void };
type TableProps = {
  rows: RowData[];
  className?: string;
  formatters?: Record<string, Formatter>;
  actions?: Action[];
  isRounded?: boolean;
  headers: HeadersColumn[];
};

export const Table: FC<TableProps> = ({ rows = [], className = '', formatters = {}, actions = [], isRounded = true, headers }) => {
  if (!rows.length) return <p className="text-center p-4">No data available</p>;

  return (
    <div className={classNames('text-sm overflow-x-auto', className)}>
      <table className="w-full text-left">
        <thead className="bg-muted_50">
          <tr>
            {headers.map((col: HeadersColumn, index: number) => {
              return (
                <th
                  key={index}
                  scope="col"
                  className={classNames(
                    'cursor-pointer px-4 py-2.5 text-muted_foreground hover:bg-muted capitalize whitespace-nowrap',
                    isRounded && index === 0 ? 'rounded-tl-lg' : '',
                    isRounded && headers.length - 1 && !actions.length ? 'rounded-tr-lg' : ''
                  )}
                >
                  {col.title}
                </th>
              );
            })}
            {actions.length > 0 && (
              <th
                className={classNames(
                  'cursor-pointer px-4 py-2.5 text-muted_foreground hover:bg-muted',
                  isRounded ? 'rounded-tr-lg' : ''
                )}
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, index: number) => {
            return (
              <tr key={index} className="bg-white cursor-pointer border-t border-line hover:bg-muted_50">
                {headers.map((col: HeadersColumn, idx: number) => {
                  const value = formatters[col.value] ? formatters[col.value](row[col.value]) : row[col.value];
                  const element = (
                    <td
                      key={idx}
                      className={classNames(
                        'px-4 py-2',
                        rows?.length - 1 === index && isRounded && idx === 0 ? 'rounded-bl-lg' : '',
                        rows?.length - 1 === index && isRounded && headers.length - 1 && !actions.length ? 'rounded-br-lg' : ''
                      )}
                    >
                      {value}
                    </td>
                  );

                  if (isValidElement(value)) {
                    return element;
                  } else if (Array.isArray(value) && value.every(isValidElement)) {
                    return element;
                  } else if (typeof value === 'number' || typeof value === 'string') {
                    return element;
                  } else if (value === null || value === undefined) {
                    return element;
                  }

                  return (
                    <td
                      key={idx}
                      className={classNames(
                        'px-4 py-2',
                        rows?.length - 1 === index && isRounded && idx === 0 ? 'rounded-bl-lg' : '',
                        rows?.length - 1 === index && isRounded && headers.length - 1 && !actions.length ? 'rounded-br-lg' : ''
                      )}
                    ></td>
                  );
                })}
                {actions.length > 0 && (
                  <td className={classNames('px-4 py-2', rows?.length - 1 === index && isRounded ? 'rounded-br-lg' : '')}>
                    {actions.length === 1 ? (
                      <button
                        className="px-2.5 h-8 rounded-md hover:bg-accent hover:text-white flex items-center justify-center space-x-2"
                        onClick={() => actions[0].onClick(row)}
                      >
                        {actions[0].icon}
                        {actions[0].label && <span>{actions[0].label}</span>}
                      </button>
                    ) : (
                      <Dropdown
                        actions={actions}
                        value={row}
                        position={rows?.length - 1 === index || rows?.length - 2 === index ? 'top-left' : 'bottom-left'}
                      />
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
