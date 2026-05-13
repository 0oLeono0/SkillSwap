import type { CatalogAuthor } from '@/pages/Catalog/model/catalogData';

export type RelatedSkillsSectionProps = {
  authors: CatalogAuthor[];
  onToggleFavorite: (authorId: string) => void;
  onDetailsClick: (authorId: string) => void;
};
