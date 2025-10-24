import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'UI/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type DatePickerStoryArgs = ComponentProps<typeof DatePicker>;

const DatePickerStory: StoryObj<DatePickerStoryArgs>['render'] = (args) => {
  const { value: initialValue, onChange: _onChange, ...rest } = args;
  const [state, setState] = useState<string>(initialValue ?? '');

  return (
    <DatePicker
      {...(rest as Omit<DatePickerStoryArgs, 'value' | 'onChange'>)}
      value={state}
      onChange={(date) => setState(date)}
    />
  );
};

export const Default: StoryObj<DatePickerStoryArgs> = {
  args: {
    title: 'Дата рождения',
    value: '',
    placeholder: 'ДД.ММ.ГГГГ',
    className: '',
  },
  render: DatePickerStory,
};

export const WithInitialValue: StoryObj<DatePickerStoryArgs> = {
  args: {
    title: 'Дата рождения',
    value: '05.10.1990',
    placeholder: 'ДД.ММ.ГГГГ',
    className: '',
  },
  render: DatePickerStory,
};

export const CustomPlaceholder: StoryObj<DatePickerStoryArgs> = {
  args: {
    title: 'Дата встречи',
    value: '',
    placeholder: 'ГГ-ММ-ДД',
    className: '',
  },
  render: DatePickerStory,
};

export const WithCustomClass: StoryObj<DatePickerStoryArgs> = {
  args: {
    title: 'Подписка активна до',
    value: '',
    placeholder: 'ДД.ММ.ГГГГ',
    className: 'storybook-custom-date-picker',
  },
  render: DatePickerStory,
};

