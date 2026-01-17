import { useMemo, type FC } from 'react';
import { SkillCard } from '../SkillCard/ui/SkillCard';
import type {
  SkillsListAuthor,
  SkillsListProps,
  SkillsListSkill
} from './types';
import styles from './SkillsList.module.css';
import fallbackAvatar from '../../shared/assets/images/avatars/avatar.jpg';
import type { SkillProps } from '../SkillCard/ui/types';
import type { SkillCategory } from '@/shared/lib/constants';
import { Button } from '@/shared/ui/button/Button';

const resolveSkillImage = (skills: SkillsListSkill[]) =>
  skills.find((skill) => Boolean(skill.imageUrl))?.imageUrl;

const resolveAvatar = (author: SkillsListAuthor) =>
  author.avatarUrl ||
  resolveSkillImage(author.canTeach) ||
  resolveSkillImage(author.wantsToLearn) ||
  fallbackAvatar;

export const SkillsList: FC<SkillsListProps> = ({
  authors,
  onToggleFavorite,
  onDetailsClick,
  moderation
}) => {
  const deletingSet = useMemo(
    () => new Set(moderation?.deletingAuthorIds ?? []),
    [moderation?.deletingAuthorIds]
  );

  if (!authors.length) {
    return <p className={styles.emptyMessage}>Нет подходящих карточек</p>;
  }

  const handleDetailsClick = (authorId: string) => {
    onDetailsClick?.(authorId);
  };

  const handleLikeClick = (authorId: string) => {
    onToggleFavorite(authorId);
  };

  const mapSkillToSkillProps = (skill: SkillsListSkill): SkillProps => ({
    id: skill.id,
    name: skill.title,
    category: skill.category as SkillCategory
  });

  return (
    <div className={styles.skillsList}>
      {authors.map((author) => {
        const mainSkill = author.canTeach[0] || author.wantsToLearn[0];

        if (!mainSkill) return null;

        const showModeration = Boolean(moderation?.enabled);
        const isDeleting = deletingSet.has(author.id);
        const about = author.about ?? mainSkill.description;

        return (
          <div key={author.id} className={styles.cardWrapper}>
            <SkillCard
              author={{
                avatar: resolveAvatar(author),
                name: author.name || 'Имя не указано',
                city: author.city || 'Город не указан',
                age: typeof author.age === 'number' ? author.age : 0,
                about
              }}
              isLikeButtonVisible
              isDetailsButtonVisible
              skill={mapSkillToSkillProps(mainSkill)}
              skillsToLearn={author.wantsToLearn.map(mapSkillToSkillProps)}
              onDetailsButtonClick={() => handleDetailsClick(author.id)}
              onLikeButtonClick={() => handleLikeClick(author.id)}
              isExchangeOffered={false}
              isFavorite={Boolean(author.isFavorite)}
            />
            {showModeration && (
              <div className={styles.moderation}>
                <Button
                  variant='secondary'
                  className={styles.moderationButton}
                  onClick={() => moderation?.onDelete(author.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Удаляем:' : 'Удалить пользователя'}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
