type SkillItem = {
  id: number;
  name: string;
};

type SkillGroupLike = {
  skills?: SkillItem[];
  subskills?: SkillItem[];
};

const resolveSkills = (group: SkillGroupLike): SkillItem[] =>
  group.skills ?? group.subskills ?? [];

export const getSubskillNameMap = (
  allCategories: SkillGroupLike[] = []
): Map<number, string> => {
  const subskillMap = new Map<number, string>();
  for (const cat of allCategories) {
    for (const sub of resolveSkills(cat)) {
      subskillMap.set(sub.id, sub.name);
    }
  }
  return subskillMap;
};
