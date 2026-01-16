export interface ApiMockUser {
  id: number;
  email: string;
  password: string;
  avatarUrl: string;
  name: string;
  city: string;
  birthDate: string;
  gender: string;
  bio: string;
  teachableSkills: number[];
  learningSkills: number[];
}

export interface ApiMockSubskill {
  id: number;
  name: string;
}

export interface ApiMockSkillGroup {
  id: number;
  name: string;
  subskills?: ApiMockSubskill[];
}

export interface ApiMockCity {
  id: number;
  name: string;
}

export interface ApiMockData {
  users: ApiMockUser[];
  skills: ApiMockSkillGroup[];
  cities: ApiMockCity[];
}
