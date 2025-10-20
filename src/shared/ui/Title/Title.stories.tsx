import type { Meta, StoryObj } from '@storybook/react';
import { Title } from './Title.tsx';

const meta: Meta<typeof Title> = {
  title: 'UI/Title',
  component: Title,
  args: {
    tag: 'h1',
    variant: 'xl',
    children: 'The quick brown fox jumps over the lazy dog.'
  }
};
export default meta;

export const Default: StoryObj<typeof Title> = {};

export const Variants: StoryObj<typeof Title> = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Title {...args} variant="xl">XL Title</Title>
      <Title {...args} variant="lg">LG Title</Title>
      <Title {...args} variant="md">MD Title</Title>
      <Title {...args} variant="sm">SM Title</Title>
    </div>
  ),
};

export const CustomTag: StoryObj<typeof Title> = {
  argTypes: {
    tag: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4'],
      description: 'HTML тег элемента'
    },
    variant: {
      control: 'select',
      options: ['xl', 'lg', 'md', 'sm'],
      description: 'Вариант начертания заголовка'
    },
    children: {
      control: 'text',
      description: 'Текст заголовка'
    },
    className: {
      control: 'text',
      description: 'Дополнительные CSS классы'
    }
  },
  args: {
    tag: 'h1',
    variant: 'xl',
    children: 'The quick brown fox jumps over the lazy dog.'
  }
};