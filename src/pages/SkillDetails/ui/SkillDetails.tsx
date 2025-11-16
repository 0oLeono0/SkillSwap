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
  loadCatalogBaseData,
  type CatalogSkill
} from '@/pages/Catalog/model/catalogData';
import { useAuth } from '@/app/providers/auth';

import { useFavorites } from '@/app/providers/favorites';
import { createRequest } from '@/features/requests/model/actions';
import type { User } from '@/entities/User/types';
import { Button } from '@/shared/ui/button/Button';
import { Tag } from '@/shared/ui/Tag/Tag';
import { Title } from '@/shared/ui/Title';
import { Modal } from '@/shared/ui/Modal/Modal';
import { ROUTES } from '@/shared/constants';
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

const collectAuthorSkills = (
  source: CatalogSkill[],
  authorIds: Set<string>,
) => source.filter((skill) => authorIds.has(skill.authorId));

const GALLERY_IMAGES = [stock1, stock2, stock3, stock4];

const SkillDetails = (): ReactElement => {
  const { authorId: authorIdParam } = useParams();
  const authorId = authorIdParam ?? '';
  const navigate = useNavigate();
  const { isAuthenticated, user, accessToken } = useAuth();

  const { toggleFavorite, isFavorite } = useFavorites();

  const [skills, setSkills] = useState<CatalogSkill[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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
        const data = await loadCatalogBaseData();
        if (!isMounted) return;
        setSkills(data.skills);
        setUsers(data.users);
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

  const author = useMemo(
    () => users.find((user) => user.id === authorId) ?? null,
    [users, authorId]
  );

  const authorSkills = useMemo(
    () => skills.filter((skill) => skill.authorId === authorId),
    [skills, authorId]
  );

  const teachSkills = useMemo(
    () => authorSkills.filter((skill) => skill.type === 'teach'),
    [authorSkills]
  );

  const learnSkills = useMemo(
    () => authorSkills.filter((skill) => skill.type === 'learn'),
    [authorSkills]
  );

  useEffect(() => {
    if (teachSkills.length && !selectedSkillId) {
      setSelectedSkillId(teachSkills[0].id);
    }
  }, [teachSkills, selectedSkillId]);

  const selectedSkill = useMemo(
    () =>
      teachSkills.find((skill) => skill.id === selectedSkillId) ??
      teachSkills[0] ??
      null,
    [teachSkills, selectedSkillId]
  );

  const relatedSkills = useMemo(() => {
    if (!selectedSkill) return [];

    const selectedAuthors = new Set<string>();
    for (const skill of skills) {
      if (
        skill.category !== selectedSkill.category ||
        skill.type !== 'teach' ||
        skill.authorId === authorId
      ) {
        continue;
      }

      if (
        selectedAuthors.size >= RELATED_AUTHORS_LIMIT &&
        !selectedAuthors.has(skill.authorId)
      ) {
        continue;
      }

      selectedAuthors.add(skill.authorId);
    }

    if (selectedAuthors.size === 0) {
      return [];
    }

    return collectAuthorSkills(skills, selectedAuthors);
  }, [skills, selectedSkill, authorId]);

  const relatedSkillsWithFavorites = useMemo(
    () =>
      relatedSkills.map((skill) => {
        const shouldBeFavorite = isFavorite(skill.authorId);
        if (skill.isFavorite === shouldBeFavorite) {
          return skill;
        }
        return { ...skill, isFavorite: shouldBeFavorite };
      }),
    [relatedSkills, isFavorite],
  );
  const handleToggleFavorite = useCallback(
    (targetAuthorId: string) => {
      toggleFavorite(targetAuthorId);
    },
    [toggleFavorite],
  );

  const handleAuthorFavoriteClick = useCallback(() => {
    if (authorId) {
      handleToggleFavorite(authorId);
    }
  }, [authorId, handleToggleFavorite]);

  const isCurrentAuthorFavorite = useMemo(
    () => (authorId ? isFavorite(authorId) : false),
    [authorId, isFavorite],
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
    if (!selectedSkill) {
      return;
    }

    if (!isAuthenticated || !user || !accessToken) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await createRequest(accessToken, {
        toUserId: selectedSkill.authorId,
        skillId: selectedSkill.id,
      });
      setIsProposalSent(true);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('[SkillDetails] Failed to create request', err);
    }
  }, [accessToken, isAuthenticated, selectedSkill, user]);

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

  if (error || !author || !selectedSkill) {
    return (
      <div className={styles.stateError}>
        {error ?? 'Навык не найден или был удалён'}
      </div>
    );
  }

  const placeholderDescription =
    'Привет! Я увлекаюсь этим навыком уже больше 10 лет — от первых занятий дома до выступлений на сцене. Научу вас основам, поделюсь любимыми техниками и помогу уверенно чувствовать себя даже без подготовки.';

  const galleryImages = GALLERY_IMAGES;
  const proposeButtonLabel = isProposalSent ? 'Обмен предложен' : 'Предложить обмен';
  const proposeButtonInlineStyle = isProposalSent
    ? {
        backgroundColor: '#fff',
        color: '#000',
        borderColor: 'var(--button-color-accent)',
      }
    : undefined;

  return (
    <section className={styles.skillDetails}>
      <div className={styles.hero}>
        <article className={styles.authorCard}>
          <div className={styles.authorInfo}>
            <img
              className={styles.authorAvatar}
              src={selectedSkill.imageUrl || author.avatarUrl}
              alt={author.name}
            />
            <div>
              <Title tag='h2' variant='lg'>
                {author.name}
              </Title>
              <p className={styles.authorMeta}>
                {selectedSkill.authorCity}, {selectedSkill.authorAge} лет
              </p>
            </div>
          </div>
          <p className={styles.authorBio}>
            {selectedSkill.authorAbout ?? author.bio}
          </p>

          <div className={styles.authorSkills}>
            <span>Может научить:</span>
            <div className={styles.tags}>
              {teachSkills.map((skill) => (
                <Tag key={skill.id} category={skill.category}>
                  {skill.title}
                </Tag>
              ))}
            </div>
          </div>

          <div className={styles.authorSkills}>
            <span>Хочет научиться:</span>
            <div className={styles.tags}>
              {learnSkills.map((skill) => (
                <Tag key={skill.id} category={skill.category}>
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
              <button type='button' aria-label='??????????'>
                <ShareIcon />
              </button>
              <button type='button' aria-label='?????????? ??????'>
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
        {relatedSkills.length ? (
          <SkillsList
            skills={relatedSkillsWithFavorites}
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





