export declare const MATERIAL_TYPES: readonly ['theory', 'practice', 'testing'];

export type MaterialType = (typeof MATERIAL_TYPES)[number];

export interface AnswerOptionDto {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestQuestionDto {
  id: string;
  materialId: string;
  text: string;
  position: number;
  answerOptions: AnswerOptionDto[];
  createdAt: string;
  updatedAt: string;
}

export interface MaterialDto {
  id: string;
  userSkillId: string;
  type: MaterialType;
  title: string;
  description?: string | null | undefined;
  content?: string | null | undefined;
  position: number;
  questions?: TestQuestionDto[] | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialPayload {
  userSkillId: string;
  type: MaterialType;
  title: string;
  description?: string | null | undefined;
  content?: string | null | undefined;
  position?: number | undefined;
}

export interface UpdateMaterialPayload {
  type?: MaterialType | undefined;
  title?: string | undefined;
  description?: string | null | undefined;
  content?: string | null | undefined;
  position?: number | undefined;
}

export interface CreateTestQuestionPayload {
  materialId: string;
  text: string;
  position?: number | undefined;
}

export interface UpdateTestQuestionPayload {
  text?: string | undefined;
  position?: number | undefined;
}

export interface CreateAnswerOptionPayload {
  questionId: string;
  text: string;
  isCorrect?: boolean | undefined;
  position?: number | undefined;
}

export interface UpdateAnswerOptionPayload {
  text?: string | undefined;
  isCorrect?: boolean | undefined;
  position?: number | undefined;
}
