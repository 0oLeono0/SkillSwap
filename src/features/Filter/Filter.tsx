import { FilterPanel } from './ui/FilterPanel.tsx';
import { type FC, useEffect, useState } from 'react';
import type { CityOption, Filters, SearchMode, SkillCategories } from './types.ts';
import { collectSkillIds, countActiveFilters, getCities, getSkillsGroups, mapCityIdsToCityNames } from './utils.ts';

export const Filter: FC = () => {
  const initialFilters: Filters = {
    mode: 'all',
    gender: undefined,
    cities: [],
    skillIds: []
  };

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategories[]>([]);

  useEffect(() => {
    setCityOptions(getCities());
    setSkillCategories(getSkillsGroups());
  }, []);

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