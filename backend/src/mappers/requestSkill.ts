import {
  isUserSkillType,
  USER_SKILL_TYPE,
  type UserSkillType
} from '../types/userSkillType.js';

export interface RequestSkillInfo {
  id: string | null;
  title: string;
  type: UserSkillType;
  subcategoryId: number | null;
  categoryId: number | null;
}

export interface RequestSkillRecord {
  userSkillId: string | null;
  skillTitle: string;
  skillType: string;
  skillSubcategoryId: number | null;
  skillCategoryId: number | null;
  userSkill?: {
    id: string;
    title: string;
    type: string;
    subcategoryId: number | null;
    categoryId: number | null;
  } | null;
}

const resolveSkillType = (value: unknown): UserSkillType =>
  isUserSkillType(value) ? value : USER_SKILL_TYPE.teach;

export const mapRequestSkill = (
  request: RequestSkillRecord
): RequestSkillInfo => {
  const skillTitle =
    request.userSkill?.title?.trim() || request.skillTitle?.trim() || '';
  const type = resolveSkillType(request.userSkill?.type ?? request.skillType);

  return {
    id: request.userSkill?.id ?? request.userSkillId ?? null,
    title: skillTitle,
    type,
    subcategoryId:
      request.userSkill?.subcategoryId ?? request.skillSubcategoryId ?? null,
    categoryId: request.userSkill?.categoryId ?? request.skillCategoryId ?? null
  };
};
