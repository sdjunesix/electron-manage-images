import { FC, JSX, useMemo } from 'react';
import { classNames } from '@utils';
import { Dropdown } from './Dropdown';

export interface RowData {
  [key: string]: any;
}
type Formatter = (value: any) => any;
export type Action = { label: string; icon?: JSX.Element; onClick: (row: RowData) => void };
type TableProps = {
  rows: RowData[];
  className?: string;
  hiddenColumns?: string[];
  formatters?: Record<string, Formatter>;
  actions?: Action[];
};

export const Table: FC<TableProps> = ({ rows = [], className = '', hiddenColumns = [], formatters = {}, actions = [] }) => {
  if (!rows.length) return <p className="text-center p-4">No data available</p>;

  const columns: string[] = useMemo(() => Object.keys(rows[0]).filter((col) => !hiddenColumns.includes(col)), [rows]);

  return (
    <div className={classNames('text-sm overflow-x-auto', className)}>
      <table className="w-full text-left">
        <thead className="bg-muted_50">
          <tr>
            {columns.map((col: any, index: number) => {
              return (
                <th key={index} scope="col" className="cursor-pointer px-4 py-2.5 text-muted_foreground hover:bg-muted capitalize rounded-t-lg">
                  {col}
                </th>
              );
            })}
            {actions.length > 0 && <th className="cursor-pointer px-4 py-2.5 text-muted_foreground hover:bg-muted">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, index: number) => {
            return (
              <tr key={index} className="bg-white cursor-pointer border-t border-line hover:bg-muted_50">
                {columns.map((col: any, idx: number) => (
                  <td key={idx} className="px-4 py-2 rounded-bl-lg">
                    {formatters[col] ? formatters[col](row[col]) : row[col]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-4 py-2 rounded-br-lg">
                    {actions.length === 1 ? (
                      <button
                        className="px-2.5 h-8 rounded-md hover:bg-accent hover:text-white flex items-center justify-center space-x-2"
                        onClick={() => actions[0].onClick(row)}
                      >
                        {actions[0].icon}
                        {actions[0].label && <span>{actions[0].label}</span>}
                      </button>
                    ) : (
                      <Dropdown actions={actions} value={row} />
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
