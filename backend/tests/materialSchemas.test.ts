import { describe, expect, it } from '@jest/globals';
import {
  MATERIAL_TYPES,
  TEST_QUESTION_TYPES
} from '@skillswap/contracts/materials';
import {
  createAnswerOptionPayloadSchema,
  createMaterialPayloadSchema,
  createTestQuestionPayloadSchema,
  materialAttachmentSchema,
  materialTypes,
  materialTypeSchema,
  testQuestionTypes,
  testQuestionTypeSchema,
  updateAnswerOptionPayloadSchema,
  updateMaterialPayloadSchema,
  updateTestQuestionPayloadSchema
} from '@skillswap/contracts/materialSchemas';

describe('materialSchemas contracts', () => {
  it('uses the shared material type source of truth', () => {
    expect(materialTypes).toBe(MATERIAL_TYPES);
    expect(materialTypes).toEqual(['theory', 'practice', 'testing']);
    expect(Object.isFrozen(materialTypes)).toBe(true);
    expect(testQuestionTypes).toBe(TEST_QUESTION_TYPES);
    expect(testQuestionTypes).toEqual([
      'single',
      'multiple',
      'text',
      'gap',
      'image'
    ]);
    expect(Object.isFrozen(testQuestionTypes)).toBe(true);
  });

  it('validates material type values', () => {
    expect(materialTypeSchema.safeParse('theory').success).toBe(true);
    expect(materialTypeSchema.safeParse('practice').success).toBe(true);
    expect(materialTypeSchema.safeParse('testing').success).toBe(true);
    expect(materialTypeSchema.safeParse('rating').success).toBe(false);
    expect(testQuestionTypeSchema.safeParse('single').success).toBe(true);
    expect(testQuestionTypeSchema.safeParse('multiple').success).toBe(true);
    expect(testQuestionTypeSchema.safeParse('text').success).toBe(true);
    expect(testQuestionTypeSchema.safeParse('gap').success).toBe(true);
    expect(testQuestionTypeSchema.safeParse('image').success).toBe(true);
    expect(testQuestionTypeSchema.safeParse('audio').success).toBe(false);
  });

  it('validates create and update material payloads', () => {
    expect(
      createMaterialPayloadSchema.safeParse({
        userSkillId: 'skill-1',
        type: 'testing',
        title: 'JavaScript basics',
        description: null,
        content: 'Read the intro',
        attachments: [
          {
            id: 'file-1',
            name: 'intro.pdf',
            type: 'application/pdf',
            size: 1200,
            url: 'data:application/pdf;base64,AAAA'
          }
        ],
        position: 0
      }).success
    ).toBe(true);

    expect(
      updateMaterialPayloadSchema.safeParse({
        title: 'Updated material',
        type: 'practice'
      }).success
    ).toBe(true);
  });

  it('validates question payloads', () => {
    expect(
      createTestQuestionPayloadSchema.safeParse({
        materialId: 'material-1',
        type: 'multiple',
        text: 'What does const mean?',
        position: 1
      }).success
    ).toBe(true);

    expect(
      updateTestQuestionPayloadSchema.safeParse({
        text: 'Updated question'
      }).success
    ).toBe(true);
  });

  it('validates material attachment payloads', () => {
    expect(
      materialAttachmentSchema.safeParse({
        id: 'file-1',
        name: 'practice.pdf',
        type: 'application/pdf',
        size: 1000,
        url: 'data:application/pdf;base64,AAAA'
      }).success
    ).toBe(true);
    expect(
      materialAttachmentSchema.safeParse({
        id: 'file-1',
        name: '',
        type: 'application/pdf',
        size: 1000,
        url: 'data:application/pdf;base64,AAAA'
      }).success
    ).toBe(false);
  });

  it('validates answer option payloads', () => {
    expect(
      createAnswerOptionPayloadSchema.safeParse({
        questionId: 'question-1',
        text: 'A block-scoped binding',
        isCorrect: true,
        position: 0
      }).success
    ).toBe(true);

    expect(
      updateAnswerOptionPayloadSchema.safeParse({
        isCorrect: false
      }).success
    ).toBe(true);
  });

  it('rejects unknown fields in all payload schemas', () => {
    const cases = [
      createMaterialPayloadSchema.safeParse({
        userSkillId: 'skill-1',
        type: 'theory',
        title: 'Theory',
        score: 5
      }),
      updateMaterialPayloadSchema.safeParse({ title: 'Theory', rating: 5 }),
      createTestQuestionPayloadSchema.safeParse({
        materialId: 'material-1',
        text: 'Question',
        extra: true
      }),
      updateTestQuestionPayloadSchema.safeParse({
        text: 'Question',
        extra: true
      }),
      createAnswerOptionPayloadSchema.safeParse({
        questionId: 'question-1',
        text: 'Answer',
        extra: true
      }),
      updateAnswerOptionPayloadSchema.safeParse({
        text: 'Answer',
        extra: true
      })
    ];

    expect(cases.every((result) => !result.success)).toBe(true);
  });
});
