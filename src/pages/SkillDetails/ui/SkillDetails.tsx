import { useCallback, type ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './skillDetails.module.scss';
import { ROUTES } from '@/shared/constants';
import { useUserRatings } from '@/entities/User/model/useUserRatings';
import { useSkillDetailsActions } from '../model/useSkillDetailsActions';
import { useSkillDetailsData } from '../model/useSkillDetailsData';
import { useSkillDetailsMaterials } from '../model/useSkillDetailsMaterials';
import { useSkillDetailsRelatedAuthors } from '../model/useSkillDetailsRelatedAuthors';
import { useSkillDetailsViewModel } from '../model/useSkillDetailsViewModel';
import { AuthorCard } from './AuthorCard';
import { MaterialsSection } from './MaterialsSection';
import { RelatedSkillsSection } from './RelatedSkillsSection';
import { ReviewsSection } from './ReviewsSection';
import { SkillDetailsModals } from './SkillDetailsModals';
import { SkillOverviewCard } from './SkillOverviewCard';

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

  const {
    galleryImages,
    latestRatings,
    skillDescription,
    authorBio,
    authorStatus
  } = useSkillDetailsViewModel({
    authorInfo,
    selectedSkill,
    authorRatings
  });

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
