import { SkillCard } from '../SkillCard/ui/SkillCard';
import type { GroupedSkills, SkillsListProps } from './types';
import styles from './SkillsList.module.css';
import avatar from '../../shared/assets/images/avatars/avatar.jpg';
import type { Skill } from '@/entities/Skill/types';
import type { SkillProps } from '../SkillCard/ui/types';

type SkillWithAuthor = Skill & {
  authorName?: string;
  authorCity?: string;
  authorAge?: number;
  authorAbout?: string;
};

export const SkillsList: React.FC<SkillsListProps> = ({
  skills,
  onToggleFavorite,
  onDetailsClick,
}) => {
  if (!skills.length) {
    return <p className={styles.emptyMessage}>Ничего не найдено</p>;
  }

  const groupedByAuthor = skills.reduce<Record<number, GroupedSkills>>(
    (acc, rawSkill) => {
      const skill = rawSkill as SkillWithAuthor;

      if (!acc[skill.authorId]) {
        acc[skill.authorId] = {
          authorId: skill.authorId,
          avatar: skill.imageUrl || avatar,
          name: skill.authorName || 'Имя не указано',
          city: skill.authorCity || 'Город не указан',
          age: typeof skill.authorAge === 'number' ? skill.authorAge : 0,
          about: skill.authorAbout ?? skill.description,
          canTeach: [],
          wantsToLearn: [],
        };
      }

      const group = acc[skill.authorId];

      if (skill.imageUrl) {
        group.avatar = skill.imageUrl;
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

  const handleDetailsClick = (skillId: number) => {
    if (onDetailsClick) {
      onDetailsClick(skillId);
    }
  };

  const handleLikeClick = (skillId: number) => {
    onToggleFavorite(skillId);
  };

  const mapSkillToSkillProps = (skill: Skill): SkillProps => ({
    id: parseInt(skill.id, 10),
    name: skill.title,
    category: skill.category as any,
  });

  return (
    <div className={styles.skillsList}>
      {authorCards.map((author) => {
        const mainSkill = author.canTeach[0] || author.wantsToLearn[0];

        if (!mainSkill) return null;

        return (
          <SkillCard
            key={author.authorId}
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
          />
        );
      })}
    </div>
  );
};
