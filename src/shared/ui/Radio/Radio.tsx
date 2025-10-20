import './Radio.css';

import {
  type PropsWithChildren,
  type InputHTMLAttributes,
  useContext,
  useMemo,
  type ChangeEvent
} from 'react';
import classNames from 'classnames';
import { RadioGroupContext } from './RadioContext';

export type RadioGroupProps = PropsWithChildren<{
  name: string;
  value?: string;
  title?: string;
  className?: string;
  disabled?: boolean;
  onChange?: (evt: ChangeEvent<HTMLInputElement>, value: string) => void;
}>;

export function RadioGroup({
  name,
  value,
  title,
  className,
  disabled,
  onChange,
  children
}: RadioGroupProps) {
  const contextValue = useMemo(() => ({
    name,
    selectedValue: value,
    onChange: (evt: ChangeEvent<HTMLInputElement>, val: string) =>
      onChange?.(evt, val),
    disabled
  }), [name, value, onChange, disabled]);

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <fieldset
        role='radiogroup'
        data-disabled={disabled ? '' : undefined}
        className={classNames('radioGroup_root', className)}
      >
        {!!title && <div className='title'>{title}</div>}
        {children}
      </fieldset>
    </RadioGroupContext.Provider>
  );
}

function useRadioContext() {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) {
    throw new Error('Radio must used within RadioGroup');
  }
  return ctx;
}

export type RadioProps = InputHTMLAttributes<HTMLInputElement> & {
  title: string;
  value: string;
};

export function Radio({ id, className, value, title, ...rest }: RadioProps) {
  const { name, selectedValue, onChange } = useRadioContext();

  return (
    <label htmlFor={id} className={classNames('radio', className)}>
      <input
        {...rest}
        id={id}
        name={name}
        type='radio'
        value={value}
        checked={value === selectedValue}
        onChange={(evt) => onChange(evt, value)}
      />
      <span className='radio-title'>{title}</span>
    </label>
  );
}
