import { useEffect, useMemo, useState } from 'react';
import {
  loadCatalogAuthors,
  type CatalogAuthor,
  type CatalogAuthorSkill
} from '@/pages/Catalog/model/catalogData';
import { normalizeUserStatus } from '@/shared/types/userStatus';
import type {
  UseSkillDetailsDataParams,
  UseSkillDetailsDataResult
} from './types';

export const useSkillDetailsData = ({
  authorId
}: UseSkillDetailsDataParams): UseSkillDetailsDataResult => {
  const [authors, setAuthors] = useState<CatalogAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  useEffect(() => {
    if (!authorId) {
      setError('Не удалось загрузить информацию о навыке');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await loadCatalogAuthors({
          authorIds: [authorId],
          page: 1,
          pageSize: 1
        });
        if (!isMounted) return;
        setAuthors(data.authors);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        console.error('[SkillDetails] Failed to load data', err);
        setError('Не удалось загрузить информацию о навыке');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [authorId]);

  useEffect(() => {
    setSelectedSkillId(null);
  }, [authorId]);

  const currentAuthor = useMemo(
    () => authors.find((author) => author.id === authorId) ?? null,
    [authors, authorId]
  );

  const authorInfo = useMemo(() => {
    if (!currentAuthor) return null;
    return {
      name: currentAuthor.name,
      avatarUrl: currentAuthor.avatarUrl,
      bio: currentAuthor.about,
      city: currentAuthor.city,
      age: currentAuthor.age,
      status: normalizeUserStatus(currentAuthor.status)
    };
  }, [currentAuthor]);

  const teachSkills = useMemo(
    () => currentAuthor?.canTeach ?? [],
    [currentAuthor]
  );

  const learnSkills = useMemo(
    () => currentAuthor?.wantsToLearn ?? [],
    [currentAuthor]
  );

  useEffect(() => {
    if (teachSkills.length && !selectedSkillId) {
      setSelectedSkillId(teachSkills[0].id);
    }
  }, [teachSkills, selectedSkillId]);

  const selectedSkill = useMemo<CatalogAuthorSkill | null>(
    () =>
      teachSkills.find((skill) => skill.id === selectedSkillId) ??
      teachSkills[0] ??
      null,
    [teachSkills, selectedSkillId]
  );

  return {
    currentAuthor,
    authorInfo,
    teachSkills,
    learnSkills,
    selectedSkill,
    selectedSkillId,
    setSelectedSkillId,
    isLoading,
    error
  };
};
