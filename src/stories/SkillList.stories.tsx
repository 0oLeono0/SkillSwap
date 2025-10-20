import type { Meta, StoryObj } from '@storybook/react';
import type { Skill } from '@/entities/Skill/types';
import { SkillsList } from '@/widgets/SkillsList';
import { SkillCategories } from '@/shared/lib/constants';

const meta: Meta<typeof SkillsList> = {
  title: 'Widget/SkillsList',
  component: SkillsList,
  parameters: {
    layout: 'fullscreen'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof SkillsList>;

const mockSkills: Skill[] = [
  {
    id: '11',
    title: 'Управление командой',
    description: '',
    type: 'teach',
    category: SkillCategories.BUSINESS,
    tags: ['business'],
    authorId: 1,
    isFavorite: false
  },
  {
    id: '64',
    title: 'Осознанность',
    description: '',
    type: 'learn',
    category: SkillCategories.HEALTH,
    tags: ['health'],
    authorId: 1,
    isFavorite: true
  },
  {
    id: '36',
    title: 'Японский',
    description: '',
    type: 'learn',
    category: SkillCategories.LANGUAGES,
    tags: ['japanese'],
    authorId: 2,
    isFavorite: false
  },
  {
    id: '24',
    title: 'Музыка и звук',
    description: '',
    type: 'teach',
    category: SkillCategories.ART,
    tags: ['art'],
    authorId: 2,
    isFavorite: false
  }
];

export const Default: Story = {
  args: {
    skills: mockSkills,
    onToggleFavorite: (authorId: number) => {
      alert(`click on like button of authorId = ${authorId}`);
    },
    onDetailsClick: (authorId: number) => {
      alert(`click on details button of authorId = ${authorId}`);
    }
  }
};

export const Empty: Story = {
  args: {
    skills: [],
    onToggleFavorite: (authorId: number) => {
      alert(`click on like button of authorId = ${authorId}`);
    },
    onDetailsClick: (authorId: number) => {
      alert(`click on details button of authorId = ${authorId}`);
    }
  }
};
