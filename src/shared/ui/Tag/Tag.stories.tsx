import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from './Tag';
import { CATEGORY_CLASS_MAP, type TagCategory, type TagProps } from './types';

const meta: Meta<typeof Tag> = {
  title: 'UI/Tag',
  component: Tag,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

const categoryOptions = Object.keys(CATEGORY_CLASS_MAP) as TagCategory[];

export const Categories: StoryObj<typeof Tag> = {
  render: () => (
    <div style={{ display: 'flex', gap: 20, flexDirection: 'column', padding: 16 }}>
      {categoryOptions.map((category) => (
        <Tag key={category} category={category}>
          {category}
        </Tag>
      ))}
      <Tag>+4</Tag>
    </div>
  ),
};

export const Variants: StoryObj<typeof Tag> = {
  argTypes: {
    category: {
      control: 'select',
      options: categoryOptions,
      description: 'Категория навыка',
    },
    children: {
      control: 'text',
      description: 'Текст внутри тега',
    },
    className: {
      control: 'text',
      description: 'Дополнительный CSS-класс',
    },
  },
  args: {
    category: categoryOptions[0],
    children: 'Играть на барабанах',
  },
  render: ({ children, className, category }: TagProps) => (
    <div style={{ display: 'flex', gap: 20, flexDirection: 'column', padding: 16 }}>
      <Tag className={className} category={category}>
        {children}
      </Tag>
    </div>
  ),
};
