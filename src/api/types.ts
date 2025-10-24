interface ApiSubskill {
  id: number;
  name: string;
}

export interface SkillCategory {
  id: number;
  name: string;
  subskills: ApiSubskill[];
}

export type ApiSkillCategory = SkillCategory;

export interface City {
  id: number;
  name: string;
}

export type ApiCity = City;

export type ApiGender = 'Женский' | 'Мужской';
export type Gender = ApiGender;

export interface User {
  id: number;
  email: string;
  password: string;
  avatarUrl: string;
  name: string;
  city: string;
  birthDate: string;
  gender: ApiGender;
  bio: string;
  teachableSkills: number[];
  learningSkills: number[];
}

export type ApiUser = User;

export interface ApiMockData {
  users: ApiUser[];
  skills: ApiSkillCategory[];
  cities: ApiCity[];
}
