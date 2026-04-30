import { MATERIAL_TYPES } from '@skillswap/contracts/materials';
import type { MaterialType as ContractMaterialType } from '@skillswap/contracts/materials';

export { MATERIAL_TYPES };

export type MaterialType = ContractMaterialType;

const [theory, practice, testing] = MATERIAL_TYPES;

export const MATERIAL_TYPE = {
  theory,
  practice,
  testing
} as const satisfies Record<MaterialType, MaterialType>;

export const isMaterialType = (value: unknown): value is MaterialType =>
  typeof value === 'string' && MATERIAL_TYPES.includes(value as MaterialType);
