import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MultiSelectCheckboxList } from './MultiSelectCheckboxList';
import { db } from '../../../api/mockData';
import type { SelectOption } from './types';

const meta: Meta<typeof MultiSelectCheckboxList> = {
  title: 'UI/MultiSelectCheckboxList',
  component: MultiSelectCheckboxList,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

const allSubskills: SelectOption[] = db.skills.flatMap((category) =>
  category.subskills.map((subskill) => ({ id: subskill.id, name: subskill.name })),
);

export const ListWithEmptyCheckboxes: StoryObj<typeof MultiSelectCheckboxList> = {
  render: () => (
    <MultiSelectCheckboxList options={allSubskills} selectedIds={[]} onChange={() => {}} />
  ),
};

const InteractiveWrapper = ({
  options,
  initialSelected = [],
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
        backgroundColor: '#F9FAF7',
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

export const ListWithSelectedCheckboxes: StoryObj<typeof MultiSelectCheckboxList> = {
  render: () => (
    <InteractiveWrapper options={allSubskills} initialSelected={[31, 37, 16]} />
  ),
};

