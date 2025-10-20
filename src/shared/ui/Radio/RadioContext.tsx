import { createContext, type ChangeEvent } from 'react';

interface IRadioGroupContext {
  name: string;
  selectedValue?: string;
  onChange: (evt: ChangeEvent<HTMLInputElement>, value: string) => void;
  disabled?: boolean;
}

export const RadioGroupContext = createContext<IRadioGroupContext | undefined>(
  undefined
);
