import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from './FilterPanel';
import type { FilterPanelProps } from '../types';

const buildProps = (
  overrides: Partial<FilterPanelProps> = {}
): FilterPanelProps => ({
  filters: {
    mode: 'all',
    status: 'all',
    gender: undefined,
    cities: [],
    skillIds: []
  },
  cities: [],
  skillGroups: [],
  filtersCount: 0,
  onModeChange: jest.fn(),
  onStatusChange: jest.fn(),
  onGenderChange: jest.fn(),
  onCitySelect: jest.fn(),
  onSkillSelect: jest.fn(),
  onFilterReset: jest.fn(),
  ...overrides
});

describe('FilterPanel', () => {
  it('calls onStatusChange when author status changes', async () => {
    const user = userEvent.setup();
    const onStatusChange = jest.fn();
    render(<FilterPanel {...buildProps({ onStatusChange })} />);

    await user.click(screen.getByRole('radio', { name: 'Активные' }));

    expect(onStatusChange).toHaveBeenCalledWith('active');
  });
});
