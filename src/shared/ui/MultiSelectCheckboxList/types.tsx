export interface SelectOption {
  id: number;
  name: string;
}

export interface MultiSelectCheckboxListProps {
  options: SelectOption[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
}