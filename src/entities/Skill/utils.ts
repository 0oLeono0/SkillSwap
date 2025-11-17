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
    .map((skill) => {
      if (typeof skill.subcategoryId === 'number') {
        const resolved = getSubskillName(skill.subcategoryId);
        return resolved || skill.title;
      }
      return skill.title;
    })
    .map((name) => name.trim())
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
