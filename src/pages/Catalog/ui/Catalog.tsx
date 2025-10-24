import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import styles from './catalog.module.scss';
import { FilterPanel } from '@/features/Filter/ui/FilterPanel.tsx';
import type {
  CityOption,
  Filters,
  SearchMode,
  SkillCategories as SkillGroup,
} from '@/features/Filter/types.ts';
import {
  collectSkillIds,
  countActiveFilters,
  mapCityIdsToCityNames,
} from '@/features/Filter/utils.ts';
import { SkillsList } from '@/widgets/SkillsList';
import { Title } from '@/shared/ui/Title';
import {
  DEFAULT_FILTERS,
  createUsersMap,
  filterCatalogSkills,
  loadCatalogBaseData,
  type CatalogSkill,
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

const SECTION_SIZE = 4;

const SECTION_META: Record<string, string> = {
  popular: 'Популярное',
  new: 'Новое',
  recommended: 'Рекомендуем',
};

const Catalog = ({ variant = 'home', heading }: CatalogProps) => {
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
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

  const usersById = useMemo(() => createUsersMap(users), [users]);

  const filtersCount = useMemo(
    () => countActiveFilters(filters),
    [filters],
  );

  const filteredSkills = useMemo(
    () =>
      filterCatalogSkills({
        skills,
        filters,
        cityOptions,
        usersById,
      }),
    [skills, filters, cityOptions, usersById],
  );

  const visibleAuthorsCount = useMemo(() => {
    if (variant !== 'catalog') return null;
    const authorIds = filteredSkills.map((skill) => skill.authorId);
    return new Set(authorIds).size;
  }, [filteredSkills, variant]);

  const authorOrder = useMemo(
    () => Array.from(new Set(filteredSkills.map((skill) => skill.authorId))),
    [filteredSkills],
  );

  const buildSectionSkills = useCallback(
    (authorIds: number[]) =>
      filteredSkills.filter((skill) => authorIds.includes(skill.authorId)),
    [filteredSkills],
  );

  const sections = useMemo<SectionConfig[]>(() => {
    if (variant !== 'home' || !filteredSkills.length) return [];

    const popularIds = authorOrder.slice(0, SECTION_SIZE);
    const newIds = authorOrder.slice(SECTION_SIZE, SECTION_SIZE * 2);
    const recommendedIds = authorOrder.slice(SECTION_SIZE * 2);

    return [
      { key: 'popular', title: SECTION_META.popular, skills: buildSectionSkills(popularIds) },
      { key: 'new', title: SECTION_META.new, skills: buildSectionSkills(newIds) },
      { key: 'recommended', title: SECTION_META.recommended, skills: buildSectionSkills(recommendedIds) },
    ].filter((section) => section.skills.length);
  }, [authorOrder, buildSectionSkills, filteredSkills.length, variant]);

  const handleModeChange = useCallback((mode: SearchMode) => {
    setFilters((prev) => ({ ...prev, mode }));
  }, []);

  const handleGenderChange = useCallback((gender: string) => {
    setFilters((prev) => ({
      ...prev,
      gender: gender || undefined,
    }));
  }, []);

  const handleCitySelect = useCallback(
    (cityIds: number[]) => {
      setFilters((prev) => ({
        ...prev,
        cities: mapCityIdsToCityNames(cityOptions, cityIds),
      }));
    },
    [cityOptions],
  );

  const handleSkillSelect = useCallback(
    (categoryId: number, skillIds: number[]) => {
      setFilters((prev) => ({
        ...prev,
        skillIds: collectSkillIds(
          skillGroups,
          prev.skillIds,
          categoryId,
          skillIds,
        ),
      }));
    },
    [skillGroups],
  );

  const handleResetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  const handleToggleFavorite = useCallback((authorId: number) => {
    setSkills((prevSkills) => {
      const isFavorite = prevSkills.some(
        (skill) => skill.authorId === authorId && skill.isFavorite,
      );

      return prevSkills.map((skill) =>
        skill.authorId === authorId
          ? { ...skill, isFavorite: !isFavorite }
          : skill,
      );
    });
  }, []);

  const handleDetailsClick = useCallback((authorId: number) => {
    console.info('[Catalog] Details requested for author', authorId);
    // TODO: открыть модальное окно с подробностями
  }, []);

  const renderList = () => (
    <>
      {(heading ?? variant === 'catalog') && (
        <div className={styles.heading}>
          <Title tag="h1" variant="xl">
            {heading ?? 'Каталог навыков'}
          </Title>
          {visibleAuthorsCount !== null && (
            <span className={styles.meta}>
              Найдено специалистов: {visibleAuthorsCount}
            </span>
          )}
        </div>
      )}

      <SkillsList
        skills={filteredSkills}
        onToggleFavorite={handleToggleFavorite}
        onDetailsClick={handleDetailsClick}
      />
    </>
  );

  const renderSections = () => (
    <div className={styles.sections}>
      {sections.map((section) => (
        <div key={section.key} className={styles.section}>
          <div className={styles.sectionHeader}>
            <Title tag="h2" variant="lg">
              {section.title}
            </Title>
            <Button
              variant="secondary"
              onClick={() => console.info(`[Catalog] Section "${section.key}" open requested`)}
            >
              Смотреть все
            </Button>
          </div>

          <SkillsList
            skills={section.skills}
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
