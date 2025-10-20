import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from './Tag';
import { CATEGORY_CLASS_MAP, type TagCategory, type TagProps } from './types';

const meta: Meta<typeof Tag> = {
  title: 'UI/Tags',
  component: Tag,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

export const Categories: StoryObj<typeof Tag> = {
  render: () => (
    <div style={{ display: 'flex', gap: 20, flexDirection: 'column', padding: 16 }}>
      {Object.keys(CATEGORY_CLASS_MAP).map((cat) => (
        <Tag key={cat} category={cat as TagCategory}>{cat}</Tag>
      ))}
      <Tag>+4</Tag>
    </div>
  )
};

export const Variants: StoryObj<typeof Tag> = {
  argTypes: {
    category: {
      control: 'select',
      options: Object.keys(CATEGORY_CLASS_MAP),
      description: 'Категория тега'
    },
    children: {
      control: 'text',
      description: 'Содержимое тега'
    },
    className: {
      control: 'text',
      description: 'Дополнительные CSS-классы'
    }
  },
  args: {
    category: 'Здоровье и лайфстайл',
    children: 'Пример тега'
  },
  render: ({ children, className, category }: TagProps) => (
    <div style={{ display: 'flex', gap: 20, flexDirection: 'column', padding: 16 }}>
      <Tag className={className} category={category}>{children}</Tag>
    </div>
  )
};