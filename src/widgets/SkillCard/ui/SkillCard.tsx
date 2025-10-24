import React from 'react';
import styles from './SkillCard.module.css';
import type { SkillCardProps, SkillProps } from '@/widgets/SkillCard/ui/types.ts';
import LikeIcon from '@/shared/assets/icons/actions/like.svg?react';
import ClockIcon from '@/shared/assets/icons/content/clock.svg?react';
import { ageToString } from '@/shared/lib/helpers.ts';
import { Button } from '@/shared/ui/button/Button.tsx';
import { Tag } from '@/shared/ui/Tag/Tag.tsx';

export const SkillCard: React.FC<SkillCardProps> = (props: SkillCardProps) => {
  const {
    author,
    isLikeButtonVisible,
    isDetailsButtonVisible,
    skill,
    skillsToLearn,
    onDetailsButtonClick,
    onLikeButtonClick,
    isExchangeOffered
  } = props;

  const exchangeOfferedIcon = {
    icon: <ClockIcon />,
    show: isExchangeOffered
  };

  const buttonText = isExchangeOffered ? 'Обмен предложен' : 'Подробнее';

  return (
    <div className={styles.card}>
      <div className={styles.author}>
        <img src={author.avatar} alt={author.name} className={styles.avatar} />
        <div className={styles.authorDetailsLayout}>
          <span className={styles.authorName}>{author.name}</span>
          <span className={styles.authorDetails}>{author.city}, {ageToString(author.age)}</span>
          <span className={styles.likeButton}>
            {isLikeButtonVisible && (<LikeIcon onClick={()=>onLikeButtonClick(skill.id)}/>)}
            {/*//TODO Добавить реальный UI компонент LikeButton*/}
          </span>
        </div>
      </div>
      <div className={styles.skills}>
        <div className={styles.tags}>
          <span className={styles.tagTitle}>Может научить:</span>
          <div className={styles.tagList}>
            <Tag category={skill.category}> {skill.name}</Tag>
          </div>
        </div>
        <div className={styles.tags}>
          <span className={styles.tagTitle}>Хочет научиться:</span>
          <div className={styles.tagList}>
            {skillsToLearn.slice(0, 2).map((skill: SkillProps) => (
              <Tag key={skill.id} category={skill.category}>{skill.name}</Tag>
            ))}

            {skillsToLearn.length > 2 && (
              <Tag >+{skillsToLearn.length - 2}</Tag>
            )}
          </div>
        </div>
      </div>
      {
        isDetailsButtonVisible && (
          <Button
            onClick={() => onDetailsButtonClick(skill.id)}
            variant={isExchangeOffered ? 'secondary' : 'primary'}
            leftIcon={exchangeOfferedIcon}
          >
            {buttonText}
          </Button>)
      }
    </div>
  );
};