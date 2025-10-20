import type { Meta, StoryObj } from '@storybook/react';
import { SkillCard } from './SkillCard.tsx';
import { MemoryRouter } from 'react-router-dom';
import avatar from '@/shared/assets/images/avatars/avatar.jpg';
import type { SkillCardProps } from '@/widgets/SkillCard/ui/types.ts';
import { SkillCategories } from '@/shared/lib/constants.ts';

type SkillCardStoryProps = SkillCardProps & {
  containerWidth?: number;
  authorAbout?: string;
};

const meta: Meta<SkillCardStoryProps> = {
  title: 'Widget/SkillCard',
  component: SkillCard,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    containerWidth: {
      control: { type: 'range', min: 364, max: 600, step: 10 },
      description: 'Ширина контейнера (layout) в пикселях'
    }
  }
};

export default meta;

export const InteractiveSkillCard: StoryObj<SkillCardStoryProps> = {
  args: {
    authorAbout: 'Привет! Люблю ритм, кофе по утрам и людей, которые не боятся пробовать новое',
    author: {
      avatar: avatar,
      name: 'Иван',
      city: 'Санкт-Петербург',
      age: 34,
      about: undefined
    },
    isLikeButtonVisible: true,
    isDetailsButtonVisible: true,
    isExchangeOffered: false,
    skill: {
      id: 11,
      name: 'Управление командой',
      category: SkillCategories.BUSINESS
    },
    skillsToLearn: [
      {
        id: 64,
        name: 'Осознанность',
        category: SkillCategories.HEALTH
      },
      {
        id: 36,
        name: 'Японский',
        category: SkillCategories.LANGUAGES
      },
      {
        id: 24,
        name: 'Музыка и звук',
        category: SkillCategories.ART
      },
      {
        id: 65,
        name: 'Физические тренировки',
        category: SkillCategories.HEALTH
      }
    ]
  },
  argTypes: {
    skillsToLearn: { control: false },
    skill: { control: false },
    author: { control: false },
    authorAbout: { control: 'text', name: 'Описание автора' }
  },
  render: ({ authorAbout, containerWidth = 364, ...cardProps }) => {
    const handleDetailsButton = (skillId: number) => {
      alert(`click on details button of skillId = ${skillId}`);
    };

    const handleLikeButton = (skillId: number) => {
      alert(`click on like button of skillId = ${skillId}`);
    };

    return (
      <div style={{
        padding: '20px',
        backgroundColor: 'var(--bg-color-primary)',
        width: `${containerWidth}px`
      }}>
        <MemoryRouter>
          <SkillCard {...cardProps}
                     author={{ ...cardProps.author, about: authorAbout }}
                     onDetailsButtonClick={handleDetailsButton}
                     onLikeButtonClick={handleLikeButton}
          />
        </MemoryRouter>
      </div>
    );
  }
};