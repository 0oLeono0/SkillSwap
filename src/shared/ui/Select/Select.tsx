import { useRef, useMemo, useId, useCallback } from 'react';
import type { SelectProps } from './types';
import { SelectVariant } from './types';
import '../../../app/styles/index.css';
import './Select.css';
import type { SelectOption } from '../MultiSelectCheckboxList/types';

import { useSelectState } from './hooks/useSelectState';
import { useSelectSearch } from './hooks/useSelectSearch';
import { useSelectKeyboard } from './hooks/useSelectKeyboard';
import { useClickOutside } from './hooks/useClickOutside';

import { SelectInput } from './ui/SelectInput';
import { SelectOptionsList } from './ui/SelectOptionsList';

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Выберите...',
  disabled = false,
  label,
  variant = 'closed'
}) => {
  const selectRef = useRef<HTMLDivElement | null>(null);
  const uniqueId = useId();

  const isMultiple = variant === SelectVariant.Multiple;
  const isSearchable = variant === SelectVariant.Search;
  const isClosed = variant === SelectVariant.Closed;

  const { isOpen, open, close, toggle } = useSelectState(disabled);

  const { searchTerm, filteredOptions, clearSearch, updateSearch } =
    useSelectSearch(options, isSearchable || isMultiple);

  const normalizedValue = useMemo(() => {
    if (isMultiple) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return typeof value === 'string' ? value : '';
  }, [value, isMultiple]);

  const selectedOptions = useMemo(() => {
    if (isMultiple && Array.isArray(normalizedValue)) {
      return options.filter((opt) => normalizedValue.includes(opt.value));
    }
    return options.find((opt) => opt.value === normalizedValue);
  }, [options, normalizedValue, isMultiple]);

  const hasValue = isMultiple
    ? Array.isArray(normalizedValue) && normalizedValue.length > 0
    : !!normalizedValue;

  const handleOptionClick = useCallback(
    (optionValue: string) => {
      if (isMultiple) {
        const currentValues = Array.isArray(normalizedValue)
          ? normalizedValue
          : [];
        const newValues = currentValues.includes(optionValue)
          ? currentValues.filter((value) => value !== optionValue)
          : [...currentValues, optionValue];
        onChange(newValues);
      } else {
        onChange(optionValue);
        close();
        clearSearch();
      }
    },
    [isMultiple, normalizedValue, onChange, close, clearSearch]
  );

  const handleSelectByIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < filteredOptions.length) {
        handleOptionClick(filteredOptions[index].value);
      }
    },
    [filteredOptions, handleOptionClick]
  );

  const { highlightedIndex, setHighlightedIndex, handleKeyDown, optionsRef } =
    useSelectKeyboard({
      isOpen,
      disabled,
      optionsCount: filteredOptions.length,
      onOpen: open,
      onClose: close,
      onSelect: handleSelectByIndex,
      onClearSearch: clearSearch
    });

  useClickOutside(selectRef, () => {
    close();
    clearSearch();
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSearchable || isMultiple) {
      updateSearch(e.target.value);
      if (!isOpen) {
        open();
      }
      setHighlightedIndex(0);
    }
  };

  const handleInputFocus = () => {
    if (!disabled && !isOpen) {
      open();
      clearSearch();
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (
      selectRef.current &&
      !selectRef.current.contains(e.relatedTarget as Node)
    ) {
      close();
      clearSearch();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(isMultiple ? [] : '');
    clearSearch();
  };

  const inputValue = useMemo(() => {
    if (isOpen && (isSearchable || isMultiple)) {
      return searchTerm;
    }
    if (
      !isMultiple &&
      selectedOptions &&
      typeof selectedOptions === 'object' &&
      'label' in selectedOptions
    ) {
      return selectedOptions.label;
    }
    return '';
  }, [isOpen, searchTerm, selectedOptions, isSearchable, isMultiple]);

  const multiSelectOptions: SelectOption[] = options.map((option, index) => ({
    id: index,
    name: option.label
  }));

  const selectedMultiIds = useMemo(() => {
    if (!isMultiple || !Array.isArray(normalizedValue)) return [];
    return normalizedValue
      .map((value) => options.findIndex((option) => option.value === value))
      .filter((idx) => idx !== -1);
  }, [normalizedValue, options, isMultiple]);

  const handleMultiSelectChange = (selectedIds: number[]) => {
    const newValues = selectedIds.map((id) => options[id].value);
    onChange(newValues);
  };

  const isMultipleWithSelection =
    isMultiple &&
    Array.isArray(selectedOptions) &&
    selectedOptions.length > 0 &&
    !isOpen;

  const isInputReadOnly = isClosed || (!isOpen && hasValue && !isMultiple);

  return (
    <>
      {label && (
        <label htmlFor={uniqueId} className='custom-select__label'>
          {label}
        </label>
      )}
      <div
        ref={selectRef}
        className={`custom-select-wrapper ${
          isOpen ? 'custom-select--open' : ''
        } ${disabled ? 'custom-select-wrapper--disabled' : ''}`}
      >
        <div
          className={`custom-select ${isOpen ? 'custom-select--open' : ''}`}
          aria-haspopup='listbox'
          aria-expanded={isOpen}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          <div className='custom-select__selected-value'>
            <SelectInput
              id={uniqueId}
              value={inputValue}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={isInputReadOnly}
              hasValue={hasValue}
              isSearchable={isSearchable}
              isMultipleWithSelection={isMultipleWithSelection}
              selectedCount={
                Array.isArray(selectedOptions) ? selectedOptions.length : 0
              }
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onClear={handleClear}
              onToggle={toggle}
            />
          </div>
          {isOpen && (
            <ul className='custom-select__options' role='listbox'>
              <SelectOptionsList
                uniqueId={uniqueId}
                isMultiple={isMultiple}
                options={options}
                filteredOptions={filteredOptions}
                normalizedValue={normalizedValue}
                highlightedIndex={highlightedIndex}
                optionsRef={optionsRef}
                multiSelectOptions={multiSelectOptions}
                selectedMultiIds={selectedMultiIds}
                onOptionClick={handleOptionClick}
                onMultiSelectChange={handleMultiSelectChange}
                onMouseEnter={setHighlightedIndex}
              />
            </ul>
          )}
        </div>
      </div>
    </>
  );
};
