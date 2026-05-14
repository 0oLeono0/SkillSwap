import type { CatalogAuthorSkill } from '@/entities/CatalogAuthor';
import type { SkillDetailsAuthorInfo } from '@/pages/SkillDetails/model';
import type { UserStatus } from '@/shared/types/userStatus';

export type { SkillDetailsAuthorInfo } from '@/pages/SkillDetails/model';

export type SkillSelectionHandler = (skillId: CatalogAuthorSkill['id']) => void;

export type AuthorCardProps = {
  authorInfo: SkillDetailsAuthorInfo;
  authorBio: string;
  authorStatus: UserStatus;
  avatarFallback: string;
  teachSkills: CatalogAuthorSkill[];
  learnSkills: CatalogAuthorSkill[];
  selectedSkillId: string;
  isRatingsLoading: boolean;
  ratingsError: string | null;
  ratingsCount: number;
  averageRating: number | null;
  onSelectSkill: SkillSelectionHandler;
};
