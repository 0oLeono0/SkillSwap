import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import IcEye from '../../assets/icons/inputs/eye.svg?react';
import IcSearch from '../../assets/icons/actions/search.svg?react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  args: {
    name: 'field_name',
    title: 'Имя',
    placeholder: 'Введите ваш пароль'
  },
  argTypes: {
    error: {
      control: { type: 'boolean' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
};
export default meta;

const InputWithState = (args: any) => {
  const [state, setState] = useState<string | undefined>(args.value);

  return (
    <form
      style={{
        width: '489px',
        padding: '19px'
      }}
    >
      <Input
        {...args}
        value={state}
        onChange={(evt) => setState(evt.target.value)}
      />
    </form>
  );
};

const InputWithSearch = (args: any) => {
  const [state, setState] = useState<string | undefined>(args.value);

  return (
    <form
      style={{
        width: '529px',
      }}
    >
      <Input
        {...args}
        value={state}
        onChange={(evt) => setState(evt.target.value)}
      />
    </form>
  );
};

export const Default: StoryObj<typeof Input> = {
  render: (args) => <InputWithState {...args} />
};

export const Error: StoryObj<typeof Input> = {
  render: (args) => <InputWithState {...args} />,
  args: {
    error: 'Пароль должен содержать не менее 8 знаков',
    hint: 'Это hint'
  }
};

export const Disabled: StoryObj<typeof Input> = {
  render: (args) => <InputWithState {...args} />,
  args: {
    disabled: true
  }
};

export const InputIcon: StoryObj<typeof Input> = {
  render: (args) => <InputWithState {...args} />,
  args: {
    rightIcon: IcEye,
    leftIcon: IcSearch
  }
};

export const SearchInput: StoryObj<typeof Input> = {
  render: (args) => <InputWithSearch {...args} />,
  args: {
    placeholder: 'Искать навык',
    leftIcon: IcSearch,
    title: undefined,
  }
};
