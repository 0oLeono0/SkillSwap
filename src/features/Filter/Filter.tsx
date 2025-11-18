import { FilterPanel } from './ui/FilterPanel.tsx';
import { type FC, useState } from 'react';
import type { Filters, SearchMode } from './types.ts';
import { collectSkillIds, countActiveFilters, mapCityIdsToCityNames } from './utils.ts';
import { useFiltersBaseData } from './model/useFiltersBaseData';

export const Filter: FC = () => {
  const initialFilters: Filters = {
    mode: 'all',
    gender: undefined,
    cities: [],
    skillIds: []
  };

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const { cities: cityOptions, skillGroups: skillCategories } = useFiltersBaseData();

  const handleModeChange = (mode: SearchMode) => {
    setFilters(prev => ({ ...prev, mode: mode }));
  };

  const handleGenderChange = (gender: string) => {
    setFilters(prev => ({ ...prev, gender: gender }));
  };

  const handleCitySelect = (cityIds: number[]) => {
    setFilters(prev => ({
      ...prev, cities: mapCityIdsToCityNames(cityOptions, cityIds)
    }));
  };

  const handleSkillSelect = (categoryId: number, skillIds: number[]) => {
    setFilters(prev => ({
      ...prev,
      skillIds: collectSkillIds(skillCategories, filters.skillIds, categoryId, skillIds)
    }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
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
