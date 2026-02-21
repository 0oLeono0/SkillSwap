export type ApiUserRole = 'user' | 'admin' | 'owner';

export interface ApiUserSkill {
  id?: string | undefined;
  title: string;
  categoryId: number | null;
  subcategoryId: number | null;
  description: string;
  imageUrls?: string[] | undefined;
}

export interface ApiAuthUser {
  id: string;
  email: string;
  name: string;
  role: ApiUserRole;
  avatarUrl?: string | null | undefined;
  cityId?: number | null | undefined;
  birthDate?: string | null | undefined;
  gender?: string | null | undefined;
  bio?: string | null | undefined;
  teachableSkills?: ApiUserSkill[] | undefined;
  learningSkills?: ApiUserSkill[] | undefined;
}

export interface AuthSuccessResponse {
  user: ApiAuthUser;
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
  avatarUrl?: string | null | undefined;
  cityId?: number | null | undefined;
  birthDate?: string | null | undefined;
  gender?: string | null | undefined;
  bio?: string | null | undefined;
  teachableSkills?: ApiUserSkill[] | undefined;
  learningSkills?: ApiUserSkill[] | undefined;
}

export interface UpdateProfilePayload {
  email?: string | undefined;
  name?: string | undefined;
  avatarUrl?: string | null | undefined;
  cityId?: number | null | undefined;
  birthDate?: string | null | undefined;
  gender?: string | null | undefined;
  bio?: string | null | undefined;
  teachableSkills?: ApiUserSkill[] | undefined;
  learningSkills?: ApiUserSkill[] | undefined;
}
