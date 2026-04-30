import type {
  CreateAnswerOptionPayload,
  CreateMaterialPayload,
  CreateTestQuestionPayload,
  UpdateAnswerOptionPayload,
  UpdateMaterialPayload,
  UpdateTestQuestionPayload
} from '@skillswap/contracts/materials';
import { materialRepository } from '../repositories/materialRepository.js';
import {
  MATERIAL_TYPE,
  isMaterialType,
  type MaterialType
} from '../types/materialType.js';
import { USER_ROLE, type UserRole } from '../types/userRole.js';
import {
  createBadRequest,
  createForbidden,
  createNotFound
} from '../utils/httpErrors.js';
import { NOT_FOUND_MESSAGES } from '../utils/errorMessages.js';

type CurrentActor = {
  userId: string;
  role: UserRole;
};

type UserSkillOwnerRecord = {
  id: string;
  userId: string;
};

type AnswerOptionRecord = {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

type QuestionRecord = {
  id: string;
  materialId: string;
  text: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  answerOptions?: AnswerOptionRecord[];
};

type MaterialRecord = {
  id: string;
  userSkillId: string;
  type: string;
  title: string;
  description: string | null;
  content: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  userSkill: UserSkillOwnerRecord;
  questions?: QuestionRecord[];
};

type QuestionWithMaterialRecord = QuestionRecord & {
  material: MaterialRecord;
};

type AnswerOptionWithQuestionRecord = AnswerOptionRecord & {
  question: QuestionWithMaterialRecord;
};

const isModerator = (role: UserRole) =>
  role === USER_ROLE.admin || role === USER_ROLE.owner;

const MATERIAL_PERMISSION_MESSAGE =
  'Not enough permissions to manage materials for this skill';
const TESTING_ONLY_MESSAGE =
  'Questions and answer options are available only for testing materials';

const ensureOwner = (
  ownerId: string,
  actor: CurrentActor,
  message = MATERIAL_PERMISSION_MESSAGE
) => {
  if (ownerId !== actor.userId) {
    throw createForbidden(message);
  }
};

const ensureOwnerOrModerator = (ownerId: string, actor: CurrentActor) => {
  if (ownerId !== actor.userId && !isModerator(actor.role)) {
    throw createForbidden(MATERIAL_PERMISSION_MESSAGE);
  }
};

const ensureTestingMaterial = (material: { type: string }) => {
  if (material.type !== MATERIAL_TYPE.testing) {
    throw createBadRequest(TESTING_ONLY_MESSAGE);
  }
};

const normalizeRequiredText = (value: string, fieldName: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw createBadRequest(`${fieldName} cannot be empty`);
  }
  return trimmed;
};

const normalizeNullableText = (
  value: string | null | undefined,
  fieldName = 'Content'
) => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw createBadRequest(`${fieldName} cannot be empty`);
  }
  return trimmed;
};

const normalizeMaterialType = (value: string): MaterialType => {
  if (!isMaterialType(value)) {
    throw createBadRequest('Invalid material type');
  }
  return value;
};

const mapAnswerOption = (option: AnswerOptionRecord) => ({
  id: option.id,
  questionId: option.questionId,
  text: option.text,
  isCorrect: option.isCorrect,
  position: option.position,
  createdAt: option.createdAt,
  updatedAt: option.updatedAt
});

const mapQuestion = (question: QuestionRecord) => ({
  id: question.id,
  materialId: question.materialId,
  text: question.text,
  position: question.position,
  answerOptions: (question.answerOptions ?? []).map(mapAnswerOption),
  createdAt: question.createdAt,
  updatedAt: question.updatedAt
});

const mapMaterial = (material: MaterialRecord) => ({
  id: material.id,
  userSkillId: material.userSkillId,
  type: normalizeMaterialType(material.type),
  title: material.title,
  description: material.description,
  content: material.content,
  position: material.position,
  questions: (material.questions ?? []).map(mapQuestion),
  createdAt: material.createdAt,
  updatedAt: material.updatedAt
});

const buildMaterialUpdateData = (
  material: MaterialRecord,
  payload: UpdateMaterialPayload
) => {
  const data: {
    type?: MaterialType;
    title?: string;
    description?: string | null;
    content?: string | null;
    position?: number;
  } = {};

  if (payload.type !== undefined) {
    const nextType = normalizeMaterialType(payload.type);
    if (
      nextType !== MATERIAL_TYPE.testing &&
      material.questions &&
      material.questions.length > 0
    ) {
      throw createBadRequest(
        'Cannot change material type while it has questions'
      );
    }
    data.type = nextType;
  }
  if (payload.title !== undefined) {
    data.title = normalizeRequiredText(payload.title, 'Title');
  }
  if ('description' in payload) {
    const description = normalizeNullableText(
      payload.description,
      'Description'
    );
    if (description !== undefined) {
      data.description = description;
    }
  }
  if ('content' in payload) {
    const content = normalizeNullableText(payload.content);
    if (content !== undefined) {
      data.content = content;
    }
  }
  if (payload.position !== undefined) {
    data.position = payload.position;
  }

  return data;
};

export const materialService = {
  async listForUserSkill(userSkillId: string) {
    const userSkill = await materialRepository.findUserSkillById(userSkillId);
    if (!userSkill) {
      throw createNotFound(NOT_FOUND_MESSAGES.userSkillNotFound);
    }

    const materials = (await materialRepository.listByUserSkillId(
      userSkillId
    )) as MaterialRecord[];
    return materials.map(mapMaterial);
  },

  async createMaterial(actor: CurrentActor, payload: CreateMaterialPayload) {
    const userSkill = await materialRepository.findUserSkillById(
      payload.userSkillId
    );
    if (!userSkill) {
      throw createNotFound(NOT_FOUND_MESSAGES.userSkillNotFound);
    }

    ensureOwner(
      userSkill.userId,
      actor,
      'Material can be created only for own skill'
    );

    const data: {
      userSkillId: string;
      type: MaterialType;
      title: string;
      description?: string | null;
      content?: string | null;
      position: number;
    } = {
      userSkillId: payload.userSkillId,
      type: normalizeMaterialType(payload.type),
      title: normalizeRequiredText(payload.title, 'Title'),
      position: payload.position ?? 0
    };
    const description = normalizeNullableText(
      payload.description,
      'Description'
    );
    if (description !== undefined) {
      data.description = description;
    }
    const content = normalizeNullableText(payload.content);
    if (content !== undefined) {
      data.content = content;
    }

    const material = (await materialRepository.createMaterial(
      data
    )) as MaterialRecord;

    return mapMaterial(material);
  },

  async updateMaterial(
    actor: CurrentActor,
    materialId: string,
    payload: UpdateMaterialPayload
  ) {
    const material = (await materialRepository.findMaterialById(
      materialId
    )) as MaterialRecord | null;
    if (!material) {
      throw createNotFound(NOT_FOUND_MESSAGES.materialNotFound);
    }

    ensureOwnerOrModerator(material.userSkill.userId, actor);
    const updated = (await materialRepository.updateMaterial(
      materialId,
      buildMaterialUpdateData(material, payload)
    )) as MaterialRecord;

    return mapMaterial(updated);
  },

  async deleteMaterial(actor: CurrentActor, materialId: string) {
    const material = (await materialRepository.findMaterialById(
      materialId
    )) as MaterialRecord | null;
    if (!material) {
      throw createNotFound(NOT_FOUND_MESSAGES.materialNotFound);
    }

    ensureOwnerOrModerator(material.userSkill.userId, actor);
    await materialRepository.deleteMaterial(materialId);
  },

  async createQuestion(
    actor: CurrentActor,
    payload: CreateTestQuestionPayload
  ) {
    const material = (await materialRepository.findMaterialById(
      payload.materialId
    )) as MaterialRecord | null;
    if (!material) {
      throw createNotFound(NOT_FOUND_MESSAGES.materialNotFound);
    }

    ensureOwner(material.userSkill.userId, actor);
    ensureTestingMaterial(material);

    const question = (await materialRepository.createQuestion({
      materialId: payload.materialId,
      text: normalizeRequiredText(payload.text, 'Text'),
      position: payload.position ?? 0
    })) as QuestionRecord;

    return mapQuestion(question);
  },

  async updateQuestion(
    actor: CurrentActor,
    questionId: string,
    payload: UpdateTestQuestionPayload
  ) {
    const question = (await materialRepository.findQuestionById(
      questionId
    )) as QuestionWithMaterialRecord | null;
    if (!question) {
      throw createNotFound(NOT_FOUND_MESSAGES.questionNotFound);
    }

    ensureOwnerOrModerator(question.material.userSkill.userId, actor);

    const data: { text?: string; position?: number } = {};
    if (payload.text !== undefined) {
      data.text = normalizeRequiredText(payload.text, 'Text');
    }
    if (payload.position !== undefined) {
      data.position = payload.position;
    }

    const updated = (await materialRepository.updateQuestion(
      questionId,
      data
    )) as QuestionRecord;

    return mapQuestion(updated);
  },

  async deleteQuestion(actor: CurrentActor, questionId: string) {
    const question = (await materialRepository.findQuestionById(
      questionId
    )) as QuestionWithMaterialRecord | null;
    if (!question) {
      throw createNotFound(NOT_FOUND_MESSAGES.questionNotFound);
    }

    ensureOwnerOrModerator(question.material.userSkill.userId, actor);
    await materialRepository.deleteQuestion(questionId);
  },

  async createAnswerOption(
    actor: CurrentActor,
    payload: CreateAnswerOptionPayload
  ) {
    const question = (await materialRepository.findQuestionById(
      payload.questionId
    )) as QuestionWithMaterialRecord | null;
    if (!question) {
      throw createNotFound(NOT_FOUND_MESSAGES.questionNotFound);
    }

    ensureOwner(question.material.userSkill.userId, actor);
    ensureTestingMaterial(question.material);

    const option = (await materialRepository.createAnswerOption({
      questionId: payload.questionId,
      text: normalizeRequiredText(payload.text, 'Text'),
      isCorrect: payload.isCorrect ?? false,
      position: payload.position ?? 0
    })) as AnswerOptionRecord;

    return mapAnswerOption(option);
  },

  async updateAnswerOption(
    actor: CurrentActor,
    optionId: string,
    payload: UpdateAnswerOptionPayload
  ) {
    const option = (await materialRepository.findAnswerOptionById(
      optionId
    )) as AnswerOptionWithQuestionRecord | null;
    if (!option) {
      throw createNotFound(NOT_FOUND_MESSAGES.answerOptionNotFound);
    }

    ensureOwnerOrModerator(option.question.material.userSkill.userId, actor);

    const data: { text?: string; isCorrect?: boolean; position?: number } = {};
    if (payload.text !== undefined) {
      data.text = normalizeRequiredText(payload.text, 'Text');
    }
    if (payload.isCorrect !== undefined) {
      data.isCorrect = payload.isCorrect;
    }
    if (payload.position !== undefined) {
      data.position = payload.position;
    }

    const updated = (await materialRepository.updateAnswerOption(
      optionId,
      data
    )) as AnswerOptionRecord;

    return mapAnswerOption(updated);
  },

  async deleteAnswerOption(actor: CurrentActor, optionId: string) {
    const option = (await materialRepository.findAnswerOptionById(
      optionId
    )) as AnswerOptionWithQuestionRecord | null;
    if (!option) {
      throw createNotFound(NOT_FOUND_MESSAGES.answerOptionNotFound);
    }

    ensureOwnerOrModerator(option.question.material.userSkill.userId, actor);
    await materialRepository.deleteAnswerOption(optionId);
  }
};
