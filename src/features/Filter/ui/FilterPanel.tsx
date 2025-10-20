import { type FC, useState } from 'react';
import styles from './FilterPanel.module.css';
import { Radio, RadioGroup } from '@/shared/ui/Radio';
import { Title } from '@/shared/ui/Title';
import type { FilterPanelProps, SearchMode } from '../types.ts';
import CrossIcon from '@/shared/assets/icons/actions/cross.svg?react';
import { MultiSelectCheckboxList } from '@/shared/ui/MultiSelectCheckboxList/MultiSelectCheckboxList';
import type { Gender } from '@/api/types.ts';
import { mapCityNamesToCityIds, selectedSkillsByGroup } from '../utils.ts';
import { GroupedMultiSelect } from '@/shared/ui/GroupedMultiSelect/GroupedMultiSelect';
import { ToggleMore } from '@/features/Filter/ui/ToggleMore/ToggleMore.tsx';

export const FilterPanel: FC<FilterPanelProps> = (props: FilterPanelProps) => {
  const {
    filters,
    cities,
    skillGroups,
    filtersCount,
    onGenderChange,
    onModeChange,
    onCitySelect,
    onSkillSelect,
    onFilterReset
  } = props;

  const [showAllCities, setShowAllCities] = useState(false);
  const visibleCities = showAllCities ? cities : cities.slice(0, 5);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const visibleCategories = showAllCategories ? skillGroups : skillGroups.slice(0, 5);

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.title}>
          <Title tag={'h2'} variant={'lg'}>
            Фильтры
            {filtersCount > 0 && <span> ({filtersCount})</span>}
          </Title>
          {filtersCount > 0 &&
            <span className={styles.reset} onClick={onFilterReset}>Сбросить <CrossIcon /></span>
          }
        </div>
        <RadioGroup
          name={'mode'}
          value={filters.mode}
          onChange={(_, value) => onModeChange(value as SearchMode)}
        >
          <Radio title={'Всё'} value={'all'}></Radio>
          <Radio title={'Хочу научиться'} value={'wantToLearn'}></Radio>
          <Radio title={'Могу научить'} value={'canTeach'}></Radio>
        </RadioGroup>
        <div className={styles.filter}>
          <Title tag={'h3'} variant={'md'}>Навыки</Title>
          <div>
            {visibleCategories.map(group => (
              <GroupedMultiSelect
                key={group.id}
                parentOption={{
                  id: group.id,
                  name: group.name
                }}
                selectedIds={selectedSkillsByGroup(group, filters.skillIds)}
                options={group.skills}
                onChange={(values: number[]) => onSkillSelect(group.id, values)}
              />
            ))}
            {skillGroups.length > 5 && (
              <ToggleMore
                isOpen={showAllCategories}
                onToggle={() => setShowAllCategories(!showAllCategories)}
                labelClosed="Все категории"
              />
            )}
          </div>
        </div>
        <div className={styles.filter}>
          <Title tag={'h3'} variant={'md'}>Пол автора</Title>
          <RadioGroup
            name={'gender'}
            value={filters.gender}
            onChange={(_, value) => onGenderChange(value as Gender)}
          >
            <Radio title={'Не имеет значения'} value={''}></Radio>
            <Radio title={'Мужской'} value={'Мужской'}></Radio>
            <Radio title={'Женский'} value={'Женский'}></Radio>
          </RadioGroup>
        </div>
        <div className={styles.filter}>
          <Title tag={'h3'} variant={'md'}>Город</Title>
          <div>
            <MultiSelectCheckboxList
              options={visibleCities}
              selectedIds={mapCityNamesToCityIds(cities, filters.cities)}
              onChange={(values: number[]) => onCitySelect(values)}
            />
            {cities.length > 5 && (
              <ToggleMore
                isOpen={showAllCities}
                onToggle={() => setShowAllCities(!showAllCities)}
                labelClosed="Все города"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};