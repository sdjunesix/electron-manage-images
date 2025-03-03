import { ChangeEvent, FC, useEffect, useRef } from 'react';
import { classNames } from '@utils';
import '@assets/style/index.css';

type CheckboxProps = {
  id?: string;
  label?: string;
  propsCheckbox?: any;
  disabled?: boolean;
  checked?: boolean;
  type?: 'radio' | 'checkbox';
};

export const Checkbox: FC<CheckboxProps> = ({ id, label = ' ', propsCheckbox, disabled = false, checked = false, type = 'checkbox' }) => {
  return (
    <div className="checkbox-container">
      <input {...propsCheckbox} type={type} id={id} disabled={disabled} checked={checked} />
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  );
};

type CheckboxTableProps = {
  id?: string;
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
  className?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const CheckboxTable: FC<CheckboxTableProps> = ({
  id,
  label = ' ',
  disabled = false,
  checked = false,
  indeterminate = false,
  className = '',
  onChange,
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className={classNames('checkbox-container checkbox-table', indeterminate ? 'indeterminate' : '', className)}>
      <input ref={checkboxRef} type="checkbox" id={id} disabled={disabled} checked={checked} onChange={onChange} />
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  );
};
