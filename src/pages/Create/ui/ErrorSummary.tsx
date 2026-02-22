import styles from './create.module.scss';
import type {
  TouchedField,
  VisibleFieldError
} from '../model/useCreateSkillForm';
import { CREATE_SKILL_COPY } from '../model/content';

interface ErrorSummaryProps {
  id: string;
  errors: VisibleFieldError[];
  onSelect: (field: TouchedField) => void;
}

export const ErrorSummary = ({ id, errors, onSelect }: ErrorSummaryProps) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div
      id={id}
      className={styles.errorSummary}
      role='alert'
      aria-live='polite'
    >
      <p className={styles.errorSummaryTitle}>
        {CREATE_SKILL_COPY.errorSummaryTitle}
      </p>
      <ul className={styles.errorSummaryList}>
        {errors.map(({ field, label, message }) => (
          <li key={field}>
            <button
              type='button'
              className={styles.errorSummaryButton}
              onClick={() => onSelect(field)}
            >
              {label}: {message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
