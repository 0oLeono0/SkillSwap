import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './catalog.module.scss';
import { FilterPanel } from '@/features/Filter/ui/FilterPanel.tsx';
import type {
  CityOption,
  Filters,
  SearchMode,
  SkillCategories as SkillGroup
} from '@/features/Filter/types.ts';
import {
  collectSkillIds,
  countActiveFilters,
  mapCityIdsToCityNames
} from '@/features/Filter/utils.ts';
import { SkillsList } from '@/widgets/SkillsList';
import { Title } from '@/shared/ui/Title';
import {
  DEFAULT_FILTERS,
  buildCatalogSkills,
  createUsersMap,
  filterCatalogSkills,
  loadCatalogBaseData,
  type CatalogSkill
} from '@/pages/Catalog/model/catalogData';
import type { User } from '@/entities/User/types';
import { Button } from '@/shared/ui/button/Button';
import { ROUTES } from '@/shared/constants';
import { useAuth } from '@/app/providers/auth';
import { useFavorites } from '@/app/providers/favorites';
import { adminApi } from '@/shared/api/admin';
import { isElevatedRole } from '@/shared/types/userRole';

type CatalogVariant = 'home' | 'catalog';

interface CatalogProps {
  variant?: CatalogVariant;
  heading?: string;
}

interface SectionConfig {
  key: string;
  title: string;
  skills: CatalogSkill[];
}

const SECTION_SIZE = 3;

const SECTION_META: Record<string, string> = {
  popular: 'Популярное',
  new: 'Новое',
  recommended: 'Рекомендуем',
};

const MODE_LABELS: Record<Exclude<SearchMode, 'all'>, string> = {
  wantToLearn: 'Хочу учить',
  canTeach: 'Могу научить',
};

const searchModeValues: SearchMode[] = ['all', 'wantToLearn', 'canTeach'];

const isValidSearchMode = (value: string | null): value is SearchMode =>
  value !== null && searchModeValues.includes(value as SearchMode);

const limitSkillsByAuthors = (
  skills: CatalogSkill[],
  maxAuthors: number
): CatalogSkill[] => {
  if (!skills.length || maxAuthors <= 0) {
    return [];
  }

  const selectedAuthors = new Set<string>();
  const limitedSkills: CatalogSkill[] = [];

  skills.forEach((skill) => {
    if (selectedAuthors.has(skill.authorId)) {
      limitedSkills.push(skill);
      return;
    }

    if (selectedAuthors.size < maxAuthors) {
      selectedAuthors.add(skill.authorId);
      limitedSkills.push(skill);
    }
  });

  return limitedSkills;
};

const countAuthors = (skills: CatalogSkill[]) =>
  new Set(skills.map((skill) => skill.authorId)).size;

const Catalog = ({ variant = 'home', heading }: CatalogProps) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [skills, setSkills] = useState<CatalogSkill[]>([]);
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [deletingAuthorIds, setDeletingAuthorIds] = useState<string[]>([]);
  const { user: authUser, accessToken } = useAuth();
  const { toggleFavorite, favoriteAuthorIds } = useFavorites();
  const favoriteAuthorSet = useMemo(
    () => new Set(favoriteAuthorIds),
    [favoriteAuthorIds],
  );
  const moderationEnabled = isElevatedRole(authUser?.role);

  const mapSkillsWithFavorites = useCallback(
    (skillList: CatalogSkill[]) =>
      skillList.map((skill) => {
        const shouldBeFavorite = favoriteAuthorSet.has(skill.authorId);
        if (skill.isFavorite === shouldBeFavorite) {
          return skill;
        }
        return { ...skill, isFavorite: shouldBeFavorite };
      }),
    [favoriteAuthorSet],
  );
  const currentUserId = authUser?.id ?? null;
  const visibleSkills = useMemo(
    () =>
      currentUserId
        ? skills.filter((skill) => skill.authorId !== currentUserId)
        : skills,
    [skills, currentUserId],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await loadCatalogBaseData();
        if (!isMounted) return;
        setUsers(data.users);
        setSkills(data.skills);
        setCityOptions(data.cityOptions);
        setSkillGroups(data.skillGroups);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        console.error('[Catalog] Failed to load catalog data', err);
        setError('Не удалось загрузить данные каталога');
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
  }, []);

  useEffect(() => {
    const skillParam = searchParams.get('skills');
    const modeParam = searchParams.get('mode');

    if (!skillParam && !modeParam) {
      return;
    }

    const parsedSkillIds =
      skillParam
        ?.split(',')
        .map((value) => Number(value))
        .filter((value) => !Number.isNaN(value)) ?? [];

    const nextMode = isValidSearchMode(modeParam) ? modeParam : null;

    setFilters((prev) => {
      let hasChanges = false;
      const next = { ...prev };

      if (parsedSkillIds.length) {
        const isSameSelection =
          parsedSkillIds.length === prev.skillIds.length &&
          parsedSkillIds.every((id) => prev.skillIds.includes(id));

        if (!isSameSelection) {
          next.skillIds = parsedSkillIds;
          hasChanges = true;
        }
      }

      if (nextMode && nextMode !== prev.mode) {
        next.mode = nextMode;
        hasChanges = true;
      }

      return hasChanges ? next : prev;
    });

    const nextParams = new URLSearchParams(searchParams);
    if (skillParam) nextParams.delete('skills');
    if (modeParam) nextParams.delete('mode');

    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const nextSearch = (searchParams.get('search') ?? '').trim();
    setSearchQuery((prev) => (prev === nextSearch ? prev : nextSearch));
  }, [searchParams]);

  const usersById = useMemo(() => createUsersMap(users), [users]);

  const filtersCount = useMemo(() => countActiveFilters(filters), [filters]);

  const filteredSkills = useMemo(
    () =>
      filterCatalogSkills({
        skills: visibleSkills,
        filters,
        cityOptions,
        usersById,
        searchQuery
      }),
    [visibleSkills, filters, cityOptions, usersById, searchQuery]
  );

  const skillsByAuthor = useMemo(() => {
    const map = new Map<string, CatalogSkill[]>();
    visibleSkills.forEach((skill) => {
      const list = map.get(skill.authorId) ?? [];
      list.push(skill);
      map.set(skill.authorId, list);
    });
    return map;
  }, [visibleSkills]);

  const getAuthorSkills = useCallback(
    (subset: CatalogSkill[]) => {
      if (!subset.length) return [];
      const authorOrder = Array.from(
        new Set(subset.map((skill) => skill.authorId))
      );
      return authorOrder.flatMap(
        (authorId) => skillsByAuthor.get(authorId) ?? []
      );
    },
    [skillsByAuthor]
  );

  const listSkills = useMemo(
    () => getAuthorSkills(filteredSkills),
    [filteredSkills, getAuthorSkills]
  );

  const visibleAuthorsCount = useMemo(() => {
    if (variant !== 'catalog') return null;
    const authorIds = filteredSkills.map((skill) => skill.authorId);
    return new Set(authorIds).size;
  }, [filteredSkills, variant]);

  const authorOrder = useMemo(
    () => Array.from(new Set(filteredSkills.map((skill) => skill.authorId))),
    [filteredSkills]
  );

  const buildSectionSkills = useCallback(
    (authorIds: string[]) =>
      filteredSkills.filter((skill) => authorIds.includes(skill.authorId)),
    [filteredSkills]
  );

  const sections = useMemo<SectionConfig[]>(() => {
    if (variant !== 'home' || !filteredSkills.length) return [];

    const popularIds = authorOrder.slice(0, SECTION_SIZE);
    const newIds = authorOrder.slice(SECTION_SIZE, SECTION_SIZE * 2);
      const recommendedIds = authorOrder.slice(SECTION_SIZE * 2);

    return [
      {
        key: 'popular',
        title: SECTION_META.popular,
        skills: buildSectionSkills(popularIds)
      },
      {
        key: 'new',
        title: SECTION_META.new,
        skills: buildSectionSkills(newIds)
      },
      {
        key: 'recommended',
        title: SECTION_META.recommended,
        skills: buildSectionSkills(recommendedIds)
      }
    ].filter((section) => section.skills.length);
  }, [authorOrder, buildSectionSkills, filteredSkills.length, variant]);

  const sectionsWithFullSkills = useMemo(() => {
    return sections.map((section) => {
      const displaySkills = getAuthorSkills(section.skills);
      const previewSkills = limitSkillsByAuthors(displaySkills, SECTION_SIZE);
      return {
        ...section,
        displaySkills,
        previewSkills,
        totalAuthors: countAuthors(displaySkills),
        previewAuthors: countAuthors(previewSkills)
      };
    });
  }, [sections, getAuthorSkills]);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpandedSections({});
  }, [sections]);

  const toggleSectionExpansion = useCallback((key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const skillNameById = useMemo(() => {
    const map = new Map<number, string>();
    skillGroups.forEach((group) => {
      group.skills.forEach((skill) => map.set(skill.id, skill.name));
    });
    return map;
  }, [skillGroups]);

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];

    if (filters.mode !== 'all') {
      labels.push(MODE_LABELS[filters.mode] ?? filters.mode);
    }

    if (filters.gender) {
      labels.push(filters.gender);
    }

    if (filters.cities.length) {
      labels.push(...filters.cities);
    }

    if (filters.skillIds.length) {
      labels.push(
        ...filters.skillIds
          .map((id) => skillNameById.get(id))
          .filter((name): name is string => Boolean(name))
      );
    }

    return labels;
  }, [filters, skillNameById]);

  const defaultHeading = heading ?? 'Каталог навыков';

  const computedHeading = useMemo(() => {
    if (activeFilterLabels.length === 0) {
      return defaultHeading;
    }

    if (activeFilterLabels.length === 1) {
      return activeFilterLabels[0];
    }

    const resultCount =
      visibleAuthorsCount ??
      new Set(listSkills.map((skill) => skill.authorId)).size;

    return `Результатов: ${resultCount}`;
  }, [activeFilterLabels, defaultHeading, listSkills, visibleAuthorsCount]);

  const shouldShowHeading =
    Boolean(heading) || variant === 'catalog' || activeFilterLabels.length > 0;

  const handleModeChange = useCallback((mode: SearchMode) => {
    setFilters((prev) => ({ ...prev, mode }));
  }, []);

  const handleGenderChange = useCallback((gender: string) => {
    setFilters((prev) => ({
      ...prev,
      gender: gender || undefined
    }));
  }, []);

  const handleCitySelect = useCallback(
    (cityIds: number[]) => {
      setFilters((prev) => ({
        ...prev,
        cities: mapCityIdsToCityNames(cityOptions, cityIds)
      }));
    },
    [cityOptions]
  );

  const handleSkillSelect = useCallback(
    (categoryId: number, skillIds: number[]) => {
      setFilters((prev) => ({
        ...prev,
        skillIds: collectSkillIds(
          skillGroups,
          prev.skillIds,
          categoryId,
          skillIds
        )
      }));
    },
    [skillGroups]
  );

  const handleResetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  const handleToggleFavorite = useCallback(
    (authorId: string) => {
      toggleFavorite(authorId);
    },
    [toggleFavorite]
  );

  const handleDeleteUser = useCallback(
    async (authorId: string) => {
      if (!accessToken || !moderationEnabled) {
        return;
      }
      setDeletingAuthorIds((prev) =>
        prev.includes(authorId) ? prev : [...prev, authorId],
      );
      setModerationError(null);

      try {
        await adminApi.deleteUser(authorId, accessToken);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== authorId));
        setSkills((prevSkills) => prevSkills.filter((item) => item.authorId !== authorId));
      } catch (err) {
        console.error('[Catalog] Failed to delete user', err);
        setModerationError('Не удалось удалить пользователя. Попробуйте ещё раз.');
      } finally {
        setDeletingAuthorIds((prev) => prev.filter((id) => id !== authorId));
      }
    },
    [accessToken, moderationEnabled],
  );

  const handleDetailsClick = useCallback(
    (authorId: string) => {
      navigate(ROUTES.SKILL_DETAILS.replace(':authorId', authorId));
    },
    [navigate]
  );

  const moderationControls = useMemo(
    () =>
      moderationEnabled
        ? {
            enabled: true,
            deletingAuthorIds,
            onDelete: handleDeleteUser,
          }
        : undefined,
    [moderationEnabled, deletingAuthorIds, handleDeleteUser],
  );

  const renderList = () => (
    <>
      {shouldShowHeading && (
        <div className={styles.heading}>
          <Title tag='h1' variant='xl'>
            {computedHeading}
          </Title>
          {visibleAuthorsCount !== null && (
            <span className={styles.meta}>
              Результатов: {visibleAuthorsCount}
            </span>
          )}
        </div>
      )}

      <SkillsList
        skills={mapSkillsWithFavorites(listSkills)}
        onToggleFavorite={handleToggleFavorite}
        onDetailsClick={handleDetailsClick}
        moderation={moderationControls}
      />
    </>
  );

  const renderSections = () => (
    <div className={styles.sections}>
      {sectionsWithFullSkills.map((section) => {
        const isExpanded = Boolean(expandedSections[section.key]);
        const hasMore = section.totalAuthors > section.previewAuthors;
        const sectionSkills =
          isExpanded || !hasMore ? section.displaySkills : section.previewSkills;

        return (
          <div key={section.key} className={styles.section}>
            <div className={styles.sectionHeader}>
              <Title tag='h2' variant='lg'>
                {section.title}
              </Title>
              {hasMore && (
                <Button
                  variant='secondary'
                  onClick={() => toggleSectionExpansion(section.key)}
                >
                  {isExpanded ? 'Скрыть' : 'Показать все'}
                </Button>
              )}
            </div>

            <SkillsList
              skills={mapSkillsWithFavorites(sectionSkills)}
              onToggleFavorite={handleToggleFavorite}
              onDetailsClick={handleDetailsClick}
              moderation={moderationControls}
            />
          </div>
        );
      })}
    </div>
  );

  let content: ReactNode = null;

  if (isLoading) {
    content = <div className={styles.state}>Загрузка данных…</div>;
  } else if (error) {
    content = <div className={styles.stateError}>{error}</div>;
  } else if (variant === 'home' && sections.length) {
    content = renderSections();
  } else if (variant === 'catalog') {
    content = renderList();
  } else {
    content = (
      <div className={styles.state}>
        По выбранным фильтрам ничего не найдено
      </div>
    );
  }

  return (
    <section className={styles.catalog}>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <FilterPanel
            filters={filters}
            cities={cityOptions}
            skillGroups={skillGroups}
            filtersCount={filtersCount}
            onModeChange={handleModeChange}
            onGenderChange={handleGenderChange}
            onCitySelect={handleCitySelect}
            onSkillSelect={handleSkillSelect}
            onFilterReset={handleResetFilters}
          />
        </aside>

        <div className={styles.content}>
          {moderationError && (
            <p className={styles.moderationError}>{moderationError}</p>
          )}
          {content}
        </div>
      </div>
    </section>
  );
};

export default Catalog;




