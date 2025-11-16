import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import avatar from '@/shared/assets/images/avatars/avatar.jpg';
import { SkillCard } from './SkillCard';
import type { SkillCardProps } from './types';
import { SkillCategories } from '@/shared/lib/constants';

type SkillCardStoryProps = SkillCardProps & {
  containerWidth?: number;
  authorAbout?: string;
};

const meta: Meta<SkillCardStoryProps> = {
  title: 'Widget/SkillCard',
  component: SkillCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    containerWidth: {
      control: { type: 'range', min: 364, max: 600, step: 10 },
      description: 'Ширина контейнера, имитирующая размещение в сетке',
    },
  },
};

export default meta;

export const InteractiveSkillCard: StoryObj<SkillCardStoryProps> = {
  args: {
    authorAbout:
      'Привет! Люблю ритм, кофе по утрам и людей, которые не боятся пробовать новое.',
    author: {
      avatar,
      name: 'Иван',
      city: 'Санкт-Петербург',
      age: 34,
    },
    isLikeButtonVisible: true,
    isDetailsButtonVisible: true,
    isExchangeOffered: false,
    skill: {
      id: '11',
      name: 'Игра на барабанах',
      category: SkillCategories.ART,
    },
    skillsToLearn: [
      {
        id: '64',
        name: 'Английский язык',
        category: SkillCategories.LANGUAGES,
      },
      {
        id: '36',
        name: 'Тайм-менеджмент',
        category: SkillCategories.BUSINESS,
      },
      {
        id: '24',
        name: 'Медитация',
        category: SkillCategories.HEALTH,
      },
      {
        id: '65',
        name: 'Публичные выступления',
        category: SkillCategories.EDUCATION,
      },
    ],
  },
  argTypes: {
    skillsToLearn: { control: false },
    skill: { control: false },
    author: { control: false },
    authorAbout: { control: 'text', name: 'Описание автора' },
  },
  render: ({ authorAbout, containerWidth = 364, ...cardProps }) => {
    const handleDetailsButton = (skillId: string) => {
      alert(`Подробнее о навыке c id=${skillId}`);
    };

    const handleLikeButton = (skillId: string) => {
      alert(`Добавлено в избранное, skillId=${skillId}`);
    };

    return (
      <div
        style={{
          padding: '20px',
          backgroundColor: 'var(--bg-color-primary)',
          width: `${containerWidth}px`,
        }}
      >
        <MemoryRouter>
          <SkillCard
            {...cardProps}
            author={{ ...cardProps.author, about: authorAbout }}
            onDetailsButtonClick={handleDetailsButton}
            onLikeButtonClick={handleLikeButton}
          />
        </MemoryRouter>
      </div>
    );
  },
};
