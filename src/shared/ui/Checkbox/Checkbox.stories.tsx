import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['empty', 'done', 'remove']
    },
    checked: {
      control: { type: 'boolean' }
    }
  },
  args: {
    variant: 'empty',
    checked: false
  }
};

export default meta;

export const Empty: StoryObj<typeof Checkbox> = {
  args: {
    variant: 'empty',
    checked: false
  }
};

export const Done: StoryObj<typeof Checkbox> = {
  args: {
    variant: 'done',
    checked: true
  }
};

export const Remove: StoryObj<typeof Checkbox> = {
  args: {
    variant: 'remove',
    checked: true
  }
};
