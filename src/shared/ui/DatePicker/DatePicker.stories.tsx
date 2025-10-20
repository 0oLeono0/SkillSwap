import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
import { DatePicker } from './DatePicker';
import type { ComponentProps } from 'react';

const meta: Meta<typeof DatePicker> = {
  title: 'ui/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

type DatePickerStoryArgs = ComponentProps<typeof DatePicker>;

export const Default: StoryObj<DatePickerStoryArgs> = {
  args: {
    title: 'Выберите дату',
    value: '',
    placeholder: 'ДД.ММ.ГГГГ',
    className: ''
    // onChange: handleChangeFn
  },
  render: (args) => {
    const { value: initialValue, onChange: onChangeArg, ...rest } = args;
    const [state, setState] = useState<string>(initialValue ?? '');

    const handleChange = (date: string) => {
      setState(date);
    };

    return (
      <DatePicker
        {...(rest as Omit<DatePickerStoryArgs, 'value' | 'onChange'>)}
        value={state}
        onChange={handleChange}
      />
    );
  }
};

export const WithInitialValue: StoryObj<DatePickerStoryArgs> = {
  args: {
    title: 'Дата рождения',
    value: '05.10.1990',
    placeholder: 'ДД.ММ.ГГГГ',
    className: ''
    // onChange: handleChange
  },
  render: Default.render // переиспользуем render для одинакового поведения
};

export const CustomPlaceholder: StoryObj<DatePickerStoryArgs> = {
  args: {
    title: 'Дата события',
    value: '',
    placeholder: 'дд/мм/гггг',
    className: ''
    // onChange: handleChange
  },
  render: Default.render
};

export const WithCustomClass: StoryObj<DatePickerStoryArgs> = {
  args: {
    title: 'С кастомным классом',
    value: '',
    placeholder: 'ДД.ММ.ГГГГ',
    className: 'my-custom-class'
    // onChange: handleChange
  },
  render: Default.render
};
