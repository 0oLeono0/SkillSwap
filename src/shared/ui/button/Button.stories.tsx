import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import CrossIcon from '../../assets/icons/actions/cross.svg?react';
import SortIcon from '../../assets/icons/navigation/sort.svg?react';
import { Button } from './Button';

type ButtonStoryArgs = ComponentProps<typeof Button> & {
  showLeftIcon: boolean;
  showRightIcon: boolean;
};

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    leftIcon: { control: { type: null } },
    rightIcon: { control: { type: null } },
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary', 'tertiary', 'empty'],
    },
  },
};

export default meta;

export const ButtonVariants: StoryObj<ButtonStoryArgs> = {
  args: {
    children: 'Нажми меня',
    variant: 'primary',
    disabled: false,
    showLeftIcon: false,
    showRightIcon: false,
  },
  render: ({ showLeftIcon, showRightIcon, ...rest }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '324px',
        padding: '20px',
        backgroundColor: '#F9FAF7',
      }}
    >
      <Button
        {...rest}
        leftIcon={{ icon: <SortIcon />, show: showLeftIcon }}
        rightIcon={{ icon: <CrossIcon />, show: showRightIcon }}
      />
    </div>
  ),
};
