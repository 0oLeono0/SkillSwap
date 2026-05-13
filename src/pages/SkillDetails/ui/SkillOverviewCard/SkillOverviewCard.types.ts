import type { CSSProperties } from 'react';
import type { CatalogAuthorSkill } from '@/pages/Catalog/model/catalogData';

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
