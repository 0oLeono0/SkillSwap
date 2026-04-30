import type {
  AnswerOptionDto,
  CreateAnswerOptionPayload,
  CreateMaterialPayload,
  CreateTestQuestionPayload,
  MaterialDto,
  TestQuestionDto,
  UpdateAnswerOptionPayload,
  UpdateMaterialPayload,
  UpdateTestQuestionPayload
} from '@skillswap/contracts/materials';
import { authorizedRequest, request } from './request';

export type {
  AnswerOptionDto,
  MaterialDto,
  MaterialType,
  TestQuestionDto,
  UpdateAnswerOptionPayload,
  UpdateMaterialPayload,
  UpdateTestQuestionPayload
} from '@skillswap/contracts/materials';

export type CreateMaterialInput = Omit<CreateMaterialPayload, 'userSkillId'>;
export type CreateTestQuestionInput = Omit<
  CreateTestQuestionPayload,
  'materialId'
>;
export type CreateAnswerOptionInput = Omit<
  CreateAnswerOptionPayload,
  'questionId'
>;

export interface MaterialsListResponse {
  materials: MaterialDto[];
}

export interface MaterialResponse {
  material: MaterialDto;
}

export interface TestQuestionResponse {
  question: TestQuestionDto;
}

export interface AnswerOptionResponse {
  option: AnswerOptionDto;
}

export const materialsApi = {
  listByUserSkill(userSkillId: string) {
    return request<MaterialsListResponse>(
      `/user-skills/${userSkillId}/materials`
    );
  },

  create(
    accessToken: string,
    userSkillId: string,
    payload: CreateMaterialInput
  ) {
    return authorizedRequest<MaterialResponse>(
      `/user-skills/${userSkillId}/materials`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  update(
    accessToken: string,
    materialId: string,
    payload: UpdateMaterialPayload
  ) {
    return authorizedRequest<MaterialResponse>(
      `/materials/${materialId}`,
      accessToken,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }
    );
  },

  remove(accessToken: string, materialId: string) {
    return authorizedRequest<void>(`/materials/${materialId}`, accessToken, {
      method: 'DELETE'
    });
  },

  createQuestion(
    accessToken: string,
    materialId: string,
    payload: CreateTestQuestionInput
  ) {
    return authorizedRequest<TestQuestionResponse>(
      `/materials/${materialId}/questions`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  updateQuestion(
    accessToken: string,
    questionId: string,
    payload: UpdateTestQuestionPayload
  ) {
    return authorizedRequest<TestQuestionResponse>(
      `/material-questions/${questionId}`,
      accessToken,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }
    );
  },

  removeQuestion(accessToken: string, questionId: string) {
    return authorizedRequest<void>(
      `/material-questions/${questionId}`,
      accessToken,
      {
        method: 'DELETE'
      }
    );
  },

  createAnswerOption(
    accessToken: string,
    questionId: string,
    payload: CreateAnswerOptionInput
  ) {
    return authorizedRequest<AnswerOptionResponse>(
      `/material-questions/${questionId}/options`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  updateAnswerOption(
    accessToken: string,
    optionId: string,
    payload: UpdateAnswerOptionPayload
  ) {
    return authorizedRequest<AnswerOptionResponse>(
      `/material-answer-options/${optionId}`,
      accessToken,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }
    );
  },

  removeAnswerOption(accessToken: string, optionId: string) {
    return authorizedRequest<void>(
      `/material-answer-options/${optionId}`,
      accessToken,
      {
        method: 'DELETE'
      }
    );
  }
};
