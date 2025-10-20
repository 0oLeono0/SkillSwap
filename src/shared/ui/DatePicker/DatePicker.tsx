import { useState, useRef, useEffect, type ComponentProps } from 'react';
import { Button } from '@/shared/ui/button/Button';
import CalendarIcon from '@/shared/assets/icons/content/calendar.svg?react';
import styles from './DatePicker.module.css';
import { Calendar } from './Calendar/Calendar';

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
  placeholder = 'ДД.ММ.ГГГГ',
  className = '',
  ...divProps
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    parseDate(value)
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
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
    const formatted = formatDate(selectedDate!);
    onChange?.(formatted);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (value) {
      setSelectedDate(parseDate(value));
    }
    setIsOpen(false);
  };

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleInputClick = () => {
    if (value) {
      setSelectedDate(parseDate(value));
    } else {
      setSelectedDate(new Date());
    }
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`${styles.datePicker} ${className}`}
      ref={ref}
      {...divProps}
    >
      <div className={styles.wrapper}>
        {label && <label className={styles.title}>{label}</label>}

        <div className={styles.inputWrapper} onClick={handleInputClick}>
          <input
            type='text'
            value={value || ''}
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
              variant='secondary'
              aria-label='Закрыть календарь'
            >
              Отменить
            </Button>
            <Button
              onClick={handleApply}
              variant='primary'
              aria-label='Выбрать дату'
            >
              Выбрать
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const [day, month, year] = value.split(/[./-]/).map(Number);
  const d = new Date(year, month - 1, day);
  return d instanceof Date && !isNaN(d.getTime()) ? d : null;
}
