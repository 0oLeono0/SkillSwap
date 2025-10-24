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
    title: '���� ��������',
    value: '',
    placeholder: '��.��.����',
    className: '',
  },
  render: DatePickerStory,
};

export const WithInitialValue: StoryObj<DatePickerStoryArgs> = {
  args: {
    title: '���� ��������',
    value: '05.10.1990',
    placeholder: '��.��.����',
    className: '',
  },
  render: DatePickerStory,
};

export const CustomPlaceholder: StoryObj<DatePickerStoryArgs> = {
  args: {
    title: '���� �������',
    value: '',
    placeholder: '��-��-��',
    className: '',
  },
  render: DatePickerStory,
};

export const WithCustomClass: StoryObj<DatePickerStoryArgs> = {
  args: {
    title: '�������� ������� ��',
    value: '',
    placeholder: '��.��.����',
    className: 'storybook-custom-date-picker',
  },
  render: DatePickerStory,
};

