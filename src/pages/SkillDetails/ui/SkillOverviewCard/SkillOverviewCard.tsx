import type { ReactElement } from 'react';
import styles from './SkillOverviewCard.module.scss';
import GalleryIcon from '@/shared/assets/icons/actions/like.svg?react';
import MoreIcon from '@/shared/assets/icons/actions/more-square.svg?react';
import ShareIcon from '@/shared/assets/icons/actions/share.svg?react';
import { Button } from '@/shared/ui/button/Button';
import { Title } from '@/shared/ui/Title';
import { getFavoriteButtonClassName } from './SkillOverviewCard.logic';
import type { SkillOverviewCardProps } from './SkillOverviewCard.types';

export const SkillOverviewCard = ({
  selectedSkill,
  skillDescription,
  galleryImages,
  isFavorite,
  favoriteButtonLabel,
  isFavoriteDisabled,
  proposeButtonLabel,
  proposeButtonStyle,
  onFavoriteClick,
  onProposeExchange
}: SkillOverviewCardProps): ReactElement => {
  const favoriteButtonClassName = getFavoriteButtonClassName({
    isFavorite,
    actionButtonClassName: styles.actionButton,
    activeClassName: styles.actionButtonActive
  });

  return (
    <article className={styles.skillCard}>
      <div className={styles.skillHeader}>
        <div className={styles.actions}>
          <button
            type='button'
            className={favoriteButtonClassName}
            onClick={onFavoriteClick}
            aria-label={favoriteButtonLabel}
            aria-pressed={isFavorite}
            disabled={isFavoriteDisabled}
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
          <p className={styles.skillDescription}>{skillDescription}</p>
          <Button
            variant='primary'
            onClick={onProposeExchange}
            style={proposeButtonStyle}
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
                key={`${image}-${index}`}
                src={image}
                alt={`${selectedSkill.title} ${index + 2}`}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};
