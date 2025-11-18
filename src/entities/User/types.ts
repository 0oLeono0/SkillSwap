export type Gender = '�?�?��?��?��' | '�-��?�?����';

export interface UserSkill {
  id: string;
  title: string;
  categoryId: number | null;
  subcategoryId: number | null;
  description: string;
  imageUrls: string[];
}

import type { UserRole } from '@/shared/types/userRole';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  cityId: number | null;
  birthDate?: string | null;
  gender?: Gender | null;
  bio?: string | null;
  teachableSkills: UserSkill[];
  learningSkills: UserSkill[];
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
