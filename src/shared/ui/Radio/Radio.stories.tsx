import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioGroup, Radio } from './Radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/Radio',
  component: RadioGroup,
  subcomponents: { Radio },
  args: {
    name: 'gender',
    title: 'Пол автора',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

type RadioGroupStoryProps = Parameters<typeof RadioGroup>[0];

const RadioWithState = (args: RadioGroupStoryProps) => {
  const [state, setState] = useState<string | undefined>(args.value);

  return (
    <form>
      <RadioGroup {...args} value={state} onChange={(_, val) => setState(val)}>
        <Radio title="Не имеет значения" value="" />
        <Radio title="Мужской" value="male" />
        <Radio title="Женский" value="female" />
      </RadioGroup>
    </form>
  );
};

export const Default: Story = {
  render: (args) => <RadioWithState {...args} />,
};

export const WithValue: Story = {
  args: {
    value: 'male',
  },
  render: (args) => <RadioWithState {...args} />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <RadioWithState {...args} />,
};
