import type { Gender } from '../User/types';

export interface FiltersState {
  mode: 'all' | 'want_to_learn' | 'can_teach';
  gender: Gender | 'any';
  cityIds: number[];
  skillIds: number[];
}
