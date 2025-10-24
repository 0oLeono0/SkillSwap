export interface SelectOption {
  value: string;
  label: string;
}
export const SelectVariant = {
  Closed: 'closed',
  Search: 'search',
  Multiple: 'multiple'
} as const;

export type SelectVariantType =
  (typeof SelectVariant)[keyof typeof SelectVariant];

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  variant?: SelectVariantType;
}
