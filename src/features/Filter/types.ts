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

type ModeChangeHandler = (mode: SearchMode) => void;
type GenderChangeHandler = (gender: string) => void;
type CitySelectHandler = (cityIds: number[]) => void;
type SkillSelectHandler = (categoryId: number, skillIds: number[]) => void;

export interface FilterPanelProps {
  filters: Filters;
  cities: CityOption[];
  skillGroups: SkillCategories[];
  filtersCount: number;
  onModeChange: ModeChangeHandler;
  onGenderChange: GenderChangeHandler;
  onCitySelect: CitySelectHandler;
  onSkillSelect: SkillSelectHandler;
  onFilterReset: () => void;
}
