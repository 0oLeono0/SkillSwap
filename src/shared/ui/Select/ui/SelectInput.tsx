import CloseIcon from '../../../assets/icons/actions/cross.svg';
import Chevron from '../../../assets/icons/navigation/chevron.svg';

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
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onClear: (e: React.MouseEvent) => void;
  onToggle: () => void;
}

export const SelectInput: React.FC<SelectInputProps> = ({
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
  onToggle
}) => {
  const displayValue = isMultipleWithSelection
    ? `Выбрано: ${selectedCount}`
    : value;

  const handleInputClick = isMultipleWithSelection ? onToggle : undefined;

  return (
    <>
      <input
        id={id}
        className='custom-select__input'
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
          type='button'
          className='custom-select__close-button'
        >
          <img src={CloseIcon} alt='Close' />
        </button>
      )}
      {(!hasValue || !isSearchable || isMultipleWithSelection) && (
        <button
          onClick={onToggle}
          type='button'
          className='custom-select__chevron-button'
        >
          <img src={Chevron} alt='Toggle' />
        </button>
      )}
    </>
  );
};
