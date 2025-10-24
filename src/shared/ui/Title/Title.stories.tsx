import type { Meta, StoryObj } from '@storybook/react-vite';
import { Title } from './Title';

const meta: Meta<typeof Title> = {
  title: 'UI/Title',
  component: Title,
  args: {
    tag: 'h1',
    variant: 'xl',
    children: 'The quick brown fox jumps over the lazy dog.',
  },
};

export default meta;

export const Default: StoryObj<typeof Title> = {};

export const Variants: StoryObj<typeof Title> = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Title {...args} variant="xl">
        Заголовок XL
      </Title>
      <Title {...args} variant="lg">
        Заголовок LG
      </Title>
      <Title {...args} variant="md">
        Заголовок MD
      </Title>
      <Title {...args} variant="sm">
        Заголовок SM
      </Title>
    </div>
  ),
};

export const CustomTag: StoryObj<typeof Title> = {
  argTypes: {
    tag: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4'],
      description: 'HTML-тег заголовка',
    },
    variant: {
      control: 'select',
      options: ['xl', 'lg', 'md', 'sm'],
      description: 'Размер и стиль заголовка',
    },
    children: {
      control: 'text',
      description: 'Текст заголовка',
    },
    className: {
      control: 'text',
      description: 'Дополнительный CSS-класс',
    },
  },
  args: {
    tag: 'h2',
    variant: 'lg',
    children: 'Настраиваемый заголовок',
  },
};
