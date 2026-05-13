import { useEffect, useMemo, useState } from 'react';
import {
  loadCatalogAuthors,
  type CatalogAuthor
} from '@/pages/Catalog/model/catalogData';
import type {
  UseSkillDetailsRelatedAuthorsParams,
  UseSkillDetailsRelatedAuthorsResult
} from './types';

const RELATED_AUTHORS_LIMIT = 4;

export const useSkillDetailsRelatedAuthors = ({
  authorId,
  selectedSkill,
  isFavorite
}: UseSkillDetailsRelatedAuthorsParams): UseSkillDetailsRelatedAuthorsResult => {
  const [relatedAuthors, setRelatedAuthors] = useState<CatalogAuthor[]>([]);
  const selectedCategoryId = selectedSkill?.categoryId;

  useEffect(() => {
    let isMounted = true;

    const fetchRelated = async () => {
      if (typeof selectedCategoryId !== 'number') {
        setRelatedAuthors([]);
        return;
      }

      try {
        const data = await loadCatalogAuthors({
          categoryIds: [selectedCategoryId],
          mode: 'wantToLearn',
          excludeAuthorId: authorId,
          page: 1,
          pageSize: RELATED_AUTHORS_LIMIT
        });

        if (!isMounted) return;
        setRelatedAuthors(data.authors);
      } catch (err) {
        if (!isMounted) return;
        console.error('[SkillDetails] Failed to load related skills', err);
        setRelatedAuthors([]);
      }
    };

    fetchRelated();

    return () => {
      isMounted = false;
    };
  }, [authorId, selectedCategoryId]);

  const relatedAuthorsWithFavorites = useMemo(
    () =>
      relatedAuthors.map((author) => {
        const shouldBeFavorite = isFavorite(author.id);
        if (author.isFavorite === shouldBeFavorite) {
          return author;
        }
        return { ...author, isFavorite: shouldBeFavorite };
      }),
    [relatedAuthors, isFavorite]
  );

  return {
    relatedAuthors: relatedAuthorsWithFavorites
  };
};
