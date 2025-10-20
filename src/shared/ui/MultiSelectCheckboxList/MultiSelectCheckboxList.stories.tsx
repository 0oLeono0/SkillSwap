import type { Meta, StoryObj } from '@storybook/react';
import { MultiSelectCheckboxList } from './MultiSelectCheckboxList';
import { useState } from 'react';
import { db } from '../../../api/mockData';

const meta: Meta<typeof MultiSelectCheckboxList> = {
  title: 'UI/MultiSelectCheckboxList',
  component: MultiSelectCheckboxList,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

const allSubskills = db.skills.flatMap(category => category.subskills);

export const ListWithEmptyCheckboxes: StoryObj = {
  render: () => (
    <MultiSelectCheckboxList
      options={allSubskills}
      selectedIds={[]} 
      onChange={() => {}}
    />
  ),
};

const InteractiveWrapper = ({ options, initialSelected = [] }: { options: any[], initialSelected?: number[] }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelected);
  
  return (
    <div style={{ display: 'flex', flexFlow: 'column', width: '284px', padding: '20px', backgroundColor: '#F9FAF7' }}>
      <div>
        <MultiSelectCheckboxList
          options={options}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
        />
      </div>
    </div>
  );
};

export const ListWithSelectedCheckboxes: StoryObj = {
  render: () => (
    <InteractiveWrapper 
      options={allSubskills}
      initialSelected={[31, 37, 16]} 
    />
  ),
};