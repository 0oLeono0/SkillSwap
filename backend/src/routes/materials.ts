import { Router } from 'express';
import { authenticateAccessToken } from '../middleware/authenticateAccessToken.js';
import {
  createMaterialQuestion,
  createQuestionAnswerOption,
  createUserSkillMaterial,
  deleteAnswerOption,
  deleteMaterial,
  deleteMaterialQuestion,
  getUserSkillMaterials,
  updateAnswerOption,
  updateMaterial,
  updateMaterialQuestion
} from '../controllers/materialController.js';

export const materialsRouter = Router();

materialsRouter.get(
  '/user-skills/:userSkillId/materials',
  getUserSkillMaterials
);
materialsRouter.post(
  '/user-skills/:userSkillId/materials',
  authenticateAccessToken,
  createUserSkillMaterial
);
materialsRouter.patch(
  '/materials/:materialId',
  authenticateAccessToken,
  updateMaterial
);
materialsRouter.delete(
  '/materials/:materialId',
  authenticateAccessToken,
  deleteMaterial
);
materialsRouter.post(
  '/materials/:materialId/questions',
  authenticateAccessToken,
  createMaterialQuestion
);
materialsRouter.patch(
  '/material-questions/:questionId',
  authenticateAccessToken,
  updateMaterialQuestion
);
materialsRouter.delete(
  '/material-questions/:questionId',
  authenticateAccessToken,
  deleteMaterialQuestion
);
materialsRouter.post(
  '/material-questions/:questionId/options',
  authenticateAccessToken,
  createQuestionAnswerOption
);
materialsRouter.patch(
  '/material-answer-options/:optionId',
  authenticateAccessToken,
  updateAnswerOption
);
materialsRouter.delete(
  '/material-answer-options/:optionId',
  authenticateAccessToken,
  deleteAnswerOption
);
