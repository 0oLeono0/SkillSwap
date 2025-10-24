import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type KeyboardEvent,
} from 'react';

interface UseSelectKeyboardProps {
  isOpen: boolean;
  disabled: boolean;
  optionsCount: number;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (index: number) => void;
  onClearSearch: () => void;
}

export const useSelectKeyboard = ({
  isOpen,
  disabled,
  optionsCount,
  onOpen,
  onClose,
  onSelect,
  onClearSearch
}: UseSelectKeyboardProps) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const optionsRef = useRef<HTMLLIElement[]>([]);

  useEffect(() => {
    if (!isOpen || optionsCount === 0) {
      setHighlightedIndex(-1);
    } else if (highlightedIndex === -1 && optionsCount > 0) {
      setHighlightedIndex(0);
    }
    optionsRef.current = [];
  }, [isOpen, optionsCount, highlightedIndex]);

  useEffect(() => {
    if (highlightedIndex !== -1 && optionsRef.current[highlightedIndex]) {
      optionsRef.current[highlightedIndex].scrollIntoView({
        block: 'nearest',
        inline: 'start'
      });
    }
  }, [highlightedIndex]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            onOpen();
            setHighlightedIndex(0);
          } else {
            setHighlightedIndex((prevIndex) =>
              prevIndex < optionsCount - 1 ? prevIndex + 1 : 0
            );
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (!isOpen) {
            onOpen();
            setHighlightedIndex(optionsCount - 1);
          } else {
            setHighlightedIndex((prevIndex) =>
              prevIndex > 0 ? prevIndex - 1 : optionsCount - 1
            );
          }
          break;

        case 'Enter':
          event.preventDefault();
          if (isOpen && highlightedIndex !== -1) {
            onSelect(highlightedIndex);
          } else if (!isOpen) {
            onOpen();
            setHighlightedIndex(0);
          }
          break;

        case 'Escape':
          event.preventDefault();
          onClose();
          onClearSearch();
          break;

        case 'Tab':
          onClose();
          onClearSearch();
          break;
      }
    },
    [
      isOpen,
      highlightedIndex,
      optionsCount,
      disabled,
      onOpen,
      onClose,
      onSelect,
      onClearSearch
    ]
  );

  return {
    highlightedIndex,
    setHighlightedIndex,
    handleKeyDown,
    optionsRef
  };
};
