import type { FC, RefObject } from 'react';
import { MultiSelectCheckboxList } from '../../MultiSelectCheckboxList/MultiSelectCheckboxList';
import type { SelectOption as CheckboxOption } from '../../MultiSelectCheckboxList/types';
import type { SelectOption } from '../types';

interface SelectOptionsListProps {
  uniqueId: string;
  isMultiple: boolean;
  filteredOptions: SelectOption[];
  options?: SelectOption[]; // optional, passed through for compatibility
  normalizedValue: string | string[];
  highlightedIndex: number;
  optionsRef: RefObject<HTMLLIElement[]>;
  multiSelectOptions: CheckboxOption[];
  selectedMultiIds: number[];
  onOptionClick: (value: string) => void;
  onMultiSelectChange: (_selectedIds: number[]) => void;
  onMouseEnter: (index: number) => void;
}

export const SelectOptionsList: FC<SelectOptionsListProps> = (props) => {
  if (props.isMultiple) {
    return (
      <MultiSelectCheckboxList
        options={props.multiSelectOptions}
        selectedIds={props.selectedMultiIds}
        onChange={props.onMultiSelectChange}
      />
    );
  }

  const {
    uniqueId,
    filteredOptions,
    normalizedValue,
    highlightedIndex,
    optionsRef,
    onOptionClick,
    onMouseEnter,
  } = props;

  if (filteredOptions.length === 0) {
    return <li className="custom-select__no-options">Нет вариантов</li>;
  }

  return (
    <>
      {filteredOptions.map((option, index) => {
        const isSelected = option.value === normalizedValue;

        return (
          <li
            key={option.value}
            ref={(element) => {
              if (element) {
                const ref = optionsRef.current;
                if (ref) {
                  ref[index] = element;
                }
              }
            }}
            className={`custom-select__option ${
              isSelected ? 'custom-select__option--selected' : ''
            } ${
              index === highlightedIndex
                ? 'custom-select__option--highlighted'
                : ''
            }`}
            onClick={(event) => {
              event.stopPropagation();
              onOptionClick(option.value);
            }}
            onMouseEnter={() => onMouseEnter(index)}
            role="option"
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
