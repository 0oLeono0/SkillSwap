export type SearchMode = 'all' | 'wantToLearn' | 'canTeach';

export interface CityOption {
  id: number;
  name: string;
}

export interface SkillOption {
  id: number;
  name: string;
}

export interface SkillCategories {
  id: number;
  name: string;
  skills: SkillOption[];
}

export interface Filters {
  mode: SearchMode;
  gender: string | undefined;
  cities: string[];
  skillIds: number[];
}

export interface FilterPanelProps {
  filters: Filters;
  cities: CityOption[];
  skillGroups: SkillCategories[];
  filtersCount: number;
  onModeChange: (value: SearchMode) => void;
  onGenderChange: (value: string) => void;
  onCitySelect: (values: number[]) => void;
  onSkillSelect: (categoryId: number, values: number[]) => void;
  onFilterReset: () => void;
}