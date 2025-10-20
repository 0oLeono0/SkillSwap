import { useState, useCallback } from 'react';

export const useSelectState = (disabled: boolean) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
    }
  }, [disabled]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen
  };
};
