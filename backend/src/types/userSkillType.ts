export const USER_SKILL_TYPES = ['teach', 'learn'] as const;

export type UserSkillType = (typeof USER_SKILL_TYPES)[number];

export const USER_SKILL_TYPE = {
  teach: 'teach',
  learn: 'learn'
} as const satisfies Record<UserSkillType, UserSkillType>;

export const isUserSkillType = (value: unknown): value is UserSkillType =>
  typeof value === 'string' &&
  USER_SKILL_TYPES.includes(value as UserSkillType);
