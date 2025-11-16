import {
  type ChangeEvent,
  type FC,
  type SVGProps,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/shared/ui/Input';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface SearchInputProps {
  leftIcon?: FC<SVGProps<SVGSVGElement>>;
  rightIcon?: FC<SVGProps<SVGSVGElement>>;
  placeholder?: string;
  searchInput?: boolean;
  debounceDelay?: number;
  paramKey?: string;
}

const SearchInput: FC<SearchInputProps> = ({
  leftIcon,
  rightIcon,
  placeholder,
  searchInput,
  debounceDelay = 500,
  paramKey = 'search',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState<string>(searchParams.get(paramKey) || '');

  const debouncedValue = useDebounce<string>(value, debounceDelay);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleReset = () => {
    if (!value) {
      return;
    }

    setValue('');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(paramKey);
    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    const externalValue = searchParams.get(paramKey) ?? '';
    setValue((prev) => (prev === externalValue ? prev : externalValue));
  }, [paramKey, searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    const currentValue = nextParams.get(paramKey) ?? '';

    if (debouncedValue) {
      if (currentValue === debouncedValue) {
        return;
      }
      nextParams.set(paramKey, debouncedValue);
    } else if (currentValue) {
      nextParams.delete(paramKey);
    } else {
      return;
    }

    setSearchParams(nextParams, { replace: true });
  }, [debouncedValue, paramKey, searchParams, setSearchParams]);

  return (
    <Input
      searchInput={searchInput}
      placeholder={placeholder}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      value={value}
      onChange={handleChange}
      onRightIconClick={handleReset}
    />
  );
};

export default SearchInput;
