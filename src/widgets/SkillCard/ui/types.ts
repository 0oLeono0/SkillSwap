import type { SkillCategory } from '@/shared/lib/constants.ts';
import type { UserStatus } from '@/shared/types/userStatus';

interface AuthorProps {
  id?: string;
  status?: UserStatus;
  avatar: string;
  name: string;
  city: string;
  age: number;
  about?: string;
}

export interface SkillProps {
  id: string;
  name: string;
  category: SkillCategory;
}

export interface SkillCardProps {
  author: AuthorProps;
  isLikeButtonVisible: boolean;
  isDetailsButtonVisible: boolean;
  skill: SkillProps;
  skillsToLearn: SkillProps[];
  onDetailsButtonClick: (skillId: string) => void;
  onLikeButtonClick: (skillId: string) => void;
  isExchangeOffered: boolean;
  isFavorite?: boolean;
}
