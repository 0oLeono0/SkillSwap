import type { Filters, SearchMode } from '../types';
import type { UserStatusFilter } from '@/shared/types/userStatus';

export const filtersInitialState: Filters = {
  mode: 'all',
  status: 'all',
  gender: undefined,
  cities: [],
  skillIds: []
};

type FilterAction =
  | { type: 'setMode'; mode: SearchMode }
  | { type: 'setStatus'; status: UserStatusFilter }
  | { type: 'setGender'; gender?: string }
  | { type: 'setCities'; cities: string[] }
  | { type: 'setSkillIds'; skillIds: number[] }
  | { type: 'replace'; filters: Filters }
  | { type: 'reset' };

export const filterReducer = (
  state: Filters,
  action: FilterAction
): Filters => {
  switch (action.type) {
    case 'setMode':
      return { ...state, mode: action.mode };
    case 'setStatus':
      return { ...state, status: action.status };
    case 'setGender':
      return { ...state, gender: action.gender };
    case 'setCities':
      return { ...state, cities: action.cities };
    case 'setSkillIds':
      return { ...state, skillIds: action.skillIds };
    case 'replace':
      return { ...action.filters };
    case 'reset':
      return { ...filtersInitialState };
    default:
      return state;
  }
};
