import type { CatalogAuthorSkill } from '@/pages/Catalog/model/catalogData';
import type { SkillDetailsAuthorInfo } from '@/pages/SkillDetails/model/types';
import type { UserStatus } from '@/shared/types/userStatus';

export type { SkillDetailsAuthorInfo } from '@/pages/SkillDetails/model/types';

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
