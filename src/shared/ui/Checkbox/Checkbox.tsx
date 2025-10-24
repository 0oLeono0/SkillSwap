import type { FC } from 'react';
import clsx from 'classnames';
import styles from './Checkbox.module.scss';
import type { CheckboxVariant } from './types';

import CheckboxDoneIcon from '../../assets/icons/checkbox/checkbox-done.svg?react';
import CheckboxRemoveIcon from '../../assets/icons/checkbox/checkbox-remove.svg?react';
import CheckboxEmptyIcon from '../../assets/icons/checkbox/checkbox-empty.svg?react';

interface CheckboxProps {
  variant: CheckboxVariant;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Checkbox: FC<CheckboxProps> = ({ variant, checked, onChange }) => {
  const renderIcon = () => {
    switch (variant) {
      case 'done':
        return <CheckboxDoneIcon />;
      case 'remove':
        return <CheckboxRemoveIcon />;
      case 'empty':
      default:
        return <CheckboxEmptyIcon />;
    }
  };

  return (
    <label className={clsx(styles.checkbox, styles[variant])}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <div
        className={styles.checkboxInner}
        role="presentation"
        onClick={() => onChange(!checked)}
      >
        {renderIcon()}
      </div>
    </label>
  );
};
