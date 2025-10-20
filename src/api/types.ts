interface ApiSubskill {
  id: number;
  name: string;
}

export interface ApiSkillCategory {
  id: number;
  name: string;
  subskills: ApiSubskill[];
}

export interface ApiCity {
  id: number;
  name: string;
}

export type Gender = 'Мужской' | 'Женский';

export interface ApiUser {
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

export interface ApiMockData {
  users: ApiUser[];
  skills: ApiSkillCategory[];
  cities: ApiCity[];
}
