import type { Meta, StoryObj } from '@storybook/react';
import SearchInput from './SearchInput';
import IcSearch from '@/shared/assets/icons/actions/search.svg?react';
import CrossSearch from '@/shared/assets/icons/actions/cross.svg?react';
import { MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof SearchInput> = {
  title: 'Features/SearchInput',
  component: SearchInput,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div
          style={{
            backgroundColor: '#000000',
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
    placeholder: 'Поиск навыка...',
    searchInput: true,
    debounceDelay: 300,
    leftIcon: IcSearch,
    rightIcon: CrossSearch,
  },
};
