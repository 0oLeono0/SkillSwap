import type { UserSkill } from '@/entities/User/types';
import type { ApiUserSkill } from '@/shared/api/auth';

const FALLBACK_TITLE = 'Без названия';
const FALLBACK_DESCRIPTION = 'Описание появится позже.';

export const sanitizeSkillsForSubmit = (
  skills: UserSkill[],
  subskillToCategory: Map<number, number>,
  subskillNameMap: Map<number, string>
): ApiUserSkill[] =>
  skills.map((skill) => {
    const fallbackCategory =
      typeof skill.subcategoryId === 'number'
        ? (subskillToCategory.get(skill.subcategoryId) ?? null)
        : null;
    const trimmedTitle = skill.title.trim();
    const fallbackTitle =
      typeof skill.subcategoryId === 'number'
        ? (subskillNameMap.get(skill.subcategoryId) ?? '')
        : '';
    const safeTitle =
      trimmedTitle.length >= 2
        ? trimmedTitle
        : fallbackTitle.length >= 2
          ? fallbackTitle
          : FALLBACK_TITLE;
    const trimmedDescription = skill.description.trim();
    const safeDescription =
      trimmedDescription.length > 0 ? trimmedDescription : FALLBACK_DESCRIPTION;

    return {
      id: skill.id,
      title: safeTitle,
      categoryId:
        typeof skill.categoryId === 'number'
          ? skill.categoryId
          : (fallbackCategory ?? null),
      subcategoryId:
        typeof skill.subcategoryId === 'number' ? skill.subcategoryId : null,
      description: safeDescription,
      imageUrls: skill.imageUrls
        .map((url) => url.trim())
        .filter((url) => url.length > 0)
    };
  });

export const serializeSkills = (
  skills: UserSkill[],
  subskillToCategory: Map<number, number>,
  subskillNameMap: Map<number, string>
) =>
  JSON.stringify(
    sanitizeSkillsForSubmit(skills, subskillToCategory, subskillNameMap)
      .map((skill) => ({
        ...skill,
        id: typeof skill.id === 'string' ? skill.id : '',
        imageUrls: [...(skill.imageUrls ?? [])]
      }))
      .sort((a, b) => a.id.localeCompare(b.id))
  );
