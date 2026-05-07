import { z } from 'zod';
import type { MATERIAL_TYPES, TEST_QUESTION_TYPES } from './materials';
import type {
  CreateAnswerOptionPayload,
  CreateMaterialPayload,
  CreateTestQuestionPayload,
  MaterialAttachmentDto,
  MaterialType,
  TestQuestionType,
  UpdateAnswerOptionPayload,
  UpdateMaterialPayload,
  UpdateTestQuestionPayload
} from './materials';

export declare const materialTypes: typeof MATERIAL_TYPES;
export declare const testQuestionTypes: typeof TEST_QUESTION_TYPES;
export declare const materialTypeSchema: z.ZodType<MaterialType>;
export declare const testQuestionTypeSchema: z.ZodType<TestQuestionType>;
export declare const materialAttachmentSchema: z.ZodType<MaterialAttachmentDto>;
export declare const createMaterialPayloadSchema: z.ZodType<CreateMaterialPayload>;
export declare const updateMaterialPayloadSchema: z.ZodType<UpdateMaterialPayload>;
export declare const createTestQuestionPayloadSchema: z.ZodType<CreateTestQuestionPayload>;
export declare const updateTestQuestionPayloadSchema: z.ZodType<UpdateTestQuestionPayload>;
export declare const createAnswerOptionPayloadSchema: z.ZodType<CreateAnswerOptionPayload>;
export declare const updateAnswerOptionPayloadSchema: z.ZodType<UpdateAnswerOptionPayload>;
