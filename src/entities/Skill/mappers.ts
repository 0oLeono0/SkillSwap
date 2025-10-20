import type { ApiSkillCategory } from '@/api/types';
import { db } from '@/api/mockData';

export const getSubskillNameMap = (
  allCategories: ApiSkillCategory[] = db.skills
): Map<number, string> => {
  const subskillMap = new Map<number, string>();
  for (const cat of allCategories) {
    for (const sub of cat.subskills) {
      subskillMap.set(sub.id, sub.name);
    }
  }
  return subskillMap;
};
