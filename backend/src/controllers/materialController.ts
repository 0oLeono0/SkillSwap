import {
  createAnswerOptionPayloadSchema,
  createMaterialPayloadSchema,
  createTestQuestionPayloadSchema,
  updateAnswerOptionPayloadSchema,
  updateMaterialPayloadSchema,
  updateTestQuestionPayloadSchema
} from '@skillswap/contracts/materialSchemas';
import type { UserRole } from '../types/userRole.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { materialService } from '../services/materialService.js';
import { BAD_REQUEST_MESSAGES } from '../utils/errorMessages.js';
import { requireCurrentUser } from '../utils/currentUser.js';
import { createBadRequest } from '../utils/httpErrors.js';
import { requireStringParam } from '../utils/routeParams.js';
import { parseOrBadRequest } from '../utils/validation.js';

const withRouteParam = (body: unknown, key: string, value: string) => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { [key]: value };
  }

  const record = body as Record<string, unknown>;
  if (key in record && record[key] !== value) {
    throw createBadRequest(`${key} does not match route parameter`);
  }

  return {
    ...record,
    [key]: value
  };
};

const currentActor = (req: Parameters<typeof requireCurrentUser>[0]) => {
  const currentUser = requireCurrentUser(req);
  return {
    userId: currentUser.sub,
    role: currentUser.role as UserRole
  };
};

export const getUserSkillMaterials = asyncHandler(async (req, res) => {
  const userSkillId = requireStringParam(
    req.params,
    'userSkillId',
    BAD_REQUEST_MESSAGES.userSkillIdRequired
  );
  const materials = await materialService.listForUserSkill(userSkillId);
  return res.status(200).json({ materials });
});

export const createUserSkillMaterial = asyncHandler(async (req, res) => {
  const userSkillId = requireStringParam(
    req.params,
    'userSkillId',
    BAD_REQUEST_MESSAGES.userSkillIdRequired
  );
  const payload = parseOrBadRequest(
    createMaterialPayloadSchema,
    withRouteParam(req.body, 'userSkillId', userSkillId),
    BAD_REQUEST_MESSAGES.invalidPayload
  );

  const material = await materialService.createMaterial(
    currentActor(req),
    payload
  );
  return res.status(201).json({ material });
});

export const updateMaterial = asyncHandler(async (req, res) => {
  const materialId = requireStringParam(
    req.params,
    'materialId',
    BAD_REQUEST_MESSAGES.materialIdRequired
  );
  const payload = parseOrBadRequest(
    updateMaterialPayloadSchema,
    req.body,
    BAD_REQUEST_MESSAGES.invalidPayload
  );

  const material = await materialService.updateMaterial(
    currentActor(req),
    materialId,
    payload
  );
  return res.status(200).json({ material });
});

export const deleteMaterial = asyncHandler(async (req, res) => {
  const materialId = requireStringParam(
    req.params,
    'materialId',
    BAD_REQUEST_MESSAGES.materialIdRequired
  );
  await materialService.deleteMaterial(currentActor(req), materialId);
  return res.status(204).send();
});

export const createMaterialQuestion = asyncHandler(async (req, res) => {
  const materialId = requireStringParam(
    req.params,
    'materialId',
    BAD_REQUEST_MESSAGES.materialIdRequired
  );
  const payload = parseOrBadRequest(
    createTestQuestionPayloadSchema,
    withRouteParam(req.body, 'materialId', materialId),
    BAD_REQUEST_MESSAGES.invalidPayload
  );

  const question = await materialService.createQuestion(
    currentActor(req),
    payload
  );
  return res.status(201).json({ question });
});

export const updateMaterialQuestion = asyncHandler(async (req, res) => {
  const questionId = requireStringParam(
    req.params,
    'questionId',
    BAD_REQUEST_MESSAGES.questionIdRequired
  );
  const payload = parseOrBadRequest(
    updateTestQuestionPayloadSchema,
    req.body,
    BAD_REQUEST_MESSAGES.invalidPayload
  );

  const question = await materialService.updateQuestion(
    currentActor(req),
    questionId,
    payload
  );
  return res.status(200).json({ question });
});

export const deleteMaterialQuestion = asyncHandler(async (req, res) => {
  const questionId = requireStringParam(
    req.params,
    'questionId',
    BAD_REQUEST_MESSAGES.questionIdRequired
  );
  await materialService.deleteQuestion(currentActor(req), questionId);
  return res.status(204).send();
});

export const createQuestionAnswerOption = asyncHandler(async (req, res) => {
  const questionId = requireStringParam(
    req.params,
    'questionId',
    BAD_REQUEST_MESSAGES.questionIdRequired
  );
  const payload = parseOrBadRequest(
    createAnswerOptionPayloadSchema,
    withRouteParam(req.body, 'questionId', questionId),
    BAD_REQUEST_MESSAGES.invalidPayload
  );

  const option = await materialService.createAnswerOption(
    currentActor(req),
    payload
  );
  return res.status(201).json({ option });
});

export const updateAnswerOption = asyncHandler(async (req, res) => {
  const optionId = requireStringParam(
    req.params,
    'optionId',
    BAD_REQUEST_MESSAGES.optionIdRequired
  );
  const payload = parseOrBadRequest(
    updateAnswerOptionPayloadSchema,
    req.body,
    BAD_REQUEST_MESSAGES.invalidPayload
  );

  const option = await materialService.updateAnswerOption(
    currentActor(req),
    optionId,
    payload
  );
  return res.status(200).json({ option });
});

export const deleteAnswerOption = asyncHandler(async (req, res) => {
  const optionId = requireStringParam(
    req.params,
    'optionId',
    BAD_REQUEST_MESSAGES.optionIdRequired
  );
  await materialService.deleteAnswerOption(currentActor(req), optionId);
  return res.status(204).send();
});
