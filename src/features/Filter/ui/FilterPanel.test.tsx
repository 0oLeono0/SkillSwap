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
    sortBy: 'default',
    gender: undefined,
    cities: [],
    skillIds: []
  },
  cities: [],
  skillGroups: [],
  filtersCount: 0,
  onModeChange: jest.fn(),
  onSortByChange: jest.fn(),
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

  it('calls onSortByChange when catalog sorting changes', async () => {
    const user = userEvent.setup();
    const onSortByChange = jest.fn();
    render(<FilterPanel {...buildProps({ onSortByChange })} />);

    await user.click(screen.getByRole('radio', { name: 'По рейтингу' }));

    expect(onSortByChange).toHaveBeenCalledWith('rating');
  });
});
