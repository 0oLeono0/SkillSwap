import { render, screen } from '@testing-library/react';
import { SkillsList } from './SkillsList';
import type { SkillCardProps } from '../SkillCard/ui/types';
import type { SkillsListAuthor } from './types';

jest.mock('../SkillCard/ui/SkillCard', () => ({
  SkillCard: (props: SkillCardProps) => (
    <div>{`card-status-${props.author.status ?? 'missing'}`}</div>
  )
}));

const buildAuthor = (
  overrides: Partial<SkillsListAuthor> = {}
): SkillsListAuthor => ({
  id: 'author-1',
  name: 'Author',
  status: 'inactive',
  city: 'City',
  age: 30,
  canTeach: [
    {
      id: 'skill-1',
      title: 'React',
      category: 'Education'
    }
  ],
  wantsToLearn: [],
  ...overrides
});

describe('SkillsList', () => {
  it('passes author status to skill card', () => {
    render(
      <SkillsList
        authors={[buildAuthor()]}
        onToggleFavorite={jest.fn()}
        onDetailsClick={jest.fn()}
      />
    );

    expect(screen.getByText('card-status-inactive')).toBeInTheDocument();
  });
});
