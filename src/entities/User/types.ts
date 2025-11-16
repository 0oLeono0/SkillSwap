export type Gender = 'Мужской' | 'Женский';

export interface User {
  id: string;
  name: string;
  avatarUrl?: string | null;
  cityId: number | null;
  birthDate?: string | null;
  gender?: Gender | null;
  bio?: string | null;
  teachableSkills: number[];
  learningSkills: number[];
}

export interface UserCard {
  id: string;
  name: string;
  age: number;
  city: string;
  avatarUrl: string;
  bio?: string;
  teachSkills: string[];
  learnSkills: string[];
}
