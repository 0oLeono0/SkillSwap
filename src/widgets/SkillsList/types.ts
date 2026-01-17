export interface SkillsListModerationProps {
  enabled: boolean;
  deletingAuthorIds?: string[];
  onDelete: (authorId: string) => void;
}

export interface SkillsListSkill {
  id: string;
  title: string;
  category: string;
  description?: string;
  imageUrl?: string;
}

export interface SkillsListAuthor {
  id: string;
  name: string;
  city: string;
  age: number;
  about?: string;
  avatarUrl?: string;
  isFavorite?: boolean;
  canTeach: SkillsListSkill[];
  wantsToLearn: SkillsListSkill[];
}

export interface SkillsListProps {
  authors: SkillsListAuthor[];
  onToggleFavorite: (id: string) => void;
  onDetailsClick?: (id: string) => void;
  moderation?: SkillsListModerationProps;
}
