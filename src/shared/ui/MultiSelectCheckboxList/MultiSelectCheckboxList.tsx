import type { FC } from 'react';
import { Checkbox } from '../Checkbox/Checkbox';
import type { MultiSelectCheckboxListProps } from './types';
import styles from './MultiSelectCheckboxList.module.css';

export const MultiSelectCheckboxList: FC<MultiSelectCheckboxListProps> = ({
  options,
  selectedIds,
  onChange,
}) => {
  const handleOptionChange = (optionId: number, checked: boolean) => {
    if (checked) {
      onChange([...selectedIds, optionId]);
    } else {
      onChange(selectedIds.filter((id) => id !== optionId));
    }
  };

  return (
    <div className={styles.select}>
      {options.map((option) => (
        <label key={option.id} className={styles.item}>
          <Checkbox
            variant={selectedIds.includes(option.id) ? 'done' : 'empty'}
            checked={selectedIds.includes(option.id)}
            onChange={(checked) => handleOptionChange(option.id, checked)}
          />
          <span className={styles.label}>{option.name}</span>
        </label>
      ))}
    </div>
  );
};
