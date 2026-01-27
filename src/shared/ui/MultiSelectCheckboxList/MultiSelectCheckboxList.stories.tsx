import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MultiSelectCheckboxList } from './MultiSelectCheckboxList';
import type { SelectOption } from './types';

const meta: Meta<typeof MultiSelectCheckboxList> = {
  title: 'UI/MultiSelectCheckboxList',
  component: MultiSelectCheckboxList,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

const allSubskills: SelectOption[] = [
  { id: 31, name: 'Public speaking' },
  { id: 37, name: 'English exam prep' },
  { id: 16, name: 'Guitar basics' },
  { id: 24, name: 'Branding' },
  { id: 12, name: 'UI patterns' },
  { id: 23, name: 'Frontend basics' }
];

export const ListWithEmptyCheckboxes: StoryObj<typeof MultiSelectCheckboxList> =
  {
    render: () => (
      <MultiSelectCheckboxList
        options={allSubskills}
        selectedIds={[]}
        onChange={() => {}}
      />
    )
  };

const InteractiveWrapper = ({
  options,
  initialSelected = []
}: {
  options: SelectOption[];
  initialSelected?: number[];
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelected);

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column',
        width: '284px',
        padding: '20px',
        backgroundColor: '#F9FAF7'
      }}
    >
      <MultiSelectCheckboxList
        options={options}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
      />
    </div>
  );
};

export const ListWithSelectedCheckboxes: StoryObj<
  typeof MultiSelectCheckboxList
> = {
  render: () => (
    <InteractiveWrapper options={allSubskills} initialSelected={[31, 37, 16]} />
  )
};
