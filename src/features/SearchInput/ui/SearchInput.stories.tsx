import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import SearchInput from './SearchInput';
import SearchIcon from '@/shared/assets/icons/actions/search.svg?react';
import CrossIcon from '@/shared/assets/icons/actions/cross.svg?react';

const meta: Meta<typeof SearchInput> = {
  title: 'Features/SearchInput',
  component: SearchInput,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div
          style={{
            backgroundColor: '#000',
            minHeight: '100vh',
            padding: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

export const SearchInputSkills: Story = {
  args: {
    paramKey: 'search',
    placeholder: 'Искать навык…',
    searchInput: true,
    debounceDelay: 300,
    leftIcon: SearchIcon,
    rightIcon: CrossIcon,
  },
};
