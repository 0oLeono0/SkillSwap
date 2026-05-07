import {
  MATERIAL_TYPES,
  TEST_QUESTION_TYPES
} from '@skillswap/contracts/materials';
import type {
  MaterialType as ContractMaterialType,
  TestQuestionType as ContractTestQuestionType
} from '@skillswap/contracts/materials';

export { MATERIAL_TYPES, TEST_QUESTION_TYPES };

export type MaterialType = ContractMaterialType;
export type TestQuestionType = ContractTestQuestionType;

const [theory, practice, testing] = MATERIAL_TYPES;

export const MATERIAL_TYPE = {
  theory,
  practice,
  testing
} as const satisfies Record<MaterialType, MaterialType>;

export const isMaterialType = (value: unknown): value is MaterialType =>
  typeof value === 'string' && MATERIAL_TYPES.includes(value as MaterialType);

const [single, multiple, text, gap, image] = TEST_QUESTION_TYPES;

export const TEST_QUESTION_TYPE = {
  single,
  multiple,
  text,
  gap,
  image
} as const satisfies Record<TestQuestionType, TestQuestionType>;

export const isTestQuestionType = (value: unknown): value is TestQuestionType =>
  typeof value === 'string' &&
  TEST_QUESTION_TYPES.includes(value as TestQuestionType);
