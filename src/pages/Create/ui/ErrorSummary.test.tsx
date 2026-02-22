import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { VisibleFieldError } from '../model/useCreateSkillForm';
import {
  CREATE_SKILL_CONSTRAINTS,
  CREATE_SKILL_ERROR_MESSAGES
} from '../model/form';
import { CREATE_SKILL_COPY, CREATE_SKILL_FIELD_LABELS } from '../model/content';
import { ErrorSummary } from './ErrorSummary';

const ERROR_SUMMARY_ID = 'create-errors';

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getErrorSummaryFieldButton = (label: string) =>
  screen.getByRole('button', {
    name: new RegExp(`^${escapeRegExp(label)}:`, 'i')
  });

const createErrorSummaryErrors = (): VisibleFieldError[] => [
  {
    field: 'title',
    label: CREATE_SKILL_FIELD_LABELS.title,
    message: `Минимум ${CREATE_SKILL_CONSTRAINTS.titleMin} символа`
  },
  {
    field: 'description',
    label: CREATE_SKILL_FIELD_LABELS.description,
    message: CREATE_SKILL_ERROR_MESSAGES.descriptionRequired
  }
];

describe('ErrorSummary', () => {
  it('does not render when error list is empty', () => {
    const { container } = render(
      <ErrorSummary id={ERROR_SUMMARY_ID} errors={[]} onSelect={jest.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders errors and focuses selected field via callback', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const errors = createErrorSummaryErrors();

    render(
      <ErrorSummary id={ERROR_SUMMARY_ID} errors={errors} onSelect={onSelect} />
    );

    expect(screen.getByRole('alert')).toHaveAttribute('id', ERROR_SUMMARY_ID);
    expect(
      screen.getByText(CREATE_SKILL_COPY.errorSummaryTitle)
    ).toBeInTheDocument();

    await user.click(
      getErrorSummaryFieldButton(CREATE_SKILL_FIELD_LABELS.title)
    );
    await user.click(
      getErrorSummaryFieldButton(CREATE_SKILL_FIELD_LABELS.description)
    );

    expect(onSelect).toHaveBeenNthCalledWith(1, 'title');
    expect(onSelect).toHaveBeenNthCalledWith(2, 'description');
  });
});
