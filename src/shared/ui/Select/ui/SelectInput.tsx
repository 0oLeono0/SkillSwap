import type {
  ChangeEvent,
  FocusEvent,
  MouseEvent,
  FC,
} from 'react';
import CloseIcon from '../../../assets/icons/actions/cross.svg';
import ChevronIcon from '../../../assets/icons/navigation/chevron.svg';

interface SelectInputProps {
  id: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  readOnly: boolean;
  hasValue: boolean;
  isSearchable: boolean;
  isMultipleWithSelection: boolean;
  selectedCount: number;
  onChange: (_event: ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: (_event: FocusEvent<HTMLInputElement>) => void;
  onClear: (_event: MouseEvent<HTMLButtonElement>) => void;
  onToggle: () => void;
}

export const SelectInput: FC<SelectInputProps> = ({
  id,
  value,
  placeholder,
  disabled,
  readOnly,
  hasValue,
  isSearchable,
  isMultipleWithSelection,
  selectedCount,
  onChange,
  onFocus,
  onBlur,
  onClear,
  onToggle,
}) => {
  const displayValue = isMultipleWithSelection
    ? `Выбрано: ${selectedCount}`
    : value;

  const handleInputClick = isMultipleWithSelection ? onToggle : undefined;

  return (
    <>
      <input
        id={id}
        className="custom-select__input"
        value={displayValue}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onClick={handleInputClick}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly || isMultipleWithSelection}
        style={
          readOnly || isMultipleWithSelection
            ? { caretColor: 'transparent' }
            : undefined
        }
      />
      {hasValue && isSearchable && !isMultipleWithSelection && (
        <button
          onClick={onClear}
          type="button"
          className="custom-select__close-button"
          aria-label="Очистить выбранное значение"
        >
          <img src={CloseIcon} alt="Очистить" />
        </button>
      )}
      {(!hasValue || !isSearchable || isMultipleWithSelection) && (
        <button
          onClick={onToggle}
          type="button"
          className="custom-select__chevron-button"
          aria-label="Открыть список вариантов"
        >
          <img src={ChevronIcon} alt="Открыть" />
        </button>
      )}
    </>
  );
};
