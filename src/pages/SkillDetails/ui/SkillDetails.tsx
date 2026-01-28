import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './skillDetails.module.scss';
import {
  loadCatalogAuthors,
  type CatalogAuthor,
  type CatalogAuthorSkill
} from '@/pages/Catalog/model/catalogData';
import { useAuth } from '@/app/providers/auth';

import { useFavorites } from '@/app/providers/favorites';
import { createRequest } from '@/features/requests/model/actions';
import { Button } from '@/shared/ui/button/Button';
import { Tag } from '@/shared/ui/Tag/Tag';
import { Title } from '@/shared/ui/Title';
import { Modal } from '@/shared/ui/Modal/Modal';
import { ROUTES } from '@/shared/constants';
import type { SkillCategory } from '@/shared/lib/constants';
import { SkillsList } from '@/widgets/SkillsList';
import GalleryIcon from '@/shared/assets/icons/actions/like.svg?react';
import ShareIcon from '@/shared/assets/icons/actions/share.svg?react';
import MoreIcon from '@/shared/assets/icons/actions/more-square.svg?react';
import stock1 from '@/shared/assets/images/stock/stock.jpg';
import stock2 from '@/shared/assets/images/stock/stock2.jpg';
import stock3 from '@/shared/assets/images/stock/stock3.jpg';
import stock4 from '@/shared/assets/images/stock/stock4.jpg';
import OkIcon from '@/shared/assets/icons/status/done.svg?react';
import NotificationIcon from '@/shared/assets/icons/content/notification.svg?react';

const RELATED_AUTHORS_LIMIT = 4;

const GALLERY_IMAGES = [stock1, stock2, stock3, stock4];

const SkillDetails = (): ReactElement => {
  const { authorId: authorIdParam } = useParams();
  const authorId = authorIdParam ?? '';
  const navigate = useNavigate();
  const { isAuthenticated, user, accessToken } = useAuth();

  const { toggleFavorite, isFavorite } = useFavorites();

  const [authors, setAuthors] = useState<CatalogAuthor[]>([]);
  const [relatedAuthors, setRelatedAuthors] = useState<CatalogAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isProposalSent, setIsProposalSent] = useState(false);
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

  useEffect(() => {
    setIsProposalSent(false);
    setIsSuccessModalOpen(false);
  }, [selectedSkillId, authorId]);

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
      age: currentAuthor.age
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

  const galleryImages = useMemo(() => {
    if (selectedSkill?.imageUrls && selectedSkill.imageUrls.length > 0) {
      return selectedSkill.imageUrls;
    }

    if (selectedSkill?.imageUrl) {
      return [selectedSkill.imageUrl];
    }

    if (authorInfo?.avatarUrl) {
      return [authorInfo.avatarUrl];
    }

    return GALLERY_IMAGES;
  }, [authorInfo, selectedSkill]);

  useEffect(() => {
    let isMounted = true;

    const fetchRelated = async () => {
      if (!selectedSkill || typeof selectedSkill.categoryId !== 'number') {
        setRelatedAuthors([]);
        return;
      }

      try {
        const data = await loadCatalogAuthors({
          categoryIds: [selectedSkill.categoryId],
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
  }, [authorId, selectedSkill]);

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
  const handleToggleFavorite = useCallback(
    (targetAuthorId: string) => {
      toggleFavorite(targetAuthorId);
    },
    [toggleFavorite]
  );

  const handleAuthorFavoriteClick = useCallback(() => {
    if (authorId) {
      handleToggleFavorite(authorId);
    }
  }, [authorId, handleToggleFavorite]);

  const isCurrentAuthorFavorite = useMemo(
    () => (authorId ? isFavorite(authorId) : false),
    [authorId, isFavorite]
  );

  const favoriteButtonLabel = isCurrentAuthorFavorite
    ? 'Убрать из избранного'
    : 'Добавить в избранное';
  const favoriteButtonClassName = isCurrentAuthorFavorite
    ? `${styles.actionButton} ${styles.actionButtonActive}`
    : styles.actionButton;

  const handleDetailsClick = useCallback(
    (targetAuthorId: string) => {
      navigate(ROUTES.SKILL_DETAILS.replace(':authorId', targetAuthorId));
    },
    [navigate]
  );

  const handleProposeExchange = useCallback(async () => {
    if (!selectedSkill || !currentAuthor) {
      return;
    }

    if (!isAuthenticated || !user || !accessToken) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await createRequest(accessToken, {
        toUserId: currentAuthor.id,
        userSkillId: selectedSkill.userSkillId
      });
      setIsProposalSent(true);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('[SkillDetails] Failed to create request', err);
    }
  }, [accessToken, currentAuthor, isAuthenticated, selectedSkill, user]);

  const handleCloseAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleCloseSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
  }, []);

  const handleLoginRedirect = useCallback(() => {
    setIsAuthModalOpen(false);
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  const handleRegisterRedirect = useCallback(() => {
    setIsAuthModalOpen(false);
    navigate(ROUTES.REGISTER);
  }, [navigate]);

  if (isLoading) {
    return <div className={styles.state}>Загрузка данных…</div>;
  }

  if (error || !authorInfo || !selectedSkill) {
    return (
      <div className={styles.stateError}>
        {error ?? 'Навык не найден или был удалён'}
      </div>
    );
  }

  const placeholderDescription =
    'Привет! Я увлекаюсь этим навыком уже больше 10 лет — от первых занятий дома до выступлений на сцене. Научу вас основам, поделюсь любимыми техниками и помогу уверенно чувствовать себя даже без подготовки.';

  const proposeButtonLabel = isProposalSent
    ? 'Обмен предложен'
    : 'Предложить обмен';
  const proposeButtonInlineStyle = isProposalSent
    ? {
        backgroundColor: '#fff',
        color: '#000',
        borderColor: 'var(--button-color-accent)'
      }
    : undefined;

  return (
    <section className={styles.skillDetails}>
      <div className={styles.hero}>
        <article className={styles.authorCard}>
          <div className={styles.authorInfo}>
            <img
              className={styles.authorAvatar}
              src={
                authorInfo.avatarUrl ||
                selectedSkill.imageUrl ||
                galleryImages[0]
              }
              alt={authorInfo.name}
            />
            <div>
              <Title tag='h2' variant='lg'>
                {authorInfo.name}
              </Title>
              <p className={styles.authorMeta}>
                {authorInfo.city || 'Город не указан'}, {authorInfo.age} лет
              </p>
            </div>
          </div>
          <p className={styles.authorBio}>
            {authorInfo.bio ?? selectedSkill.description ?? ''}
          </p>

          <div className={styles.authorSkills}>
            <span>Может научить:</span>
            <div className={styles.tags}>
              {teachSkills.map((skill) => (
                <Tag key={skill.id} category={skill.category as SkillCategory}>
                  {skill.title}
                </Tag>
              ))}
            </div>
          </div>

          <div className={styles.authorSkills}>
            <span>Хочет научиться:</span>
            <div className={styles.tags}>
              {learnSkills.map((skill) => (
                <Tag key={skill.id} category={skill.category as SkillCategory}>
                  {skill.title}
                </Tag>
              ))}
            </div>
          </div>
        </article>

        <article className={styles.skillCard}>
          <div className={styles.skillHeader}>
            <div className={styles.actions}>
              <button
                type='button'
                className={favoriteButtonClassName}
                onClick={handleAuthorFavoriteClick}
                aria-label={favoriteButtonLabel}
                aria-pressed={isCurrentAuthorFavorite}
                disabled={!authorId}
              >
                <GalleryIcon />
              </button>
              <button type='button' aria-label='Поделиться'>
                <ShareIcon />
              </button>
              <button type='button' aria-label='Ещё'>
                <MoreIcon />
              </button>
            </div>
          </div>
          <div className={styles.skillContent}>
            <div className={styles.skillInfo}>
              <Title tag='h1' variant='xl'>
                {selectedSkill.title}
              </Title>
              <p className={styles.skillCategory}>{selectedSkill.category}</p>
              <p className={styles.skillDescription}>
                {placeholderDescription}
              </p>
              <Button
                variant='primary'
                onClick={handleProposeExchange}
                style={proposeButtonInlineStyle}
              >
                {proposeButtonLabel}
              </Button>
            </div>
            <div className={styles.gallery}>
              <img
                className={styles.galleryMain}
                src={galleryImages[0]}
                alt={selectedSkill.title}
              />
              <div className={styles.galleryThumbs}>
                {galleryImages.slice(1).map((image, index) => (
                  <img
                    key={image}
                    src={image}
                    alt={`${selectedSkill.title} ${index + 2}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className={styles.relatedSection}>
        <div className={styles.relatedHeader}>
          <Title tag='h2' variant='lg'>
            Похожие предложения
          </Title>
        </div>
        {relatedAuthors.length ? (
          <SkillsList
            authors={relatedAuthorsWithFavorites}
            onToggleFavorite={handleToggleFavorite}
            onDetailsClick={handleDetailsClick}
          />
        ) : (
          <div className={styles.state}>Пока нет похожих предложений</div>
        )}
      </div>
      <Modal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal}>
        <div className={styles.authPrompt}>
          <div className={styles.modalIcon}>
            <OkIcon />
          </div>
          <Title tag='h3' variant='lg'>
            Чтобы предложить обмен, войдите или зарегистрируйтесь
          </Title>
          <p>
            После авторизации вы сможете отправлять запросы авторам и следить за
            статусом обменов в личном кабинете.
          </p>
          <div className={styles.authPromptActions}>
            <Button variant='secondary' onClick={handleLoginRedirect}>
              Войти
            </Button>
            <Button variant='primary' onClick={handleRegisterRedirect}>
              Зарегистрироваться
            </Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isSuccessModalOpen} onClose={handleCloseSuccessModal}>
        <div className={styles.exchangeModal}>
          <div className={styles.modalIcon}>
            <NotificationIcon />
          </div>
          <Title tag='h3' variant='lg'>
            Обмен предложен
          </Title>
          <p>Теперь дождитесь подтверждения. Вам придёт уведомление.</p>
          <Button variant='primary' onClick={handleCloseSuccessModal}>
            Готово
          </Button>
        </div>
      </Modal>
    </section>
  );
};

export default SkillDetails;
