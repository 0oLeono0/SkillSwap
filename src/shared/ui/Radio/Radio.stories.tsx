import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RadioGroup, Radio } from './Radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/Radio',
  component: RadioGroup,
  subcomponents: { Radio },
  args: {
    name: 'sex',
    title: 'Пол автора',
    disabled: false
  }
};
export default meta;

const RadioWithState = (args: any) => {
  const [state, setState] = useState<string | undefined>(args.value);

  return (
    <form>
      <RadioGroup {...args} value={state} onChange={(_, val) => setState(val)}>
        <Radio title='Не имеет значения' value='' />
        <Radio title='Мужской' value='male' />
        <Radio title='Женский' value='female' />
      </RadioGroup>
    </form>
  );
};

export const Default: StoryObj<typeof RadioGroup> = {
  render: (args) => <RadioWithState {...args} />
};

export const WithValue: StoryObj<typeof RadioGroup> = {
  render: (args) => <RadioWithState {...args} />,
  args: {
    value: 'male'
  }
};

export const Disabled: StoryObj<typeof RadioGroup> = {
  render: (args) => <RadioWithState {...args} />,
  args: {
    disabled: true
  }
};
