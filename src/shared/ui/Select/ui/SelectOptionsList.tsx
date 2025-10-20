import type { SelectOption } from '../../MultiSelectCheckboxList/types';
import type { SelectOption as Option } from '../types';
import { MultiSelectCheckboxList } from '../../MultiSelectCheckboxList/MultiSelectCheckboxList';

interface SelectOptionsListProps {
  uniqueId: string;
  isMultiple: boolean;
  options: Option[];
  filteredOptions: Option[];
  normalizedValue: string | string[];
  highlightedIndex: number;
  optionsRef: React.RefObject<HTMLLIElement[]>;
  multiSelectOptions: SelectOption[];
  selectedMultiIds: number[];
  onOptionClick: (value: string) => void;
  onMultiSelectChange: (selectedIds: number[]) => void;
  onMouseEnter: (index: number) => void;
}

export const SelectOptionsList: React.FC<SelectOptionsListProps> = ({
  uniqueId,
  isMultiple,
  filteredOptions,
  normalizedValue,
  highlightedIndex,
  optionsRef,
  multiSelectOptions,
  selectedMultiIds,
  onOptionClick,
  onMultiSelectChange,
  onMouseEnter
}) => {
  if (isMultiple) {
    return (
      <MultiSelectCheckboxList
        options={multiSelectOptions}
        selectedIds={selectedMultiIds}
        onChange={onMultiSelectChange}
      />
    );
  }

  if (filteredOptions.length === 0) {
    return <li className='custom-select__no-options'>Нет совпадений</li>;
  }

  return (
    <>
      {filteredOptions.map((option, index) => {
        const isSelected = option.value === normalizedValue;

        return (
          <li
            key={option.value}
            ref={(element) => {
              if (element) optionsRef.current[index] = element;
            }}
            className={`custom-select__option ${
              isSelected ? 'custom-select__option--selected' : ''
            } ${
              index === highlightedIndex
                ? 'custom-select__option--highlighted'
                : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onOptionClick(option.value);
            }}
            onMouseEnter={() => onMouseEnter(index)}
            role='option'
            aria-selected={isSelected}
            id={`option-${uniqueId}-${index}`}
          >
            {option.label}
          </li>
        );
      })}
    </>
  );
};
