import { FilterPanel } from './ui/FilterPanel.tsx';
import { type FC, useReducer } from 'react';
import type { SearchMode } from './types.ts';
import { collectSkillIds, countActiveFilters, mapCityIdsToCityNames } from './utils.ts';
import { useFiltersBaseData } from './model/useFiltersBaseData';
import { filterReducer, filtersInitialState } from './model/filterReducer';

export const Filter: FC = () => {
  const [filters, dispatchFilters] = useReducer(filterReducer, filtersInitialState);
  const { cities: cityOptions, skillGroups: skillCategories } = useFiltersBaseData();

  const handleModeChange = (mode: SearchMode) => {
    dispatchFilters({ type: 'setMode', mode });
  };

  const handleGenderChange = (gender: string) => {
    dispatchFilters({ type: 'setGender', gender });
  };

  const handleCitySelect = (cityIds: number[]) => {
    const cities = mapCityIdsToCityNames(cityOptions, cityIds);
    dispatchFilters({ type: 'setCities', cities });
  };

  const handleSkillSelect = (categoryId: number, skillIds: number[]) => {
    const nextSkillIds = collectSkillIds(
      skillCategories,
      filters.skillIds,
      categoryId,
      skillIds,
    );
    dispatchFilters({ type: 'setSkillIds', skillIds: nextSkillIds });
  };

  const handleReset = () => {
    dispatchFilters({ type: 'reset' });
  };

  return (
    <FilterPanel
      filters={filters}
      cities={cityOptions}
      skillGroups={skillCategories}
      filtersCount={countActiveFilters(filters)}
      onModeChange={handleModeChange}
      onGenderChange={handleGenderChange}
      onCitySelect={handleCitySelect}
      onSkillSelect={handleSkillSelect}
      onFilterReset={handleReset}
    />
  );
};
