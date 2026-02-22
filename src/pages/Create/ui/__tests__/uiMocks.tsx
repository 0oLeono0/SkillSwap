/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  type ChangeEvent,
  type ReactNode
} from 'react';

export interface SelectMockProps {
  label?: string;
  options: Array<{ value: string; label: string }>;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  inputAriaDescribedBy?: string;
  inputAriaInvalid?: boolean;
}

export const mockSelect = ({
  label,
  options,
  value,
  onChange,
  disabled,
  inputAriaDescribedBy,
  inputAriaInvalid
}: SelectMockProps) => (
  <label>
    {label}
    <select
      aria-label={label}
      aria-describedby={inputAriaDescribedBy}
      aria-invalid={inputAriaInvalid}
      value={typeof value === 'string' ? value : ''}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value=''>--</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

export interface InputMockProps {
  id: string;
  title: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string;
  errorId?: string;
}

export const mockInput = ({
  id,
  title,
  value,
  onChange,
  onBlur,
  error,
  errorId,
  ...rest
}: InputMockProps) => (
  <label htmlFor={id}>
    {title}
    <input
      id={id}
      aria-label={title}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      {...rest}
    />
    {error ? <span id={errorId}>{error}</span> : null}
  </label>
);

export interface ButtonMockProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const mockButton = ({
  children,
  onClick,
  disabled,
  type = 'button'
}: ButtonMockProps) => (
  <button type={type} onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

export const mockRadioModule = () => {
  const radioContext = createContext<{
    selectedValue?: string;
    onChange?: (_event: ChangeEvent<HTMLInputElement>, value: string) => void;
  } | null>(null);

  const RadioGroup = ({
    value,
    onChange,
    children
  }: {
    value?: string;
    onChange?: (_event: ChangeEvent<HTMLInputElement>, value: string) => void;
    children: ReactNode;
  }) => (
    <div role='radiogroup'>
      <radioContext.Provider value={{ selectedValue: value, onChange }}>
        {children}
      </radioContext.Provider>
    </div>
  );

  const Radio = ({
    value,
    title,
    ...rest
  }: {
    value: string;
    title: string;
  }) => {
    const context = useContext(radioContext);
    return (
      <label>
        <input
          {...rest}
          type='radio'
          value={value}
          checked={value === context?.selectedValue}
          onChange={(event) => context?.onChange?.(event, value)}
        />
        {title}
      </label>
    );
  };

  return { RadioGroup, Radio };
};
