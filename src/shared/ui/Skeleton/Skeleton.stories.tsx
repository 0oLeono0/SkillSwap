import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton.tsx';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
};

export default meta;

type SkeletonStory = StoryObj<typeof Skeleton>;

const isLoading = true;

export const Circle: SkeletonStory = {
  render: () => (
    <>
      {isLoading ? (
        <Skeleton width="240px" height="240px" borderRadius = '50%' />
      ) : (
        <div style={{ width: '240px', height: '240px', borderRadius: '50%' }} />
      )}
    </>
  ),
};

export const Rectangle: SkeletonStory = {
  render: () => (
    <>
      {isLoading ? (
        <Skeleton width="284px" height="48px" borderRadius = '12px' />
      ) : (
        <div style={{ width: '344px', height: '100px', borderRadius: '12px' }} />
      )}
    </>
  ),
};