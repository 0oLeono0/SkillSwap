import { useState, useMemo, type KeyboardEvent } from 'react';
import { Select } from '@/shared/ui/Select';
import { SelectVariant } from '@/shared/ui/Select/types';
import styles from './Calendar.module.css';

interface CalendarProps {
  date: Date;
  onSelect: (date: Date) => void;
  selectedDate?: Date;
}

const MONTH_LABELS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const;

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const Calendar = ({ date, onSelect, selectedDate }: CalendarProps) => {
  const [current, setCurrent] = useState(date);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let year = 1970; year <= 2030; year += 1) {
      list.push(year);
    }
    return list;
  }, []);

  const today = new Date();

  const days = useMemo(() => {
    const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
    const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();

    const startDay = (startOfMonth.getDay() + 6) % 7;
    const daysArray: Array<number | null> = Array(startDay).fill(null);

    for (let i = 1; i <= daysInMonth; i += 1) {
      daysArray.push(i);
    }

    return daysArray;
  }, [current]);

  const isToday = (day: number) =>
    day === today.getDate() &&
    current.getMonth() === today.getMonth() &&
    current.getFullYear() === today.getFullYear();

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      current.getMonth() === selectedDate.getMonth() &&
      current.getFullYear() === selectedDate.getFullYear()
    );
  };

  const getSafeDayInMonth = (year: number, month: number, day: number) => {
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    return Math.min(day, lastDayOfMonth);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, day: number) => {
    if (!day) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(new Date(current.getFullYear(), current.getMonth(), day));
    }
  };

  const handleMonthChange = (value: string | string[]) => {
    const normalized = Array.isArray(value) ? value[0] ?? '' : value;
    const newMonth = Number(normalized);
    setCurrent((prev) => {
      const currentDay = selectedDate?.getDate() ?? prev.getDate();
      const safeDay = getSafeDayInMonth(prev.getFullYear(), newMonth, currentDay);
      const newDate = new Date(prev.getFullYear(), newMonth, safeDay);
      onSelect(newDate);
      return newDate;
    });
  };

  const handleYearChange = (value: string | string[]) => {
    const normalized = Array.isArray(value) ? value[0] ?? '' : value;
    const newYear = Number(normalized);
    setCurrent((prev) => {
      const currentDay = selectedDate?.getDate() ?? prev.getDate();
      const safeDay = getSafeDayInMonth(newYear, prev.getMonth(), currentDay);
      const newDate = new Date(newYear, prev.getMonth(), safeDay);
      onSelect(newDate);
      return newDate;
    });
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <Select
          value={String(current.getMonth())}
          options={MONTH_LABELS.map((label, index) => ({ label, value: String(index) }))}
          onChange={handleMonthChange}
          variant={SelectVariant.Search}
          placeholder="Месяц"
        />

        <Select
          value={String(current.getFullYear())}
          options={years.map((year) => ({ label: String(year), value: String(year) }))}
          onChange={handleYearChange}
          variant={SelectVariant.Closed}
          placeholder="Год"
        />
      </div>

      <div className={styles.grid} role="grid">
        {WEEKDAY_LABELS.map((weekday) => (
          <div key={weekday} className={styles.dayName}>
            {weekday}
          </div>
        ))}

        {days.map((day, index) => {
          const isAvailableDay = Boolean(day);
          const isSelectedDay = isAvailableDay && isSelected(day!);

          return (
            <div
              key={index}
              tabIndex={isAvailableDay ? 0 : -1}
              className={`${styles.day} ${!isAvailableDay ? styles.empty : ''} ${
                isAvailableDay && isToday(day as number) ? styles.today : ''
              } ${isSelectedDay ? styles.selected : ''}`}
              onClick={() =>
                isAvailableDay &&
                onSelect(new Date(current.getFullYear(), current.getMonth(), day as number))
              }
              onKeyDown={(event) => isAvailableDay && handleKeyDown(event, day as number)}
              role={isAvailableDay ? 'button' : undefined}
              aria-pressed={isSelectedDay || undefined}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};
