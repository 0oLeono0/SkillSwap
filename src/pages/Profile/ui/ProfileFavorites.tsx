import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement
} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './profileFavorites.module.scss';
import { Title } from '@/shared/ui/Title';
import { Button } from '@/shared/ui/button/Button';
import { SkillsList } from '@/widgets/SkillsList';
import {
  loadCatalogAuthors,
  type CatalogAuthor
} from '@/pages/Catalog/model/catalogData';
import { useFavorites } from '@/app/providers/favorites';
import { ROUTES } from '@/shared/constants';

export function ProfileFavorites(): ReactElement {
  const { favoriteAuthorIds, toggleFavorite, clearFavorites } = useFavorites();
  const [authors, setAuthors] = useState<CatalogAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAuthors = useCallback(async () => {
    if (!favoriteAuthorIds.length) {
      setAuthors([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await loadCatalogAuthors({
        authorIds: favoriteAuthorIds,
        page: 1,
        pageSize: favoriteAuthorIds.length
      });
      setAuthors(data.authors);
      setError(null);
    } catch (err) {
      console.error('[ProfileFavorites] Failed to load data', err);
      setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  }, [favoriteAuthorIds]);

  useEffect(() => {
    void fetchAuthors();
  }, [fetchAuthors]);

  const favoriteAuthorSet = useMemo(
    () => new Set(favoriteAuthorIds),
    [favoriteAuthorIds]
  );

  const favoriteAuthors = useMemo(
    () => authors.filter((author) => favoriteAuthorSet.has(author.id)),
    [authors, favoriteAuthorSet]
  );

  const favoriteAuthorsWithState = useMemo(
    () =>
      favoriteAuthors.map((author) =>
        author.isFavorite ? author : { ...author, isFavorite: true }
      ),
    [favoriteAuthors]
  );

  const hasFavorites = favoriteAuthors.length > 0;

  const handleDetailsClick = useCallback(
    (authorId: string) => {
      navigate(ROUTES.SKILL_DETAILS.replace(':authorId', authorId));
    },
    [navigate]
  );

  const handleOpenCatalog = useCallback(() => {
    navigate(ROUTES.CATALOG);
  }, [navigate]);

  const handleClearFavorites = useCallback(() => {
    clearFavorites();
  }, [clearFavorites]);

  const renderContent = () => {
    if (isLoading && !authors.length) {
      return (
        <div className={styles.state}>Загружаем сохранённых авторов...</div>
      );
    }

    if (hasFavorites) {
      return (
        <SkillsList
          authors={favoriteAuthorsWithState}
          onToggleFavorite={toggleFavorite}
          onDetailsClick={handleDetailsClick}
        />
      );
    }

    return (
      <div className={styles.empty}>
        <p>
          Здесь появятся специалисты, которых вы добавите в избранное. Откройте
          каталог и отмечайте понравившиеся профили, чтобы быстро находить их в
          личном кабинете.
        </p>
        <div className={styles.emptyActions}>
          <Button variant='primary' onClick={handleOpenCatalog}>
            Перейти в каталог
          </Button>
        </div>
      </div>
    );
  };

  return (
    <section className={styles.favorites}>
      <div className={styles.header}>
        <div>
          <Title tag='h2' variant='lg'>
            Избранное
          </Title>
          <p className={styles.subtitle}>
            Сохраняйте интересные профили и возвращайтесь к ним в один клик — мы
            запомним их даже после закрытия каталога.
          </p>
        </div>
        {hasFavorites && (
          <div className={styles.actions}>
            <Button
              variant='secondary'
              onClick={fetchAuthors}
              disabled={isLoading}
            >
              {isLoading ? 'Обновляем…' : 'Обновить данные'}
            </Button>
            <Button variant='secondary' onClick={handleClearFavorites}>
              Очистить список
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.statusRow}>
          <p className={styles.error}>{error}</p>
          <Button
            variant='secondary'
            onClick={fetchAuthors}
            disabled={isLoading}
          >
            Повторить
          </Button>
        </div>
      )}

      {renderContent()}
    </section>
  );
}
