import type { SkillCategory } from '@/shared/lib/constants.ts';

interface AuthorProps {
  avatar: string;
  name: string;
  city: string;
  age: number;
  about?: string;
}

export interface SkillProps {
  id: number;
  name: string;
  category: SkillCategory;
}

export interface SkillCardProps {
  author: AuthorProps;
  isLikeButtonVisible: boolean;
  isDetailsButtonVisible: boolean;
  skill: SkillProps;
  skillsToLearn: SkillProps[];
  onDetailsButtonClick: (skillId: number) => void;
  onLikeButtonClick: (skillId: number) => void;
  isExchangeOffered: boolean;
}