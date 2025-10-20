import { type FC, type InputHTMLAttributes, type SVGProps } from 'react';
import classNames from 'classnames';
import styles from './Input.module.css';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  title?: string;
  hint?: string;
  leftIcon?: FC<SVGProps<SVGSVGElement>>;
  rightIcon?: FC<SVGProps<SVGSVGElement>>;
  error?: string | null;
  inputWrapperClassName?: string;
  searchInput?: boolean;
  onRightIconClick?: () => void;
};

export function Input({
  title,
  hint,
  className,
  inputWrapperClassName,
  value = '',
  disabled,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  error,
  searchInput,
  onRightIconClick, 
  ...rest
}: InputProps) {
  const hasError = !!error;

  return (
    <fieldset
      className={classNames(
        styles.input,
        className,
        {
          [styles.error]: hasError,
          [styles.disabled]: disabled,
          [styles.searchInput]: searchInput, 
        }
      )}
      data-disabled={disabled ? '' : undefined}
    >
      {!!title && (
        <label className={styles.inputTitle} htmlFor={rest.id || rest.name}>
          {title}
        </label>
      )}
      <div
        className={classNames(styles.inputFormWrap, {
          [styles.error]: hasError,
          [styles.searchInputWrap]: searchInput,
        })}
      >
        {!!LeftIcon && <LeftIcon className={styles.leftIcon} />}
        <input {...rest} value={value} className={styles.inputForm} />
        {!!RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className={styles.iconButton}
          >
            <RightIcon className={styles.rightIcon} />
          </button>
        )}
      </div>
      {(!!hint || hasError) && (
        <div className={styles.inputHint}>{hasError ? error : hint}</div>
      )}
    </fieldset>
  );
}
