import type { Meta, StoryObj } from '@storybook/react-vite';
import { GroupedMultiSelect } from './GroupedMultiSelect.tsx';
import { db } from '@/api/mockData.ts';
import { useState } from 'react';

const meta: Meta<typeof GroupedMultiSelect> = {
  title: 'UI/GroupedMultiSelect',
  component: GroupedMultiSelect,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

const getSkillsGroups = () => {
  return db.skills.map(skill => ({
    parentOption: {
      id: skill.id,
      name: skill.name
    },
    options: skill.subskills?.map(sub => ({
      id: sub.id,
      name: sub.name
    })) ?? []
  }));
};


export const SkillsGroupMultiSelect: StoryObj<typeof GroupedMultiSelect> = {
  render: () => {
    const groups = getSkillsGroups();

    const [selectedGroups, setSelectedGroups] = useState(
      groups.reduce((acc, group) => {
        acc[group.parentOption.id] = [] as number[];
        return acc;
      }, {} as Record<number, number[]>)
    );

    const handleChange = (groupId: number, ids: number[]) => {
      setSelectedGroups(prev => ({
        ...prev,
        [groupId]: ids
      }));
    };

    return (
      <div style={{
        display: 'flex',
        flexFlow: 'column',
        width: '284px',
        padding: '20px',
        gap: '12px',
        backgroundColor: '#F9FAF7'
      }}>
        {groups.map(group => (
          <GroupedMultiSelect
            key={group.parentOption.id}
            parentOption={group.parentOption}
            options={group.options}
            selectedIds={selectedGroups[group.parentOption.id]}
            onChange={ids => handleChange(group.parentOption.id, ids)}
          />
        ))}
      </div>
    );
  }
};
