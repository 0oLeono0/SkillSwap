import { useState, useMemo, useCallback } from 'react';
import type { SelectOption } from '../types';

export const useSelectSearch = (
  options: SelectOption[],
  isSearchEnabled: boolean
) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm || !isSearchEnabled) {
      return options;
    }
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, isSearchEnabled]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const updateSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  return {
    searchTerm,
    filteredOptions,
    clearSearch,
    updateSearch
  };
};
