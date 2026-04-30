import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockMaterialRepository: {
  findUserSkillById: jest.MockedFunction<
    (userSkillId: string) => Promise<unknown>
  >;
  listByUserSkillId: jest.MockedFunction<
    (userSkillId: string) => Promise<unknown>
  >;
  findMaterialById: jest.MockedFunction<
    (materialId: string) => Promise<unknown>
  >;
  createMaterial: jest.MockedFunction<(data: unknown) => Promise<unknown>>;
  updateMaterial: jest.MockedFunction<
    (materialId: string, data: unknown) => Promise<unknown>
  >;
  deleteMaterial: jest.MockedFunction<(materialId: string) => Promise<unknown>>;
  findQuestionById: jest.MockedFunction<
    (questionId: string) => Promise<unknown>
  >;
  createQuestion: jest.MockedFunction<(data: unknown) => Promise<unknown>>;
  updateQuestion: jest.MockedFunction<
    (questionId: string, data: unknown) => Promise<unknown>
  >;
  deleteQuestion: jest.MockedFunction<(questionId: string) => Promise<unknown>>;
  findAnswerOptionById: jest.MockedFunction<
    (optionId: string) => Promise<unknown>
  >;
  createAnswerOption: jest.MockedFunction<(data: unknown) => Promise<unknown>>;
  updateAnswerOption: jest.MockedFunction<
    (optionId: string, data: unknown) => Promise<unknown>
  >;
  deleteAnswerOption: jest.MockedFunction<
    (optionId: string) => Promise<unknown>
  >;
} = {
  findUserSkillById: jest.fn(),
  listByUserSkillId: jest.fn(),
  findMaterialById: jest.fn(),
  createMaterial: jest.fn(),
  updateMaterial: jest.fn(),
  deleteMaterial: jest.fn(),
  findQuestionById: jest.fn(),
  createQuestion: jest.fn(),
  updateQuestion: jest.fn(),
  deleteQuestion: jest.fn(),
  findAnswerOptionById: jest.fn(),
  createAnswerOption: jest.fn(),
  updateAnswerOption: jest.fn(),
  deleteAnswerOption: jest.fn()
};

jest.unstable_mockModule('../src/repositories/materialRepository.js', () => ({
  materialRepository: mockMaterialRepository
}));

const { materialService } = await import('../src/services/materialService.js');

const actor = { userId: 'owner', role: 'user' as const };
const adminActor = { userId: 'admin', role: 'admin' as const };
const otherActor = { userId: 'other', role: 'user' as const };

const buildUserSkill = (overrides = {}) => ({
  id: 'skill-1',
  userId: 'owner',
  ...overrides
});

const buildOption = (overrides = {}) => ({
  id: 'option-1',
  questionId: 'question-1',
  text: 'Answer',
  isCorrect: false,
  position: 0,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  ...overrides
});

const buildQuestion = (overrides = {}) => ({
  id: 'question-1',
  materialId: 'material-1',
  text: 'Question',
  position: 0,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  answerOptions: [buildOption()],
  ...overrides
});

const buildMaterial = (overrides = {}) => ({
  id: 'material-1',
  userSkillId: 'skill-1',
  type: 'testing',
  title: 'Material',
  description: null,
  content: null,
  position: 0,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  userSkill: buildUserSkill(),
  questions: [buildQuestion()],
  ...overrides
});

describe('materialService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists materials with nested questions and answer options', async () => {
    mockMaterialRepository.findUserSkillById.mockResolvedValue(
      buildUserSkill()
    );
    mockMaterialRepository.listByUserSkillId.mockResolvedValue([
      buildMaterial()
    ]);

    const result = await materialService.listForUserSkill('skill-1');

    expect(mockMaterialRepository.listByUserSkillId).toHaveBeenCalledWith(
      'skill-1'
    );
    expect(result).toEqual([
      expect.objectContaining({
        id: 'material-1',
        type: 'testing',
        questions: [
          expect.objectContaining({
            id: 'question-1',
            answerOptions: [
              expect.objectContaining({
                id: 'option-1',
                text: 'Answer'
              })
            ]
          })
        ]
      })
    ]);
  });

  it('creates material only for the owner skill and trims text fields', async () => {
    mockMaterialRepository.findUserSkillById.mockResolvedValue(
      buildUserSkill()
    );
    mockMaterialRepository.createMaterial.mockResolvedValue(
      buildMaterial({
        title: 'Theory',
        type: 'theory',
        description: 'Intro',
        content: 'Read'
      })
    );

    await materialService.createMaterial(actor, {
      userSkillId: 'skill-1',
      type: 'theory',
      title: '  Theory  ',
      description: '  Intro  ',
      content: '  Read  '
    });

    expect(mockMaterialRepository.createMaterial).toHaveBeenCalledWith({
      userSkillId: 'skill-1',
      type: 'theory',
      title: 'Theory',
      description: 'Intro',
      content: 'Read',
      position: 0
    });
  });

  it('rejects creating material for someone else skill even for admin', async () => {
    mockMaterialRepository.findUserSkillById.mockResolvedValue(
      buildUserSkill()
    );

    await expect(
      materialService.createMaterial(adminActor, {
        userSkillId: 'skill-1',
        type: 'theory',
        title: 'Theory'
      })
    ).rejects.toMatchObject({ status: 403 });

    expect(mockMaterialRepository.createMaterial).not.toHaveBeenCalled();
  });

  it('lets admin update any material', async () => {
    const material = buildMaterial({ type: 'theory', questions: [] });
    mockMaterialRepository.findMaterialById.mockResolvedValue(material);
    mockMaterialRepository.updateMaterial.mockResolvedValue({
      ...material,
      title: 'Updated'
    });

    await materialService.updateMaterial(adminActor, 'material-1', {
      title: ' Updated '
    });

    expect(mockMaterialRepository.updateMaterial).toHaveBeenCalledWith(
      'material-1',
      { title: 'Updated' }
    );
  });

  it('rejects update from another regular user', async () => {
    mockMaterialRepository.findMaterialById.mockResolvedValue(buildMaterial());

    await expect(
      materialService.updateMaterial(otherActor, 'material-1', {
        title: 'Updated'
      })
    ).rejects.toMatchObject({ status: 403 });
  });

  it('rejects adding question to non-testing material', async () => {
    mockMaterialRepository.findMaterialById.mockResolvedValue(
      buildMaterial({ type: 'practice', questions: [] })
    );

    await expect(
      materialService.createQuestion(actor, {
        materialId: 'material-1',
        text: 'Question'
      })
    ).rejects.toMatchObject({ status: 400 });

    expect(mockMaterialRepository.createQuestion).not.toHaveBeenCalled();
  });

  it('creates question for owner testing material', async () => {
    mockMaterialRepository.findMaterialById.mockResolvedValue(buildMaterial());
    mockMaterialRepository.createQuestion.mockResolvedValue(
      buildQuestion({ text: 'New question', answerOptions: [] })
    );

    const result = await materialService.createQuestion(actor, {
      materialId: 'material-1',
      text: '  New question  ',
      position: 2
    });

    expect(mockMaterialRepository.createQuestion).toHaveBeenCalledWith({
      materialId: 'material-1',
      text: 'New question',
      position: 2
    });
    expect(result).toMatchObject({ text: 'New question' });
  });

  it('creates answer option only when question belongs to testing material', async () => {
    mockMaterialRepository.findQuestionById.mockResolvedValue({
      ...buildQuestion({ answerOptions: [] }),
      material: buildMaterial()
    });
    mockMaterialRepository.createAnswerOption.mockResolvedValue(
      buildOption({ text: 'Correct', isCorrect: true })
    );

    const result = await materialService.createAnswerOption(actor, {
      questionId: 'question-1',
      text: '  Correct  ',
      isCorrect: true
    });

    expect(mockMaterialRepository.createAnswerOption).toHaveBeenCalledWith({
      questionId: 'question-1',
      text: 'Correct',
      isCorrect: true,
      position: 0
    });
    expect(result).toMatchObject({ text: 'Correct', isCorrect: true });
  });

  it('lets admin delete material', async () => {
    mockMaterialRepository.findMaterialById.mockResolvedValue(buildMaterial());
    mockMaterialRepository.deleteMaterial.mockResolvedValue({
      id: 'material-1'
    });

    await materialService.deleteMaterial(adminActor, 'material-1');

    expect(mockMaterialRepository.deleteMaterial).toHaveBeenCalledWith(
      'material-1'
    );
  });
});
