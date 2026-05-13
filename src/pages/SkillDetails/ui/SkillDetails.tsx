import { useCallback, useMemo, type ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './skillDetails.module.scss';
import { ROUTES } from '@/shared/constants';
import stock1 from '@/shared/assets/images/stock/stock.jpg';
import stock2 from '@/shared/assets/images/stock/stock2.jpg';
import stock3 from '@/shared/assets/images/stock/stock3.jpg';
import stock4 from '@/shared/assets/images/stock/stock4.jpg';
import { useUserRatings } from '@/entities/User/model/useUserRatings';
import { useSkillDetailsActions } from '../model/useSkillDetailsActions';
import { useSkillDetailsData } from '../model/useSkillDetailsData';
import { useSkillDetailsMaterials } from '../model/useSkillDetailsMaterials';
import { useSkillDetailsRelatedAuthors } from '../model/useSkillDetailsRelatedAuthors';
import { AuthorCard } from './AuthorCard';
import { MaterialsSection } from './MaterialsSection';
import { RelatedSkillsSection } from './RelatedSkillsSection';
import { ReviewsSection } from './ReviewsSection';
import { SkillDetailsModals } from './SkillDetailsModals';
import { SkillOverviewCard } from './SkillOverviewCard';

const LATEST_REVIEWS_LIMIT = 3;

const GALLERY_IMAGES = [stock1, stock2, stock3, stock4];

const SkillDetails = (): ReactElement => {
  const { authorId: authorIdParam } = useParams();
  const authorId = authorIdParam ?? '';
  const navigate = useNavigate();
  const {
    ratings: authorRatings,
    averageRating,
    ratingsCount,
    isLoading: isRatingsLoading,
    error: ratingsError
  } = useUserRatings(authorId);

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

  const {
    isFavorite,
    isCurrentAuthorFavorite,
    favoriteButtonLabel,
    isAuthModalOpen,
    isSuccessModalOpen,
    proposeButtonLabel,
    proposeButtonStyle,
    handleToggleFavorite,
    handleAuthorFavoriteClick,
    handleProposeExchange,
    handleCloseAuthModal,
    handleCloseSuccessModal,
    handleLoginRedirect,
    handleRegisterRedirect
  } = useSkillDetailsActions({
    authorId,
    currentAuthor,
    selectedSkill,
    selectedSkillId
  });

  const { materials, materialsByType, isMaterialsLoading, materialsError } =
    useSkillDetailsMaterials({
      userSkillId: selectedSkill?.userSkillId
    });

  const { relatedAuthors } = useSkillDetailsRelatedAuthors({
    authorId,
    selectedSkill,
    isFavorite
  });

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

  const handleDetailsClick = useCallback(
    (targetAuthorId: string) => {
      navigate(ROUTES.SKILL_DETAILS.replace(':authorId', targetAuthorId));
    },
    [navigate]
  );

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
          proposeButtonStyle={proposeButtonStyle}
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
        authors={relatedAuthors}
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
