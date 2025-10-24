import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import IcEye from '../../assets/icons/inputs/eye.svg?react';
import IcSearch from '../../assets/icons/actions/search.svg?react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  args: {
    name: 'field_name',
    title: 'Имя пользователя',
    placeholder: 'Введите значение',
  },
  argTypes: {
    error: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

type InputStoryComponentProps = Omit<Parameters<typeof Input>[0], 'value' | 'onChange'> & {
  initialValue?: string;
};

const InputWithState = ({ initialValue, ...props }: InputStoryComponentProps) => {
  const [state, setState] = useState<string>(initialValue ?? '');

  return (
    <form style={{ width: '489px', padding: '19px' }}>
      <Input
        {...props}
        value={state}
        onChange={(event) => setState(event.target.value)}
      />
    </form>
  );
};

export const Default: Story = {
  render: (args) => <InputWithState {...args} />,
};

export const Error: Story = {
  args: {
    error: 'Пароль должен содержать не менее 8 символов',
    hint: 'Подсказка: используйте буквы и цифры',
  },
  render: (args) => <InputWithState {...args} />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    hint: 'Поле недоступно для редактирования',
  },
  render: (args) => <InputWithState {...args} />,
};

export const WithIcons: Story = {
  args: {
    rightIcon: IcEye,
    leftIcon: IcSearch,
  },
  render: (args) => <InputWithState {...args} />,
};

const SearchTemplate: Story['render'] = (args) => (
  <div style={{ width: '529px' }}>
    <InputWithState {...args} />
  </div>
);

export const SearchInput: Story = {
  args: {
    placeholder: 'Искать навык',
    leftIcon: IcSearch,
    title: undefined,
  },
  render: SearchTemplate,
};

