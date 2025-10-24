import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Circle: Story = {
  render: () => <Skeleton width="240px" height="240px" borderRadius="50%" />,
};

export const Rectangle: Story = {
  render: () => <Skeleton width="284px" height="48px" borderRadius="12px" />,
};
