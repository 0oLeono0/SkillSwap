import type { Meta, StoryObj } from '@storybook/react-vite';
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

const mockAuthors = [
  {
    id: '1',
    name: 'Анна',
    city: 'Минск',
    age: 28,
    about: 'Люблю музыку и языки.',
    isFavorite: true,
    canTeach: [
      {
        id: '11',
        title: 'Игра на барабанах',
        category: SkillCategories.ART
      }
    ],
    wantsToLearn: [
      {
        id: '64',
        title: 'Английский язык',
        category: SkillCategories.LANGUAGES
      }
    ]
  },
  {
    id: '2',
    name: 'Сергей',
    city: 'Вильнюс',
    age: 31,
    about: 'Работаю в маркетинге.',
    isFavorite: false,
    canTeach: [
      {
        id: '24',
        title: 'Рисование акварелью',
        category: SkillCategories.ART
      }
    ],
    wantsToLearn: [
      {
        id: '36',
        title: 'Маркетинг',
        category: SkillCategories.BUSINESS
      }
    ]
  }
];

export const Default: Story = {
  args: {
    authors: mockAuthors,
    onToggleFavorite: (authorId: string) => {
      alert(`Избранное: authorId=${authorId}`);
    },
    onDetailsClick: (authorId: string) => {
      alert(`Подробнее: authorId=${authorId}`);
    }
  }
};

export const Empty: Story = {
  args: {
    authors: [],
    onToggleFavorite: (authorId: string) => {
      alert(`Избранное: authorId=${authorId}`);
    },
    onDetailsClick: (authorId: string) => {
      alert(`Подробнее: authorId=${authorId}`);
    }
  }
};
