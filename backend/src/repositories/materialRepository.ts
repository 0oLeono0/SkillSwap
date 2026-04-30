import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type DbClient = PrismaClient | Prisma.TransactionClient;

const getClient = (client?: DbClient) => client ?? prisma;

const answerOptionOrderBy = [
  { position: 'asc' },
  { createdAt: 'asc' },
  { id: 'asc' }
] satisfies Prisma.MaterialAnswerOptionOrderByWithRelationInput[];

const questionOrderBy = [
  { position: 'asc' },
  { createdAt: 'asc' },
  { id: 'asc' }
] satisfies Prisma.MaterialQuestionOrderByWithRelationInput[];

const materialOrderBy = [
  { position: 'asc' },
  { createdAt: 'asc' },
  { id: 'asc' }
] satisfies Prisma.UserSkillMaterialOrderByWithRelationInput[];

const userSkillOwnerSelect = {
  select: {
    id: true,
    userId: true
  }
} as const;

const questionInclude = {
  answerOptions: {
    orderBy: answerOptionOrderBy
  }
} satisfies Prisma.MaterialQuestionInclude;

const materialInclude = {
  userSkill: userSkillOwnerSelect,
  questions: {
    orderBy: questionOrderBy,
    include: questionInclude
  }
} satisfies Prisma.UserSkillMaterialInclude;

const questionWithMaterialInclude = {
  material: {
    include: {
      userSkill: userSkillOwnerSelect
    }
  },
  answerOptions: {
    orderBy: answerOptionOrderBy
  }
} satisfies Prisma.MaterialQuestionInclude;

const answerOptionWithQuestionInclude = {
  question: {
    include: {
      material: {
        include: {
          userSkill: userSkillOwnerSelect
        }
      }
    }
  }
} satisfies Prisma.MaterialAnswerOptionInclude;

export const materialRepository = {
  findUserSkillById(userSkillId: string, client?: DbClient) {
    return getClient(client).userSkill.findUnique({
      where: { id: userSkillId },
      select: {
        id: true,
        userId: true
      }
    });
  },

  listByUserSkillId(userSkillId: string, client?: DbClient) {
    return getClient(client).userSkillMaterial.findMany({
      where: { userSkillId },
      include: materialInclude,
      orderBy: materialOrderBy
    });
  },

  findMaterialById(materialId: string, client?: DbClient) {
    return getClient(client).userSkillMaterial.findUnique({
      where: { id: materialId },
      include: materialInclude
    });
  },

  createMaterial(
    data: Prisma.UserSkillMaterialUncheckedCreateInput,
    client?: DbClient
  ) {
    return getClient(client).userSkillMaterial.create({
      data,
      include: materialInclude
    });
  },

  updateMaterial(
    materialId: string,
    data: Prisma.UserSkillMaterialUncheckedUpdateInput,
    client?: DbClient
  ) {
    return getClient(client).userSkillMaterial.update({
      where: { id: materialId },
      data,
      include: materialInclude
    });
  },

  deleteMaterial(materialId: string, client?: DbClient) {
    return getClient(client).userSkillMaterial.delete({
      where: { id: materialId }
    });
  },

  findQuestionById(questionId: string, client?: DbClient) {
    return getClient(client).materialQuestion.findUnique({
      where: { id: questionId },
      include: questionWithMaterialInclude
    });
  },

  createQuestion(
    data: Prisma.MaterialQuestionUncheckedCreateInput,
    client?: DbClient
  ) {
    return getClient(client).materialQuestion.create({
      data,
      include: questionInclude
    });
  },

  updateQuestion(
    questionId: string,
    data: Prisma.MaterialQuestionUncheckedUpdateInput,
    client?: DbClient
  ) {
    return getClient(client).materialQuestion.update({
      where: { id: questionId },
      data,
      include: questionInclude
    });
  },

  deleteQuestion(questionId: string, client?: DbClient) {
    return getClient(client).materialQuestion.delete({
      where: { id: questionId }
    });
  },

  findAnswerOptionById(optionId: string, client?: DbClient) {
    return getClient(client).materialAnswerOption.findUnique({
      where: { id: optionId },
      include: answerOptionWithQuestionInclude
    });
  },

  createAnswerOption(
    data: Prisma.MaterialAnswerOptionUncheckedCreateInput,
    client?: DbClient
  ) {
    return getClient(client).materialAnswerOption.create({
      data
    });
  },

  updateAnswerOption(
    optionId: string,
    data: Prisma.MaterialAnswerOptionUncheckedUpdateInput,
    client?: DbClient
  ) {
    return getClient(client).materialAnswerOption.update({
      where: { id: optionId },
      data
    });
  },

  deleteAnswerOption(optionId: string, client?: DbClient) {
    return getClient(client).materialAnswerOption.delete({
      where: { id: optionId }
    });
  }
};
