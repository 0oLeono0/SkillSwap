/* eslint-disable @typescript-eslint/no-unused-vars */
export interface SelectOption {
  id: number;
  name: string;
}

export interface MultiSelectCheckboxListProps {
  options: SelectOption[];
  selectedIds: number[];
  onChange: (_selectedIds: number[]) => void;
}
