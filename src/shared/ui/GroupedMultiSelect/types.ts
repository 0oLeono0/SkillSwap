import type { SelectOption } from '@/shared/ui/MultiSelectCheckboxList/types.tsx';

export interface GroupedMultiSelectProps {
  parentOption: SelectOption;
  options: SelectOption[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
}