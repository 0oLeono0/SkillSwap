import type { Meta, StoryObj } from '@storybook/react';
import CrossIcon from '../../assets/icons/actions/cross.svg?react';
import SortIcon from '../../assets/icons/navigation/sort.svg?react';
import { Button } from './Button.tsx';
import type { ComponentProps } from 'react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type ButtonStoryArgs = Omit<ComponentProps<typeof Button>, never> & {
  showLeftIcon: boolean;
  showRightIcon: boolean;
};

export const ButtonVariants: StoryObj<ButtonStoryArgs> = {
  args: {
    children: 'Interactive Button Text',
    variant: 'primary',
    disabled: false,
    showLeftIcon: false,
    showRightIcon: false,
    onClick: () => alert('click')
  },
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary', 'tertiary']
    },
    disabled: { control: 'boolean' },
    leftIcon: { control: false },
    rightIcon: { control: false }
  },
  render: (args) => {
    const { showLeftIcon, showRightIcon, ...rest } = args;

    return (
      <div style={{ display: 'flex', flexFlow: 'column', width: '324px', padding: '20px', backgroundColor: '#F9FAF7' }}>
        <Button
          {...rest}
          rightIcon={{ icon: <CrossIcon />, show: showLeftIcon }}
          leftIcon={{ icon:  <SortIcon />, show: showRightIcon }}
        />
      </div>
    );
  }
};