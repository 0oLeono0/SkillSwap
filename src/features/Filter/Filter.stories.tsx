import type { Meta, StoryObj } from '@storybook/react-vite';
import { Filter } from './Filter';

const meta: Meta<typeof Filter> = {
  title: 'Features/FilterPanel',
  component: Filter,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const FilterBar: StoryObj<typeof Filter> = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column',
        width: '324px',
        padding: '20px',
        backgroundColor: '#F9FAF7',
      }}
    >
      <Filter />
    </div>
  ),
};
