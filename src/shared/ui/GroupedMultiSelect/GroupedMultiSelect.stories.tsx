import type { Meta, StoryObj } from '@storybook/react-vite';
import { GroupedMultiSelect } from './GroupedMultiSelect.tsx';
import { useState } from 'react';

const meta: Meta<typeof GroupedMultiSelect> = {
  title: 'UI/GroupedMultiSelect',
  component: GroupedMultiSelect,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

const skillGroups = [
  {
    parentOption: { id: 1, name: 'Design' },
    options: [
      { id: 11, name: 'Figma' },
      { id: 12, name: 'UI kits' },
      { id: 13, name: 'Prototyping' }
    ]
  },
  {
    parentOption: { id: 2, name: 'Programming' },
    options: [
      { id: 21, name: 'TypeScript' },
      { id: 22, name: 'React' },
      { id: 23, name: 'Node.js' }
    ]
  },
  {
    parentOption: { id: 3, name: 'Marketing' },
    options: [
      { id: 31, name: 'SMM' },
      { id: 32, name: 'SEO basics' },
      { id: 33, name: 'Content planning' }
    ]
  }
];

export const SkillsGroupMultiSelect: StoryObj<typeof GroupedMultiSelect> = {
  render: () => {
    const groups = skillGroups;

    const [selectedGroups, setSelectedGroups] = useState(
      groups.reduce(
        (acc, group) => {
          acc[group.parentOption.id] = [] as number[];
          return acc;
        },
        {} as Record<number, number[]>
      )
    );

    const handleChange = (groupId: number, ids: number[]) => {
      setSelectedGroups((prev) => ({
        ...prev,
        [groupId]: ids
      }));
    };

    return (
      <div
        style={{
          display: 'flex',
          flexFlow: 'column',
          width: '284px',
          padding: '20px',
          gap: '12px',
          backgroundColor: '#F9FAF7'
        }}
      >
        {groups.map((group) => (
          <GroupedMultiSelect
            key={group.parentOption.id}
            parentOption={group.parentOption}
            options={group.options}
            selectedIds={selectedGroups[group.parentOption.id]}
            onChange={(ids) => handleChange(group.parentOption.id, ids)}
          />
        ))}
      </div>
    );
  }
};
