export type Gender = 'Мужской' | 'Женский';

export interface User {
  id: number;
  name: string;
  avatarUrl: string;
  cityId: number;
  birthDate: string;
  gender: Gender;
  bio?: string;
  teachableSkills: number[];
  learningSkills: number[];
}

export interface UserCard {
  id: number;
  name: string;
  age: number;
  city: string;
  avatarUrl: string;
  bio?: string;
  teachSkills: string[];
  learnSkills: string[];
}
