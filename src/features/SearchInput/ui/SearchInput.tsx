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
    setValue('');
    setSearchParams({});
  }

  useEffect(() => {
    if (debouncedValue) {
      setSearchParams({ [paramKey]: debouncedValue });
    } else {
      setSearchParams({});
    }
  }, [debouncedValue, paramKey, setSearchParams]);

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
