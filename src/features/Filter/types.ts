import type { CatalogSortOption } from '@/shared/types/catalogSort';
import type { CatalogActivityOption } from '@/shared/types/catalogActivity';

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
  sortBy: CatalogSortOption;
  activityPeriod: CatalogActivityOption;
  gender: string | undefined;
  cities: string[];
  skillIds: number[];
}

type ModeChangeHandler = (mode: SearchMode) => void;
type SortByChangeHandler = (sortBy: CatalogSortOption) => void;
type ActivityPeriodChangeHandler = (
  activityPeriod: CatalogActivityOption
) => void;
type GenderChangeHandler = (gender: string) => void;
type CitySelectHandler = (cityIds: number[]) => void;
type SkillSelectHandler = (categoryId: number, skillIds: number[]) => void;

export interface FilterPanelProps {
  filters: Filters;
  cities: CityOption[];
  skillGroups: SkillCategories[];
  filtersCount: number;
  onModeChange: ModeChangeHandler;
  onSortByChange: SortByChangeHandler;
  onActivityPeriodChange: ActivityPeriodChangeHandler;
  onGenderChange: GenderChangeHandler;
  onCitySelect: CitySelectHandler;
  onSkillSelect: SkillSelectHandler;
  onFilterReset: () => void;
}
