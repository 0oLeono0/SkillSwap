import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
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
  mapCityIdsToCityNames,
  mapCityNamesToCityIds
} from '@/features/Filter/utils.ts';
import {
  filterReducer,
  filtersInitialState
} from '@/features/Filter/model/filterReducer';
import { SkillsList } from '@/widgets/SkillsList';
import { Title } from '@/shared/ui/Title';
import {
  loadCatalogAuthors,
  type CatalogAuthor
} from '@/pages/Catalog/model/catalogData';
import { Button } from '@/shared/ui/button/Button';
import { ROUTES } from '@/shared/constants';
import { useAuth } from '@/app/providers/auth';
import { useFavorites } from '@/app/providers/favorites';
import { adminApi } from '@/shared/api/admin';
import { ApiError } from '@/shared/api/request';
import { isElevatedRole } from '@/shared/types/userRole';
import { loadFiltersBaseData } from '@/features/Filter/model/filterBaseDataStore';

type CatalogVariant = 'home' | 'catalog';

interface CatalogProps {
  variant?: CatalogVariant;
  heading?: string;
}

interface SectionConfig {
  key: string;
  title: string;
  authors: CatalogAuthor[];
}

const SECTION_SIZE = 3;
const CATALOG_PAGE_SIZE = 12;
const HOME_AUTHORS_LIMIT = SECTION_SIZE * 3;

const SECTION_META: Record<string, string> = {
  popular: 'Популярное',
  new: 'Новое',
  recommended: 'Рекомендуем'
};

const MODE_LABELS: Record<Exclude<SearchMode, 'all'>, string> = {
  wantToLearn: 'Хочу учить',
  canTeach: 'Могу научить'
};

const searchModeValues: SearchMode[] = ['all', 'wantToLearn', 'canTeach'];

const isValidSearchMode = (value: string | null): value is SearchMode =>
  value !== null && searchModeValues.includes(value as SearchMode);

const limitAuthors = (
  authors: CatalogAuthor[],
  maxAuthors: number
): CatalogAuthor[] => {
  if (!authors.length || maxAuthors <= 0) {
    return [];
  }

  return authors.slice(0, maxAuthors);
};

const Catalog = ({ variant = 'home', heading }: CatalogProps) => {
  const navigate = useNavigate();
  const [filters, dispatchFilters] = useReducer(
    filterReducer,
    filtersInitialState
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [authors, setAuthors] = useState<CatalogAuthor[]>([]);
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [page, setPage] = useState(1);
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [deletingAuthorIds, setDeletingAuthorIds] = useState<string[]>([]);
  const { user: authUser, accessToken } = useAuth();
  const { toggleFavorite, favoriteAuthorIds } = useFavorites();
  const searchAbortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const favoriteAuthorSet = useMemo(
    () => new Set(favoriteAuthorIds),
    [favoriteAuthorIds]
  );
  const moderationEnabled = isElevatedRole(authUser?.role);

  const mapAuthorsWithFavorites = useCallback(
    (authorList: CatalogAuthor[]) =>
      authorList.map((author) => {
        const shouldBeFavorite = favoriteAuthorSet.has(author.id);
        if (author.isFavorite === shouldBeFavorite) {
          return author;
        }
        return { ...author, isFavorite: shouldBeFavorite };
      }),
    [favoriteAuthorSet]
  );
  const currentUserId = authUser?.id ?? null;
  const pageSize =
    variant === 'catalog' ? CATALOG_PAGE_SIZE : HOME_AUTHORS_LIMIT;

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      searchAbortRef.current?.abort();
      searchAbortRef.current = null;
    };
  }, []);

  const fetchAuthors = useCallback(
    async (nextPage: number, append: boolean) => {
      if (filters.cities.length && cityOptions.length === 0) {
        return;
      }

      const requestId = ++requestIdRef.current;
      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;

      const isCurrentRequest = () => requestId === requestIdRef.current;

      const cityIds = filters.cities.length
        ? mapCityNamesToCityIds(cityOptions, filters.cities)
        : [];

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setAuthors([]);
      }

      try {
        const data = await loadCatalogAuthors(
          {
            mode: filters.mode,
            gender: filters.gender,
            cityIds,
            skillIds: filters.skillIds,
            search: searchQuery,
            page: nextPage,
            pageSize,
            excludeAuthorId: currentUserId ?? undefined
          },
          { signal: controller.signal }
        );

        if (!isCurrentRequest()) {
          return;
        }

        setAuthors((prev) =>
          append ? [...prev, ...data.authors] : data.authors
        );
        setTotalAuthors(data.totalAuthors);
        setPage(nextPage);
        setError(null);
      } catch (err) {
        if (!isCurrentRequest()) {
          return;
        }
        if (err instanceof ApiError && err.status === 499) {
          return;
        }
        console.error('[Catalog] Failed to load catalog data', err);
        setError('Не удалось загрузить данные каталога');
      } finally {
        if (isCurrentRequest()) {
          if (searchAbortRef.current === controller) {
            searchAbortRef.current = null;
          }
          if (append) {
            setIsLoadingMore(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    },
    [filters, cityOptions, searchQuery, currentUserId, pageSize]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchBaseData = async () => {
      try {
        const data = await loadFiltersBaseData();
        if (!isMounted) return;
        setCityOptions(data.cities);
        setSkillGroups(data.skillGroups);
      } catch (err) {
        if (!isMounted) return;
        console.error('[Catalog] Failed to load filters base data', err);
        setError('Не удалось загрузить данные фильтров');
      }
    };

    fetchBaseData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchAuthors(1, false);
  }, [fetchAuthors]);

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

    const nextFilters: Filters = { ...filters };
    let hasChanges = false;

    if (parsedSkillIds.length) {
      const isSameSelection =
        parsedSkillIds.length === filters.skillIds.length &&
        parsedSkillIds.every((id) => filters.skillIds.includes(id));

      if (!isSameSelection) {
        nextFilters.skillIds = parsedSkillIds;
        hasChanges = true;
      }
    }

    if (nextMode && nextMode !== filters.mode) {
      nextFilters.mode = nextMode;
      hasChanges = true;
    }

    if (hasChanges) {
      dispatchFilters({ type: 'replace', filters: nextFilters });
    }

    const nextParams = new URLSearchParams(searchParams);
    if (skillParam) nextParams.delete('skills');
    if (modeParam) nextParams.delete('mode');

    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams, filters]);

  useEffect(() => {
    const nextSearch = (searchParams.get('search') ?? '').trim();
    setSearchQuery((prev) => (prev === nextSearch ? prev : nextSearch));
  }, [searchParams]);

  const filtersCount = useMemo(() => countActiveFilters(filters), [filters]);

  const filteredAuthors = useMemo(() => authors, [authors]);

  const listAuthors = useMemo(() => filteredAuthors, [filteredAuthors]);

  const visibleAuthorsCount = useMemo(() => {
    if (variant !== 'catalog') return null;
    return totalAuthors;
  }, [totalAuthors, variant]);

  const loadedAuthorsCount = useMemo(() => authors.length, [authors]);

  const hasMore = variant === 'catalog' && loadedAuthorsCount < totalAuthors;

  const sections = useMemo<SectionConfig[]>(() => {
    if (variant !== 'home' || !filteredAuthors.length) return [];

    const popularAuthors = filteredAuthors.slice(0, SECTION_SIZE);
    const newAuthors = filteredAuthors.slice(SECTION_SIZE, SECTION_SIZE * 2);
    const recommendedAuthors = filteredAuthors.slice(SECTION_SIZE * 2);

    return [
      {
        key: 'popular',
        title: SECTION_META.popular,
        authors: popularAuthors
      },
      {
        key: 'new',
        title: SECTION_META.new,
        authors: newAuthors
      },
      {
        key: 'recommended',
        title: SECTION_META.recommended,
        authors: recommendedAuthors
      }
    ].filter((section) => section.authors.length);
  }, [filteredAuthors, variant]);

  const sectionsWithFullAuthors = useMemo(() => {
    return sections.map((section) => {
      const displayAuthors = section.authors;
      const previewAuthors = limitAuthors(displayAuthors, SECTION_SIZE);
      return {
        ...section,
        displayAuthors,
        previewAuthors,
        totalAuthors: displayAuthors.length,
        previewAuthorsCount: previewAuthors.length
      };
    });
  }, [sections]);

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

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

    const resultCount = visibleAuthorsCount ?? listAuthors.length;

    return `Результатов: ${resultCount}`;
  }, [activeFilterLabels, defaultHeading, listAuthors, visibleAuthorsCount]);

  const shouldShowHeading =
    Boolean(heading) || variant === 'catalog' || activeFilterLabels.length > 0;

  const handleModeChange = useCallback((mode: SearchMode) => {
    dispatchFilters({ type: 'setMode', mode });
  }, []);

  const handleGenderChange = useCallback((gender: string) => {
    dispatchFilters({ type: 'setGender', gender: gender || undefined });
  }, []);

  const handleCitySelect = useCallback(
    (cityIds: number[]) => {
      const cities = mapCityIdsToCityNames(cityOptions, cityIds);
      dispatchFilters({ type: 'setCities', cities });
    },
    [cityOptions]
  );

  const handleSkillSelect = useCallback(
    (categoryId: number, skillIds: number[]) => {
      const nextSkillIds = collectSkillIds(
        skillGroups,
        filters.skillIds,
        categoryId,
        skillIds
      );
      dispatchFilters({ type: 'setSkillIds', skillIds: nextSkillIds });
    },
    [skillGroups, filters.skillIds]
  );

  const handleResetFilters = useCallback(() => {
    dispatchFilters({ type: 'reset' });
  }, []);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || isLoading || !hasMore) return;
    fetchAuthors(page + 1, true);
  }, [fetchAuthors, hasMore, isLoading, isLoadingMore, page]);

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
        prev.includes(authorId) ? prev : [...prev, authorId]
      );
      setModerationError(null);

      try {
        await adminApi.deleteUser(authorId, accessToken);
        setAuthors((prevAuthors) =>
          prevAuthors.filter((item) => item.id !== authorId)
        );
      } catch (err) {
        console.error('[Catalog] Failed to delete user', err);
        setModerationError(
          'Не удалось удалить пользователя. Попробуйте ещё раз.'
        );
      } finally {
        setDeletingAuthorIds((prev) => prev.filter((id) => id !== authorId));
      }
    },
    [accessToken, moderationEnabled]
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
            onDelete: handleDeleteUser
          }
        : undefined,
    [moderationEnabled, deletingAuthorIds, handleDeleteUser]
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
        authors={mapAuthorsWithFavorites(listAuthors)}
        onToggleFavorite={handleToggleFavorite}
        onDetailsClick={handleDetailsClick}
        moderation={moderationControls}
      />
      {hasMore && (
        <div className={styles.loadMore}>
          <Button
            variant='secondary'
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Загрузка...' : 'Показать еще'}
          </Button>
        </div>
      )}
    </>
  );

  const renderSections = () => (
    <div className={styles.sections}>
      {sectionsWithFullAuthors.map((section) => {
        const isExpanded = Boolean(expandedSections[section.key]);
        const hasMoreInSection =
          section.totalAuthors > section.previewAuthorsCount;
        const sectionAuthors =
          isExpanded || !hasMoreInSection
            ? section.displayAuthors
            : section.previewAuthors;

        return (
          <div key={section.key} className={styles.section}>
            <div className={styles.sectionHeader}>
              <Title tag='h2' variant='lg'>
                {section.title}
              </Title>
              {hasMoreInSection && (
                <Button
                  variant='secondary'
                  onClick={() => toggleSectionExpansion(section.key)}
                >
                  {isExpanded ? 'Скрыть' : 'Показать все'}
                </Button>
              )}
            </div>

            <SkillsList
              authors={mapAuthorsWithFavorites(sectionAuthors)}
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
