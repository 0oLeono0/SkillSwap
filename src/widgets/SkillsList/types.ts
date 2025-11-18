import type { Skill } from '@/entities/Skill/types';

export interface SkillsListModerationProps {
  enabled: boolean;
  deletingAuthorIds?: string[];
  onDelete: (authorId: string) => void;
}

export interface SkillsListProps {
  skills: Skill[];
  onToggleFavorite: (id: string) => void;
  onDetailsClick?: (id: string) => void;
  moderation?: SkillsListModerationProps;
}

export interface GroupedSkills {
  authorId: string;
  avatar: string;
  name: string;
  city: string;
  age: number;
  about?: string;
  canTeach: Skill[];
  wantsToLearn: Skill[];
  isFavorite?: boolean;
}
