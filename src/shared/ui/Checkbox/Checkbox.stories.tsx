import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['empty', 'done', 'remove'],
    },
    checked: {
      control: { type: 'boolean' },
    },
  },
  args: {
    variant: 'empty',
    checked: false,
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

const createInteractiveStory =
  (variant: 'empty' | 'done' | 'remove'): Story['render'] =>
  (args) => {
    const [checked, setChecked] = useState(args.checked);

    return (
      <Checkbox
        {...args}
        variant={variant}
        checked={checked}
        onChange={setChecked}
      />
    );
  };

export const Empty: Story = {
  render: createInteractiveStory('empty'),
};

export const Done: Story = {
  args: { checked: true },
  render: createInteractiveStory('done'),
};

export const Remove: Story = {
  args: { checked: true },
  render: createInteractiveStory('remove'),
};
