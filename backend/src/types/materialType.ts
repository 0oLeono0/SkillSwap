export const MATERIAL_TYPE = {
  theory: 'theory',
  practice: 'practice',
  testing: 'testing'
} as const;

export type MaterialType = (typeof MATERIAL_TYPE)[keyof typeof MATERIAL_TYPE];

export const MATERIAL_TYPES = Object.values(MATERIAL_TYPE) as MaterialType[];

export const isMaterialType = (value: unknown): value is MaterialType =>
  typeof value === 'string' && MATERIAL_TYPES.includes(value as MaterialType);
