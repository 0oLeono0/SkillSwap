import type { Meta, StoryObj } from '@storybook/react-vite';
import avatar from '@/shared/assets/images/avatars/avatar2.jpg';
import { SkillCategories } from '@/shared/lib/constants';
import { RelatedSkillsSection } from './RelatedSkillsSection';

const meta: Meta<typeof RelatedSkillsSection> = {
  title: 'Pages/SkillDetails/RelatedSkillsSection',
  component: RelatedSkillsSection,
  parameters: {
    layout: 'fullscreen'
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 32, background: 'var(--bg-color-primary)' }}>
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof RelatedSkillsSection>;

export const Default: Story = {
  args: {
    authors: [
      {
        id: 'author-2',
        name: 'Сергей',
        avatarUrl: avatar,
        city: 'Казань',
        age: 31,
        about: 'Хочу подтянуть React через практику.',
        isFavorite: false,
        canTeach: [
          {
            id: 'skill-design',
            title: 'Дизайн презентаций',
            description: 'Композиция, типографика и структура слайдов.',
            type: 'teach',
            category: SkillCategories.ART,
            categoryId: 2,
            userSkillId: 'user-skill-design',
            originalSkillId: 2,
            tags: []
          }
        ],
        wantsToLearn: [
          {
            id: 'skill-react',
            title: 'React',
            description: 'Компоненты и состояние.',
            type: 'learn',
            category: SkillCategories.EDUCATION,
            categoryId: 1,
            userSkillId: 'user-skill-react',
            originalSkillId: 1,
            tags: []
          }
        ]
      }
    ],
    onToggleFavorite: () => undefined,
    onDetailsClick: () => undefined
  }
};

export const Empty: Story = {
  args: {
    authors: [],
    onToggleFavorite: () => undefined,
    onDetailsClick: () => undefined
  }
};
