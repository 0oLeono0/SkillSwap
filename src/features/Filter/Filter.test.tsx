import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Filter } from './Filter';

interface MockFilterPanelProps {
  filtersCount: number;
  onModeChange: (mode: 'canTeach') => void;
  onGenderChange: (gender: string) => void;
  onCitySelect: (ids: number[]) => void;
  onSkillSelect: (categoryId: number, skillIds: number[]) => void;
  onFilterReset: () => void;
}

jest.mock('./ui/FilterPanel.tsx', () => ({
  FilterPanel: (props: MockFilterPanelProps) => (
    <div>
      <div data-testid="filters-count">{props.filtersCount}</div>
      <button onClick={() => props.onModeChange('canTeach')}>mode</button>
      <button onClick={() => props.onGenderChange('female')}>gender</button>
      <button onClick={() => props.onCitySelect([2])}>city</button>
      <button onClick={() => props.onSkillSelect(1, [101, 102])}>skills</button>
      <button onClick={props.onFilterReset}>reset</button>
    </div>
  ),
}));

jest.mock('./model/useFiltersBaseData', () => ({
  useFiltersBaseData: () => ({
    cities: [
      { id: 1, name: 'Minsk' },
      { id: 2, name: 'Vilnius' },
    ],
    skillGroups: [
      {
        id: 1,
        name: 'Group',
        skills: [
          { id: 101, name: 'One' },
          { id: 102, name: 'Two' },
        ],
      },
    ],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

describe('Filter', () => {
  it('updates filters and counters through reducer actions', async () => {
    const user = userEvent.setup();
    render(<Filter />);

    const count = screen.getByTestId('filters-count');
    expect(count).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: 'mode' }));
    expect(count).toHaveTextContent('1');

    await user.click(screen.getByRole('button', { name: 'gender' }));
    expect(count).toHaveTextContent('2');

    await user.click(screen.getByRole('button', { name: 'city' }));
    expect(count).toHaveTextContent('3');

    await user.click(screen.getByRole('button', { name: 'skills' }));
    expect(count).toHaveTextContent('5');

    await user.click(screen.getByRole('button', { name: 'reset' }));
    expect(count).toHaveTextContent('0');
  });
});
