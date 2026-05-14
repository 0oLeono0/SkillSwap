import type { CSSProperties } from 'react';
import type { CatalogAuthorSkill } from '@/entities/CatalogAuthor';

export type SkillOverviewCardProps = {
  selectedSkill: CatalogAuthorSkill;
  skillDescription: string;
  galleryImages: string[];
  isFavorite: boolean;
  favoriteButtonLabel: string;
  isFavoriteDisabled: boolean;
  proposeButtonLabel: string;
  proposeButtonStyle?: CSSProperties;
  onFavoriteClick: () => void;
  onProposeExchange: () => void;
};
