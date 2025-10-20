import { useState, useMemo } from 'react';
import { Select } from '@/shared/ui/Select';
import styles from './Calendar.module.css';

interface CalendarProps {
  date: Date;
  onSelect: (date: Date) => void;
  selectedDate?: Date;
}

export const Calendar = ({ date, onSelect, selectedDate }: CalendarProps) => {
  const [current, setCurrent] = useState(date);

  const months = useMemo(
    () => [
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
      'Декабрь'
    ],
    []
  );

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = 1970; y <= 2025; y++) list.push(y);
    return list;
  }, []);

  const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
  const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();

  const today = new Date();
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

  const days = useMemo(() => {
    const startDay = (startOfMonth.getDay() + 6) % 7;
    const daysArr = Array(startDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) daysArr.push(i);
    return daysArr;
  }, [current]);

  const handleKeyDown = (e: React.KeyboardEvent, day: number) => {
    if (!day) return;

    switch (e.key) {
      case 'Enter': {
        e.preventDefault();
        onSelect(new Date(current.getFullYear(), current.getMonth(), day));
        break;
      }
    }
  };

  const getSafeDayInMonth = (
    year: number,
    month: number,
    day: number
  ): number => {
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    return Math.min(day, lastDayOfMonth);
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <Select
          value={String(current.getMonth())}
          options={months.map((m, i) => ({ label: m, value: String(i) }))}
          onChange={(val) => {
            const newMonth = Number(val);

            setCurrent((prev) => {
              const currentDay = selectedDate?.getDate() || prev.getDate();
              const safeDay = getSafeDayInMonth(
                prev.getFullYear(),
                newMonth,
                currentDay
              );
              const newDate = new Date(prev.getFullYear(), newMonth, safeDay);
              onSelect(newDate);

              return newDate;
            });
          }}
          variant='search'
          placeholder='Месяц'
        />

        <Select
          value={String(current.getFullYear())}
          options={years.map((y) => ({ label: String(y), value: String(y) }))}
          onChange={(val) => {
            const newYear = Number(val);

            setCurrent((prev) => {
              const currentDay = selectedDate?.getDate() || prev.getDate();
              const safeDay = getSafeDayInMonth(
                newYear,
                prev.getMonth(),
                currentDay
              );
              const newDate = new Date(newYear, prev.getMonth(), safeDay);
              onSelect(newDate);

              return newDate;
            });
          }}
          variant='closed'
          placeholder='Год'
        />
      </div>

      <div className={styles.grid} role='grid'>
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
          <div key={d} className={styles.dayName}>
            {d}
          </div>
        ))}

        {days.map((day, i) => (
          <div
            key={i}
            tabIndex={day ? 0 : -1}
            className={`${styles.day} ${!day ? styles.empty : ''} ${
              day && isToday(day) ? styles.today : ''
            } ${day && isSelected(day) ? styles.selected : ''}`}
            onClick={() =>
              day &&
              onSelect(new Date(current.getFullYear(), current.getMonth(), day))
            }
            onKeyDown={(e) => day && handleKeyDown(e, day)}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};
