import type { ReactNode } from 'react';
import { SkillCategories, type SkillCategory } from '@/shared/lib/constants.ts';

export const CATEGORY_CLASS_MAP = {
  [SkillCategories.HEALTH]: 'health',
  [SkillCategories.HOME]: 'home',
  [SkillCategories.EDUCATION]: 'education',
  [SkillCategories.LANGUAGES]: 'languages',
  [SkillCategories.ART]: 'art',
  [SkillCategories.BUSINESS]: 'business'
} as const;

export interface TagProps {
  children: ReactNode;
  category?: SkillCategory;
  className?: string;
}