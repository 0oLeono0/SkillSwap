import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { useSearchParams } from 'react-router-dom';
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
  createUsersMap,
  filterCatalogSkills,
  loadCatalogBaseData,
  type CatalogSkill
} from '@/pages/Catalog/model/catalogData';
import type { User } from '@/entities/User/types';
import { Button } from '@/shared/ui/button/Button';

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
  recommended: 'Рекомендуем'
};

const MODE_LABELS: Record<Exclude<SearchMode, 'all'>, string> = {
  wantToLearn: 'Хочу учить',
  canTeach: 'Могу научить'
};

const searchModeValues: SearchMode[] = ['all', 'wantToLearn', 'canTeach'];

const isValidSearchMode = (value: string | null): value is SearchMode =>
  value !== null && searchModeValues.includes(value as SearchMode);

const Catalog = ({ variant = 'home', heading }: CatalogProps) => {
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [skills, setSkills] = useState<CatalogSkill[]>([]);
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = loadCatalogBaseData();
      setUsers(data.users);
      setSkills(data.skills);
      setCityOptions(data.cityOptions);
      setSkillGroups(data.skillGroups);
    } catch (err) {
      console.error('[Catalog] Failed to load catalog data', err);
      setError('Не удалось загрузить данные каталога');
    } finally {
      setIsLoading(false);
    }
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

  const usersById = useMemo(() => createUsersMap(users), [users]);

  const filtersCount = useMemo(() => countActiveFilters(filters), [filters]);

  const filteredSkills = useMemo(
    () =>
      filterCatalogSkills({
        skills,
        filters,
        cityOptions,
        usersById
      }),
    [skills, filters, cityOptions, usersById]
  );

  const skillsByAuthor = useMemo(() => {
    const map = new Map<number, CatalogSkill[]>();
    skills.forEach((skill) => {
      const list = map.get(skill.authorId) ?? [];
      list.push(skill);
      map.set(skill.authorId, list);
    });
    return map;
  }, [skills]);

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
    (authorIds: number[]) =>
      filteredSkills.filter((skill) => authorIds.includes(skill.authorId)),
    [filteredSkills]
  );

  const sections = useMemo<SectionConfig[]>(() => {
    if (variant !== 'home' || !filteredSkills.length) return [];

    const popularIds = authorOrder.slice(0, SECTION_SIZE);
    const newIds = authorOrder.slice(SECTION_SIZE, SECTION_SIZE * 2);
    const recommendedIds = authorOrder.slice(
      SECTION_SIZE * 2,
      SECTION_SIZE * 5
    );

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

  const sectionsWithFullSkills = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        displaySkills: getAuthorSkills(section.skills)
      })),
    [sections, getAuthorSkills]
  );

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

  const handleToggleFavorite = useCallback((authorId: number) => {
    setSkills((prevSkills) => {
      const isFavorite = prevSkills.some(
        (skill) => skill.authorId === authorId && skill.isFavorite
      );

      return prevSkills.map((skill) =>
        skill.authorId === authorId
          ? { ...skill, isFavorite: !isFavorite }
          : skill
      );
    });
  }, []);

  const handleDetailsClick = useCallback((authorId: number) => {
    console.info('[Catalog] Details requested for author', authorId);
    // TODO: открыть модальное окно с подробностями
  }, []);

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
        skills={listSkills}
        onToggleFavorite={handleToggleFavorite}
        onDetailsClick={handleDetailsClick}
      />
    </>
  );

  const renderSections = () => (
    <div className={styles.sections}>
      {sectionsWithFullSkills.map((section) => (
        <div key={section.key} className={styles.section}>
          <div className={styles.sectionHeader}>
            <Title tag='h2' variant='lg'>
              {shouldShowHeading ? computedHeading : section.title}
            </Title>
            <Button
              variant='secondary'
              onClick={() =>
                console.info(
                  `[Catalog] Section "${section.key}" open requested`
                )
              }
            >
              Смотреть все
            </Button>
          </div>

          <SkillsList
            skills={section.displaySkills}
            onToggleFavorite={handleToggleFavorite}
            onDetailsClick={handleDetailsClick}
          />
        </div>
      ))}
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

        <div className={styles.content}>{content}</div>
      </div>
    </section>
  );
};

export default Catalog;
