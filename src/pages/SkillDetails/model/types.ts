import type { CSSProperties, Dispatch, SetStateAction } from 'react';
import type {
  CatalogAuthor,
  CatalogAuthorSkill
} from '@/pages/Catalog/model/catalogData';
import type { MaterialDto } from '@/shared/api/materials';
import type { UserRatingDto } from '@/shared/api/users';
import type { UserStatus } from '@/shared/types/userStatus';

export type SkillDetailsAuthorInfo = {
  name: string;
  avatarUrl?: string;
  bio?: string;
  city: string;
  age: number;
  status: UserStatus;
};

export type UseSkillDetailsDataParams = {
  authorId: string;
};

export type UseSkillDetailsDataResult = {
  currentAuthor: CatalogAuthor | null;
  authorInfo: SkillDetailsAuthorInfo | null;
  teachSkills: CatalogAuthorSkill[];
  learnSkills: CatalogAuthorSkill[];
  selectedSkill: CatalogAuthorSkill | null;
  selectedSkillId: string | null;
  setSelectedSkillId: Dispatch<SetStateAction<string | null>>;
  isLoading: boolean;
  error: string | null;
};

export type UseSkillDetailsMaterialsParams = {
  userSkillId?: string | null;
};

export type SkillDetailsMaterialGroup = {
  type: MaterialDto['type'];
  label: string;
  items: MaterialDto[];
};

export type UseSkillDetailsMaterialsResult = {
  materials: MaterialDto[];
  materialsByType: SkillDetailsMaterialGroup[];
  isMaterialsLoading: boolean;
  materialsError: string | null;
};

export type UseSkillDetailsRelatedAuthorsParams = {
  authorId: string;
  selectedSkill: CatalogAuthorSkill | null;
  isFavorite: (authorId: string) => boolean;
};

export type UseSkillDetailsRelatedAuthorsResult = {
  relatedAuthors: CatalogAuthor[];
};

export type UseSkillDetailsActionsParams = {
  authorId: string;
  currentAuthor: CatalogAuthor | null;
  selectedSkill: CatalogAuthorSkill | null;
  selectedSkillId: string | null;
};

export type UseSkillDetailsFavoriteParams = {
  authorId: string;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
};

export type UseSkillDetailsFavoriteResult = {
  isFavorite: (authorId: string) => boolean;
  isCurrentAuthorFavorite: boolean;
  favoriteButtonLabel: string;
  handleToggleFavorite: (targetAuthorId: string) => void;
  handleAuthorFavoriteClick: () => void;
};

export type UseSkillDetailsExchangeParams = {
  authorId: string;
  currentAuthor: CatalogAuthor | null;
  selectedSkill: CatalogAuthorSkill | null;
  selectedSkillId: string | null;
  isAuthenticated: boolean;
  hasUser: boolean;
  accessToken: string | null;
  onAuthRequired: () => void;
};

export type UseSkillDetailsExchangeResult = {
  isSuccessModalOpen: boolean;
  proposeButtonLabel: string;
  proposeButtonStyle?: CSSProperties;
  handleProposeExchange: () => Promise<void>;
  handleCloseSuccessModal: () => void;
};

export type UseSkillDetailsAuthModalResult = {
  isAuthModalOpen: boolean;
  handleOpenAuthModal: () => void;
  handleCloseAuthModal: () => void;
  handleLoginRedirect: () => void;
  handleRegisterRedirect: () => void;
};

export type UseSkillDetailsActionsResult = {
  isFavorite: (authorId: string) => boolean;
  isCurrentAuthorFavorite: boolean;
  favoriteButtonLabel: string;
  isAuthModalOpen: boolean;
  isSuccessModalOpen: boolean;
  proposeButtonLabel: string;
  proposeButtonStyle?: CSSProperties;
  handleToggleFavorite: (targetAuthorId: string) => void;
  handleAuthorFavoriteClick: () => void;
  handleProposeExchange: () => Promise<void>;
  handleCloseAuthModal: () => void;
  handleCloseSuccessModal: () => void;
  handleLoginRedirect: () => void;
  handleRegisterRedirect: () => void;
};

export type UseSkillDetailsViewModelParams = {
  authorInfo: SkillDetailsAuthorInfo | null;
  selectedSkill: CatalogAuthorSkill | null;
  authorRatings: UserRatingDto[];
};

export type UseSkillDetailsViewModelResult = {
  galleryImages: string[];
  latestRatings: UserRatingDto[];
  skillDescription: string;
  authorBio: string;
  authorStatus: UserStatus;
};

export type UseSkillDetailsNavigationResult = {
  handleDetailsClick: (targetAuthorId: string) => void;
};
