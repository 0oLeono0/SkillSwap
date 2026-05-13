import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReviewsSection } from './ReviewsSection';

const meta: Meta<typeof ReviewsSection> = {
  title: 'Pages/SkillDetails/ReviewsSection',
  component: ReviewsSection,
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
type Story = StoryObj<typeof ReviewsSection>;

export const Default: Story = {
  args: {
    isLoading: false,
    error: null,
    averageRating: 4.8,
    ratingsCount: 12,
    latestRatings: [
      {
        id: 'rating-1',
        exchangeId: 'exchange-1',
        score: 5,
        comment: 'Очень полезный обмен, быстро разобрали сложные вопросы.',
        rater: {
          id: 'user-1',
          name: 'Мария',
          avatarUrl: null
        },
        createdAt: '2026-04-30T10:00:00.000Z',
        updatedAt: '2026-04-30T10:00:00.000Z'
      },
      {
        id: 'rating-2',
        exchangeId: 'exchange-2',
        score: 4,
        comment: 'Хорошая практика и понятные объяснения.',
        rater: {
          id: 'user-2',
          name: 'Илья',
          avatarUrl: null
        },
        createdAt: '2026-04-29T10:00:00.000Z',
        updatedAt: '2026-04-29T10:00:00.000Z'
      }
    ]
  }
};

export const Empty: Story = {
  args: {
    isLoading: false,
    error: null,
    averageRating: null,
    ratingsCount: 0,
    latestRatings: []
  }
};
