// useLocalStorage hook
import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('[useLocalStorage] Failed to read key', key, error);
      return initialValue;
    }
  });
  const setValue = (value: T) => {
    setStoredValue(value);
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('[useLocalStorage] Failed to persist key', key, error);
    }
  };
  return [storedValue, setValue] as const;
}
