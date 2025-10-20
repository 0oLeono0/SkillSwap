import { type FC, useState } from 'react';
import type { GroupedMultiSelectProps } from './types.ts';
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox.tsx';
import { MultiSelectCheckboxList } from '@/shared/ui/MultiSelectCheckboxList/MultiSelectCheckboxList.tsx';
import type { CheckboxVariant } from '@/shared/ui/Checkbox/types.ts';
import styles from './GroupedMultiSelect.module.css';
import OpenedIcon from '@/shared/assets/icons/navigation/chevron.svg?react';
import clsx from 'clsx';

export const GroupedMultiSelect: FC<GroupedMultiSelectProps> = (props) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const { parentOption, options, selectedIds, onChange } = props;
  const groupChecked = selectedIds.length === options.length;

  const variant: CheckboxVariant =
    selectedIds.length === 0 ? 'empty' :
      selectedIds.length === options.length ? 'done' : 'remove';

  const handleGroupChange = () => {
    const newSelectedIds = groupChecked ? [] : options.map(option => option.id);
    onChange(newSelectedIds);
  };

  const toggleOpen = () => {
    setIsOpened(!isOpened);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <label className={styles.option}>
          <Checkbox variant={variant} checked={groupChecked} onChange={handleGroupChange} />
          <span className={styles.label}>{parentOption.name}</span>
        </label>
        <OpenedIcon
          className={clsx(styles.openedIcon, { [styles.rotated]: isOpened })}
          role="button"
          tabIndex={0}
          aria-expanded={isOpened}
          aria-label={isOpened ? 'Свернуть список' : 'Развернуть список'}
          onClick={toggleOpen}
        />
      </div>
      <div className={clsx(styles.options, { [styles.optionsOpened]: isOpened })}>
        <MultiSelectCheckboxList options={options} selectedIds={selectedIds} onChange={onChange} />
      </div>
    </div>
  );
};