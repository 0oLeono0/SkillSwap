import type { Skill } from './types';
import type { User } from '../User/types';
import { getUserAge, getUserName, getUserCity } from '../User/utils';

export const mapSkillToCard = (
  skill: Skill,
  user: User,
  subskillMap: Map<number, string>,
  mode: 'all' | 'want_to_learn' | 'can_teach'
) => {
  const typeMap = {
    want_to_learn: 'teach',
    can_teach: 'learn',
    all: skill.type
  } as const;

  const primaryType = typeMap[mode];
  const primarySkill = skill.title;

  const getSubskillName = (id: number): string => subskillMap.get(id) ?? '';

  const otherSkills = (
    primaryType === 'teach' ? user.learningSkills : user.teachableSkills
  )
    .map(getSubskillName)
    .filter(Boolean);

  return {
    id: skill.id,
    authorName: getUserName(user),
    authorAge: getUserAge(user),
    authorCity: getUserCity(user),
    primaryType,
    primarySkill,
    otherSkills
  };
};
