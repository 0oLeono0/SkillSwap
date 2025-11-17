import { db } from '@/api/mockData';
import type { Skill } from '../Skill/types';
import type { User, UserCard, UserSkill } from '../User/types';
import { getUserAge, getUserCity } from '../User/utils';
import type { FiltersState } from './types';

const getSkillNameById = (id: number): string => {
  const category = db.skills.find((cat) =>
    cat.subskills.some((sub) => sub.id === id),
  );
  if (!category) {
    return '';
  }
  return category.subskills.find((sub) => sub.id === id)?.name ?? '';
};

const mapUserSkillsToNames = (skills: UserSkill[]): string[] =>
  skills
    .map((skill) => {
      if (typeof skill.subcategoryId === 'number') {
        const name = getSkillNameById(skill.subcategoryId);
        return name || skill.title;
      }
      return skill.title;
    })
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

export const applyFilters = (
  skills: Skill[],
  users: User[],
  filters: FiltersState
): UserCard[] => {
  const userMap = new Map(users.map((u) => [u.id, u]));

  const filteredUsers = users.filter((user) => {
    const userSkills = skills.filter((skill) => {
      const author = userMap.get(skill.authorId);
      return author && author.id === user.id;
    });

    if (
      filters.skillIds.length &&
      !userSkills.some((skill) =>
        filters.skillIds.includes(parseInt(skill.id, 10))
      )
    )
      return false;
    if (
      filters.cityIds.length &&
      !(typeof user.cityId === 'number' && filters.cityIds.includes(user.cityId))
    )
      return false;
    if (filters.gender !== 'any' && user.gender !== filters.gender)
      return false;

    if (filters.mode === 'want_to_learn') {
      return userSkills.some((skill) => skill.type === 'teach');
    } else if (filters.mode === 'can_teach') {
      return userSkills.some((skill) => skill.type === 'learn');
    }

    return true;
  });

  return filteredUsers.map((user) => ({
    id: user.id,
    name: user.name,
    age: getUserAge(user),
    city: getUserCity(user),
    avatarUrl: user.avatarUrl ?? '',
    bio: user.bio,
    teachSkills: mapUserSkillsToNames(user.teachableSkills),
    learnSkills: mapUserSkillsToNames(user.learningSkills),
  }));
};
