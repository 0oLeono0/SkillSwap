import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from './FilterPanel';
import type { FilterPanelProps } from '../types';

const buildProps = (
  overrides: Partial<FilterPanelProps> = {}
): FilterPanelProps => ({
  filters: {
    mode: 'all',
    activityPeriod: 'default',
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
  onActivityPeriodChange: jest.fn(),
  onGenderChange: jest.fn(),
  onCitySelect: jest.fn(),
  onSkillSelect: jest.fn(),
  onFilterReset: jest.fn(),
  ...overrides
});

describe('FilterPanel', () => {
  it('calls onActivityPeriodChange when activity period changes', async () => {
    const user = userEvent.setup();
    const onActivityPeriodChange = jest.fn();
    render(<FilterPanel {...buildProps({ onActivityPeriodChange })} />);

    await user.click(screen.getByRole('radio', { name: 'За месяц' }));

    expect(onActivityPeriodChange).toHaveBeenCalledWith('month');
  });

  it('calls onSortByChange when catalog sorting changes', async () => {
    const user = userEvent.setup();
    const onSortByChange = jest.fn();
    render(<FilterPanel {...buildProps({ onSortByChange })} />);

    await user.click(screen.getByRole('radio', { name: 'По рейтингу' }));

    expect(onSortByChange).toHaveBeenCalledWith('rating');
  });
});
