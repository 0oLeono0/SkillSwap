import { useState, useRef, useEffect, type ComponentProps } from 'react';
import { Button } from '@/shared/ui/button/Button';
import CalendarIcon from '@/shared/assets/icons/content/calendar.svg?react';
import styles from './DatePicker.module.css';
import { Calendar } from './Calendar/Calendar';

const DEFAULT_PLACEHOLDER = 'ДД.ММ.ГГГ';

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const [day, month, year] = value.split(/[./-]/).map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

type DatePickerProps = {
  title?: string;
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
} & Omit<ComponentProps<'div'>, 'onChange'>;

export const DatePicker = ({
  title: label,
  value,
  onChange,
  placeholder = DEFAULT_PLACEHOLDER,
  className = '',
  ...divProps
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    parseDate(value),
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setSelectedDate(parseDate(value));
    }
  }, [value]);

  const handleSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleApply = () => {
    if (!selectedDate) return;
    onChange?.(formatDate(selectedDate));
    setIsOpen(false);
  };

  const handleCancel = () => {
    setSelectedDate(parseDate(value));
    setIsOpen(false);
  };

  const handleInputClick = () => {
    setSelectedDate((prev) => prev ?? new Date());
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={`${styles.datePicker} ${className}`} ref={ref} {...divProps}>
      <div className={styles.wrapper}>
        {label && <label className={styles.title}>{label}</label>}

        <div className={styles.inputWrapper} onClick={handleInputClick}>
          <input
            type="text"
            value={value ?? ''}
            placeholder={placeholder}
            className={styles.input}
            readOnly
          />
          <CalendarIcon />
        </div>
      </div>

      {isOpen && (
        <div className={styles.calendarPopup}>
          <Calendar
            date={selectedDate ?? new Date()}
            onSelect={handleSelect}
            selectedDate={selectedDate ?? undefined}
          />
          <div className={styles.actions}>
            <Button
              onClick={handleCancel}
              variant="secondary"
              aria-label="Закрыть календарь"
            >
              Отменить
            </Button>
            <Button
              onClick={handleApply}
              variant="primary"
              aria-label="Выбрать дату"
            >
              Выбрать
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
