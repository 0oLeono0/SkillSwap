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
  type CatalogAuthor
} from '@/pages/Catalog/model/catalogData';
import { useAuth } from '@/app/providers/auth';

import { useFavorites } from '@/app/providers/favorites';
import { createRequest } from '@/features/requests/model/actions';
import { ROUTES } from '@/shared/constants';
import stock1 from '@/shared/assets/images/stock/stock.jpg';
import stock2 from '@/shared/assets/images/stock/stock2.jpg';
import stock3 from '@/shared/assets/images/stock/stock3.jpg';
import stock4 from '@/shared/assets/images/stock/stock4.jpg';
import { useAuthEntryNavigation } from '@/shared/lib/router/useAuthEntryNavigation';
import { useUserRatings } from '@/entities/User/model/useUserRatings';
import { useSkillDetailsData } from '../model/useSkillDetailsData';
import { useSkillDetailsMaterials } from '../model/useSkillDetailsMaterials';
import { AuthorCard } from './AuthorCard';
import { MaterialsSection } from './MaterialsSection';
import { RelatedSkillsSection } from './RelatedSkillsSection';
import { ReviewsSection } from './ReviewsSection';
import { SkillDetailsModals } from './SkillDetailsModals';
import { SkillOverviewCard } from './SkillOverviewCard';

const RELATED_AUTHORS_LIMIT = 4;
const LATEST_REVIEWS_LIMIT = 3;

const GALLERY_IMAGES = [stock1, stock2, stock3, stock4];

const SkillDetails = (): ReactElement => {
  const { authorId: authorIdParam } = useParams();
  const authorId = authorIdParam ?? '';
  const navigate = useNavigate();
  const { navigateToLogin, navigateToRegister } = useAuthEntryNavigation();
  const { isAuthenticated, user, accessToken } = useAuth();
  const {
    ratings: authorRatings,
    averageRating,
    ratingsCount,
    isLoading: isRatingsLoading,
    error: ratingsError
  } = useUserRatings(authorId);

  const { toggleFavorite, isFavorite } = useFavorites();

  const {
    currentAuthor,
    authorInfo,
    teachSkills,
    learnSkills,
    selectedSkill,
    selectedSkillId,
    setSelectedSkillId,
    isLoading,
    error
  } = useSkillDetailsData({ authorId });

  const { materials, materialsByType, isMaterialsLoading, materialsError } =
    useSkillDetailsMaterials({
      userSkillId: selectedSkill?.userSkillId
    });

  const [relatedAuthors, setRelatedAuthors] = useState<CatalogAuthor[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isProposalSent, setIsProposalSent] = useState(false);

  useEffect(() => {
    setIsProposalSent(false);
    setIsSuccessModalOpen(false);
  }, [selectedSkillId, authorId]);

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

  const latestRatings = useMemo(
    () => authorRatings.slice(0, LATEST_REVIEWS_LIMIT),
    [authorRatings]
  );

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
    if (isAuthenticated) {
      if (authorId) {
        handleToggleFavorite(authorId);
      }
    } else {
      setIsAuthModalOpen(true);
    }
  }, [authorId, handleToggleFavorite, isAuthenticated]);

  const isCurrentAuthorFavorite = useMemo(
    () => (authorId ? isFavorite(authorId) : false),
    [authorId, isFavorite]
  );

  const favoriteButtonLabel = isCurrentAuthorFavorite
    ? 'Убрать из избранного'
    : 'Добавить в избранное';

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
    navigateToLogin();
  }, [navigateToLogin]);

  const handleRegisterRedirect = useCallback(() => {
    setIsAuthModalOpen(false);
    navigateToRegister();
  }, [navigateToRegister]);

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

  const skillDescription = selectedSkill.description.trim()
    ? selectedSkill.description
    : 'Привет! Я увлекаюсь этим навыком уже больше 10 лет — от первых занятий дома до выступлений на сцене. Научу вас основам, поделюсь любимыми техниками и помогу уверенно чувствовать себя даже без подготовки.';

  const authorBio = authorInfo.bio?.trim() || skillDescription;
  const authorStatus = authorInfo.status;

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
        <AuthorCard
          authorInfo={authorInfo}
          authorBio={authorBio}
          authorStatus={authorStatus}
          avatarFallback={selectedSkill.imageUrl || galleryImages[0]}
          teachSkills={teachSkills}
          learnSkills={learnSkills}
          selectedSkillId={selectedSkill.id}
          isRatingsLoading={isRatingsLoading}
          ratingsError={ratingsError}
          ratingsCount={ratingsCount}
          averageRating={averageRating}
          onSelectSkill={setSelectedSkillId}
        />

        <SkillOverviewCard
          selectedSkill={selectedSkill}
          skillDescription={skillDescription}
          galleryImages={galleryImages}
          isFavorite={isCurrentAuthorFavorite}
          favoriteButtonLabel={favoriteButtonLabel}
          isFavoriteDisabled={!authorId}
          proposeButtonLabel={proposeButtonLabel}
          proposeButtonStyle={proposeButtonInlineStyle}
          onFavoriteClick={handleAuthorFavoriteClick}
          onProposeExchange={handleProposeExchange}
        />
      </div>

      <MaterialsSection
        isLoading={isMaterialsLoading}
        error={materialsError}
        materialsCount={materials.length}
        materialGroups={materialsByType}
      />

      <ReviewsSection
        latestRatings={latestRatings}
        isLoading={isRatingsLoading}
        error={ratingsError}
        ratingsCount={ratingsCount}
        averageRating={averageRating}
      />

      <RelatedSkillsSection
        authors={relatedAuthorsWithFavorites}
        onToggleFavorite={handleToggleFavorite}
        onDetailsClick={handleDetailsClick}
      />

      <SkillDetailsModals
        isAuthModalOpen={isAuthModalOpen}
        isSuccessModalOpen={isSuccessModalOpen}
        onCloseAuthModal={handleCloseAuthModal}
        onCloseSuccessModal={handleCloseSuccessModal}
        onLoginRedirect={handleLoginRedirect}
        onRegisterRedirect={handleRegisterRedirect}
      />
    </section>
  );
};

export default SkillDetails;
