import { SkillCard } from '../SkillCard/ui/SkillCard';
import type { GroupedSkills, SkillsListProps } from './types';
import styles from './SkillsList.module.css';
import avatar from '../../shared/assets/images/avatars/avatar.jpg'
import type { Skill } from '@/entities/Skill/types';
import type { SkillProps } from '../SkillCard/ui/types';

export const SkillsList: React.FC<SkillsListProps> = ({ 
  skills, 
  onToggleFavorite,
  onDetailsClick 
}) => {
  if (!skills.length) {
    return (
        <p className={styles.emptyMessage}>Нет навыков</p>
    );
  }

  const groupedByAuthor = skills.reduce<Record<number, GroupedSkills>>((acc, skill) => {
    if (!acc[skill.authorId]) {
      acc[skill.authorId] = {
        authorId: skill.authorId,
        avatar: skill.imageUrl || avatar,
        name: 'Пользователь', // Нужно будет подтягивать имя пользователя
        city: 'Город', // Так же город
        age: 25, // Так же возраст
        about: skill.description,
        canTeach: [],
        wantsToLearn: [],
      };
    }

    if (skill.type === 'teach') {
      acc[skill.authorId].canTeach.push(skill);
    } else {
      acc[skill.authorId].wantsToLearn.push(skill);
    }

    return acc;
  }, {});

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
    id: parseInt(skill.id),
    name: skill.title,
    category: skill.category as any,
  });

  return (
    <div className={styles.skillsList}>
      {authorCards.map(author => {
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
              about: author.about
            }}
            isLikeButtonVisible={true}
            isDetailsButtonVisible={true}
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
