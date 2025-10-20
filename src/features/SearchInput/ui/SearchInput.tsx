import { type FC, useState, useEffect, type SVGProps } from 'react';
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

const SearchInput = ({leftIcon, rightIcon, placeholder, searchInput, debounceDelay = 500, paramKey = "search"}: SearchInputProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState<string>(searchParams.get(paramKey) || '');

  const debouncedValue = useDebounce<string>(value, debounceDelay);

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setValue(evt.target.value);
  };

  const handleReset = () => {
    setValue('');
    setSearchParams({});
  }

  useEffect(() => {
    if (debouncedValue) {
      setSearchParams({ search: debouncedValue });
    } else {
      setSearchParams({});
    }
  }, [debouncedValue, setSearchParams]);

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
