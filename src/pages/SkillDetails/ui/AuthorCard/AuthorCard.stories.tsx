import type { Meta, StoryObj } from '@storybook/react-vite';
import avatar from '@/shared/assets/images/avatars/avatar.jpg';
import { SkillCategories } from '@/shared/lib/constants';
import { AuthorCard } from './AuthorCard';

const meta: Meta<typeof AuthorCard> = {
  title: 'Pages/SkillDetails/AuthorCard',
  component: AuthorCard,
  parameters: {
    layout: 'centered'
  }
};

export default meta;
type Story = StoryObj<typeof AuthorCard>;

export const Default: Story = {
  args: {
    authorInfo: {
      name: 'Анна',
      avatarUrl: avatar,
      bio: 'Помогаю разобраться с основами фронтенда и практикой React.',
      city: 'Москва',
      age: 28,
      status: 'active'
    },
    authorBio: 'Помогаю разобраться с основами фронтенда и практикой React.',
    authorStatus: 'active',
    avatarFallback: avatar,
    selectedSkillId: 'skill-react',
    isRatingsLoading: false,
    ratingsError: null,
    ratingsCount: 12,
    averageRating: 4.8,
    teachSkills: [
      {
        id: 'skill-react',
        title: 'React',
        description: 'Компоненты, хуки и архитектура интерфейсов.',
        type: 'teach',
        category: SkillCategories.EDUCATION,
        categoryId: 1,
        userSkillId: 'user-skill-react',
        originalSkillId: 1,
        tags: []
      }
    ],
    learnSkills: [
      {
        id: 'skill-design',
        title: 'UX дизайн',
        description: 'Исследования и прототипирование.',
        type: 'learn',
        category: SkillCategories.ART,
        categoryId: 2,
        userSkillId: 'user-skill-design',
        originalSkillId: 2,
        tags: []
      }
    ],
    onSelectSkill: () => undefined
  }
};

export const LoadingRating: Story = {
  args: {
    ...Default.args,
    isRatingsLoading: true,
    ratingsCount: 0,
    averageRating: null
  }
};
