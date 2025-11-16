import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Skill } from '@/entities/Skill/types';
import { SkillsList } from '@/widgets/SkillsList';
import { SkillCategories } from '@/shared/lib/constants';

const meta: Meta<typeof SkillsList> = {
  title: 'Widget/SkillsList',
  component: SkillsList,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SkillsList>;

const mockSkills: Skill[] = [
  {
    id: '11',
    title: 'Игра на барабанах',
    description: '',
    type: 'teach',
    category: SkillCategories.ART,
    tags: ['music'],
    authorId: '1',
    isFavorite: false,
  },
  {
    id: '64',
    title: 'Английский язык',
    description: '',
    type: 'learn',
    category: SkillCategories.LANGUAGES,
    tags: ['language'],
    authorId: '1',
    isFavorite: true,
  },
  {
    id: '36',
    title: 'Маркетинг',
    description: '',
    type: 'learn',
    category: SkillCategories.BUSINESS,
    tags: ['business'],
    authorId: '2',
    isFavorite: false,
  },
  {
    id: '24',
    title: 'Рисование акварелью',
    description: '',
    type: 'teach',
    category: SkillCategories.ART,
    tags: ['art'],
    authorId: '2',
    isFavorite: false,
  },
];

export const Default: Story = {
  args: {
    skills: mockSkills,
    onToggleFavorite: (authorId: string) => {
      alert(`Избранное: authorId=${authorId}`);
    },
    onDetailsClick: (authorId: string) => {
      alert(`Подробнее: authorId=${authorId}`);
    },
  },
};

export const Empty: Story = {
  args: {
    skills: [],
    onToggleFavorite: (authorId: string) => {
      alert(`Избранное: authorId=${authorId}`);
    },
    onDetailsClick: (authorId: string) => {
      alert(`Подробнее: authorId=${authorId}`);
    },
  },
};
