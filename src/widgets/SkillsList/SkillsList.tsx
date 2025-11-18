import { useMemo, type FC } from 'react';
import { SkillCard } from '../SkillCard/ui/SkillCard';
import type { GroupedSkills, SkillsListProps } from './types';
import styles from './SkillsList.module.css';
import fallbackAvatar from '../../shared/assets/images/avatars/avatar.jpg';
import type { Skill } from '@/entities/Skill/types';
import type { SkillProps } from '../SkillCard/ui/types';
import type { SkillCategory } from '@/shared/lib/constants';
import { Button } from '@/shared/ui/button/Button';

type SkillWithAuthor = Skill & {
  authorName?: string;
  authorCity?: string;
  authorAge?: number;
  authorAbout?: string;
  authorAvatarUrl?: string;
  userSkillId?: string;
};

export const SkillsList: FC<SkillsListProps> = ({
  skills,
  onToggleFavorite,
  onDetailsClick,
  moderation,
}) => {
  const deletingSet = useMemo(
    () => new Set(moderation?.deletingAuthorIds ?? []),
    [moderation?.deletingAuthorIds],
  );

  if (!skills.length) {
    return <p className={styles.emptyMessage}>Нет подходящих карточек</p>;
  }

  const resolveAvatar = (skill: SkillWithAuthor) =>
    skill.authorAvatarUrl || skill.imageUrl || fallbackAvatar;

  const groupedByAuthor = skills.reduce<Record<string, GroupedSkills>>(
    (acc, rawSkill) => {
      const skill = rawSkill as SkillWithAuthor;

      if (!acc[skill.authorId]) {
        acc[skill.authorId] = {
          authorId: skill.authorId,
          avatar: resolveAvatar(skill),
          name: skill.authorName || 'Имя не указано',
          city: skill.authorCity || 'Город не указан',
          age: typeof skill.authorAge === 'number' ? skill.authorAge : 0,
          about: skill.authorAbout ?? skill.description,
          canTeach: [],
          wantsToLearn: [],
          isFavorite: Boolean(skill.isFavorite),
        };
      }

      const group = acc[skill.authorId];

      if (skill.authorAvatarUrl) {
        group.avatar = skill.authorAvatarUrl;
      } else if (!group.avatar || group.avatar === fallbackAvatar) {
        group.avatar = skill.imageUrl || group.avatar;
      }
      if (skill.authorName) {
        group.name = skill.authorName;
      }
      if (skill.authorCity) {
        group.city = skill.authorCity;
      }
      if (typeof skill.authorAge === 'number') {
        group.age = skill.authorAge;
      }
      if (skill.authorAbout || skill.description) {
        group.about = skill.authorAbout ?? skill.description;
      }
      if (skill.isFavorite) {
        group.isFavorite = true;
      }

      if (skill.type === 'teach') {
        group.canTeach.push(skill);
      } else {
        group.wantsToLearn.push(skill);
      }

      return acc;
    },
    {},
  );

  const authorCards = Object.values(groupedByAuthor);

  const handleDetailsClick = (authorId: string) => {
    onDetailsClick?.(authorId);
  };

  const handleLikeClick = (authorId: string) => {
    onToggleFavorite(authorId);
  };

  const mapSkillToSkillProps = (skill: Skill): SkillProps => ({
    id: skill.id,
    name: skill.title,
    category: skill.category as SkillCategory,
  });

  return (
    <div className={styles.skillsList}>
      {authorCards.map((author) => {
        const mainSkill = author.canTeach[0] || author.wantsToLearn[0];

        if (!mainSkill) return null;

        const showModeration = Boolean(moderation?.enabled);
        const isDeleting = deletingSet.has(author.authorId);

        return (
          <div key={author.authorId} className={styles.cardWrapper}>
            <SkillCard
              author={{
                avatar: author.avatar,
                name: author.name,
                city: author.city,
                age: author.age,
                about: author.about,
              }}
              isLikeButtonVisible
              isDetailsButtonVisible
              skill={mapSkillToSkillProps(mainSkill)}
              skillsToLearn={author.wantsToLearn.map(mapSkillToSkillProps)}
              onDetailsButtonClick={() => handleDetailsClick(author.authorId)}
              onLikeButtonClick={() => handleLikeClick(author.authorId)}
              isExchangeOffered={false}
              isFavorite={Boolean(author.isFavorite)}
            />
            {showModeration && (
              <div className={styles.moderation}>
                <Button
                  variant='secondary'
                  className={styles.moderationButton}
                  onClick={() => moderation?.onDelete(author.authorId)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Удаляем…' : 'Удалить пользователя'}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
