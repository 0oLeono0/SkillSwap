import type { Meta, StoryObj } from '@storybook/react-vite';
import stock1 from '@/shared/assets/images/stock/stock.jpg';
import stock2 from '@/shared/assets/images/stock/stock2.jpg';
import stock3 from '@/shared/assets/images/stock/stock3.jpg';
import { SkillCategories } from '@/shared/lib/constants';
import { SkillOverviewCard } from './SkillOverviewCard';

const meta: Meta<typeof SkillOverviewCard> = {
  title: 'Pages/SkillDetails/SkillOverviewCard',
  component: SkillOverviewCard,
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
type Story = StoryObj<typeof SkillOverviewCard>;

export const Default: Story = {
  args: {
    selectedSkill: {
      id: 'skill-react',
      title: 'React',
      description: 'Компоненты, хуки и архитектура интерфейсов.',
      type: 'teach',
      category: SkillCategories.EDUCATION,
      categoryId: 1,
      userSkillId: 'user-skill-react',
      originalSkillId: 1,
      tags: [],
      imageUrls: [stock1, stock2, stock3]
    },
    skillDescription:
      'Научу собирать интерфейсы на React и разбирать код без паники.',
    galleryImages: [stock1, stock2, stock3],
    isFavorite: false,
    favoriteButtonLabel: 'Добавить в избранное',
    isFavoriteDisabled: false,
    proposeButtonLabel: 'Предложить обмен',
    onFavoriteClick: () => undefined,
    onProposeExchange: () => undefined
  }
};

export const Favorite: Story = {
  args: {
    ...Default.args,
    isFavorite: true,
    favoriteButtonLabel: 'Убрать из избранного'
  }
};
