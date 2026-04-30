import { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@/app/providers/auth';
import type { UserSkill } from '@/entities/User/types';
import { useFiltersBaseData } from '@/features/Filter/model/useFiltersBaseData';
import {
  materialsApi,
  type AnswerOptionDto,
  type MaterialDto,
  type TestQuestionDto
} from '@/shared/api/materials';
import { ProfileSkillMaterials } from '../ProfileSkillMaterials';
import { ProfileSkills } from '../ProfileSkills';
import {
  sanitizeSkillsForSubmit,
  serializeSkills
} from '../profileSkills.helpers';

jest.mock('@/app/providers/auth');
jest.mock('@/features/Filter/model/useFiltersBaseData');
jest.mock('@/shared/api/materials', () => ({
  materialsApi: {
    listByUserSkill: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQuestion: jest.fn(),
    updateQuestion: jest.fn(),
    removeQuestion: jest.fn(),
    createAnswerOption: jest.fn(),
    updateAnswerOption: jest.fn(),
    removeAnswerOption: jest.fn()
  }
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseFiltersBaseData = useFiltersBaseData as jest.Mock;
const mockListByUserSkill = materialsApi.listByUserSkill as jest.MockedFunction<
  typeof materialsApi.listByUserSkill
>;
const mockCreateMaterial = materialsApi.create as jest.MockedFunction<
  typeof materialsApi.create
>;
const mockUpdateMaterial = materialsApi.update as jest.MockedFunction<
  typeof materialsApi.update
>;
const mockRemoveMaterial = materialsApi.remove as jest.MockedFunction<
  typeof materialsApi.remove
>;
const mockCreateQuestion = materialsApi.createQuestion as jest.MockedFunction<
  typeof materialsApi.createQuestion
>;
const mockUpdateQuestion = materialsApi.updateQuestion as jest.MockedFunction<
  typeof materialsApi.updateQuestion
>;
const mockRemoveQuestion = materialsApi.removeQuestion as jest.MockedFunction<
  typeof materialsApi.removeQuestion
>;
const mockCreateAnswerOption =
  materialsApi.createAnswerOption as jest.MockedFunction<
    typeof materialsApi.createAnswerOption
  >;
const mockUpdateAnswerOption =
  materialsApi.updateAnswerOption as jest.MockedFunction<
    typeof materialsApi.updateAnswerOption
  >;
const mockRemoveAnswerOption =
  materialsApi.removeAnswerOption as jest.MockedFunction<
    typeof materialsApi.removeAnswerOption
  >;

const buildSubskillCategoryMap = () =>
  new Map([
    [1, 101],
    [2, 101]
  ]);
const buildSubskillNameMap = () =>
  new Map([
    [1, 'Гитара'],
    [2, 'Фортепиано']
  ]);

const createSkill = (overrides: Partial<UserSkill> = {}): UserSkill => ({
  id: overrides.id ?? 'skill-a',
  title: overrides.title ?? 'Название',
  categoryId: overrides.categoryId ?? null,
  subcategoryId:
    overrides.subcategoryId !== undefined ? overrides.subcategoryId : 1,
  description: overrides.description ?? 'Описание',
  imageUrls: overrides.imageUrls ?? []
});

const createMaterial = (overrides: Partial<MaterialDto> = {}): MaterialDto => ({
  id: overrides.id ?? 'material-1',
  userSkillId: overrides.userSkillId ?? 'skill-teach-1',
  type: overrides.type ?? 'theory',
  title: overrides.title ?? 'Основы планирования',
  description: overrides.description ?? 'Короткое описание',
  content: overrides.content ?? 'Материал для подготовки',
  position: overrides.position ?? 0,
  questions: overrides.questions ?? [],
  createdAt: overrides.createdAt ?? '2026-04-30T00:00:00.000Z',
  updatedAt: overrides.updatedAt ?? '2026-04-30T00:00:00.000Z'
});

const createAnswerOption = (
  overrides: Partial<AnswerOptionDto> = {}
): AnswerOptionDto => ({
  id: overrides.id ?? 'option-1',
  questionId: overrides.questionId ?? 'question-1',
  text: overrides.text ?? 'Старый вариант',
  isCorrect: overrides.isCorrect ?? true,
  position: overrides.position ?? 0,
  createdAt: overrides.createdAt ?? '2026-04-30T00:00:00.000Z',
  updatedAt: overrides.updatedAt ?? '2026-04-30T00:00:00.000Z'
});

const createQuestion = (
  overrides: Partial<TestQuestionDto> = {}
): TestQuestionDto => ({
  id: overrides.id ?? 'question-1',
  materialId: overrides.materialId ?? 'testing-1',
  text: overrides.text ?? 'Старый вопрос',
  position: overrides.position ?? 0,
  answerOptions: overrides.answerOptions ?? [createAnswerOption()],
  createdAt: overrides.createdAt ?? '2026-04-30T00:00:00.000Z',
  updatedAt: overrides.updatedAt ?? '2026-04-30T00:00:00.000Z'
});

const setupProfileSkills = ({
  accessToken = 'token',
  teachableSkills = [
    createSkill({
      id: 'skill-teach-1',
      title: 'Управление проектами',
      categoryId: 101,
      subcategoryId: 1
    })
  ],
  learningSkills = [
    createSkill({
      id: 'skill-learn-1',
      title: 'Английский',
      categoryId: 101,
      subcategoryId: 2
    })
  ]
}: {
  accessToken?: string | null;
  teachableSkills?: UserSkill[];
  learningSkills?: UserSkill[];
} = {}) => {
  mockUseFiltersBaseData.mockReturnValue({
    cities: [],
    skillGroups: [
      {
        id: 101,
        name: 'Творчество и искусство',
        skills: [
          { id: 1, name: 'Гитара' },
          { id: 2, name: 'Фортепиано' }
        ]
      }
    ],
    isLoading: false,
    error: null,
    refetch: jest.fn()
  });
  mockUseAuth.mockReturnValue({
    user: {
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
      role: 'user',
      teachableSkills,
      learningSkills
    },
    accessToken,
    updateProfile: jest.fn()
  });

  return render(<ProfileSkills />);
};

describe('ProfileSkills materials management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListByUserSkill.mockResolvedValue({ materials: [] });
    mockCreateMaterial.mockResolvedValue({
      material: createMaterial({ id: 'material-created' })
    });
    mockUpdateMaterial.mockResolvedValue({
      material: createMaterial({ title: 'Обновленный материал' })
    });
    mockRemoveMaterial.mockResolvedValue(undefined);
    mockCreateQuestion.mockResolvedValue({
      question: {
        id: 'question-created',
        materialId: 'testing-1',
        text: 'Новый вопрос',
        position: 0,
        answerOptions: [],
        createdAt: '2026-04-30T00:00:00.000Z',
        updatedAt: '2026-04-30T00:00:00.000Z'
      }
    });
    mockUpdateQuestion.mockResolvedValue({
      question: {
        id: 'question-1',
        materialId: 'testing-1',
        text: 'Обновленный вопрос',
        position: 0,
        answerOptions: [],
        createdAt: '2026-04-30T00:00:00.000Z',
        updatedAt: '2026-04-30T00:00:00.000Z'
      }
    });
    mockRemoveQuestion.mockResolvedValue(undefined);
    mockCreateAnswerOption.mockResolvedValue({
      option: {
        id: 'option-created',
        questionId: 'question-1',
        text: 'Новый вариант',
        isCorrect: true,
        position: 0,
        createdAt: '2026-04-30T00:00:00.000Z',
        updatedAt: '2026-04-30T00:00:00.000Z'
      }
    });
    mockUpdateAnswerOption.mockResolvedValue({
      option: {
        id: 'option-1',
        questionId: 'question-1',
        text: 'Обновленный вариант',
        isCorrect: false,
        position: 0,
        createdAt: '2026-04-30T00:00:00.000Z',
        updatedAt: '2026-04-30T00:00:00.000Z'
      }
    });
    mockRemoveAnswerOption.mockResolvedValue(undefined);
  });

  it('loads materials only for teachable skills', async () => {
    mockListByUserSkill.mockResolvedValue({
      materials: [
        createMaterial({
          type: 'practice',
          title: 'Практическое задание',
          description: 'Описание практики',
          content: 'Сделайте недельный план'
        })
      ]
    });

    setupProfileSkills();

    await waitFor(() => {
      expect(mockListByUserSkill).toHaveBeenCalledWith('skill-teach-1');
    });
    expect(mockListByUserSkill).not.toHaveBeenCalledWith('skill-learn-1');
    expect(await screen.findByText('Практическое задание')).toBeInTheDocument();
    expect(screen.getAllByText('Практика').length).toBeGreaterThan(0);
    expect(screen.getByText('Сделайте недельный план')).toBeInTheDocument();
  });

  it('does not stay loading under React StrictMode effect replay', async () => {
    mockUseAuth.mockReturnValue({
      accessToken: 'token'
    });
    mockListByUserSkill.mockResolvedValue({
      materials: [
        createMaterial({
          title: 'StrictMode material'
        })
      ]
    });

    render(
      <StrictMode>
        <ProfileSkillMaterials skillId='skill-teach-1' />
      </StrictMode>
    );

    expect(await screen.findByText('StrictMode material')).toBeInTheDocument();
    expect(
      screen.queryByText('Загрузка материалов...')
    ).not.toBeInTheDocument();
  });

  it('shows empty state when a skill has no materials', async () => {
    setupProfileSkills();

    expect(
      await screen.findByText('Материалы пока не добавлены')
    ).toBeInTheDocument();
  });

  it('creates material with access token and refreshes the skill materials', async () => {
    mockListByUserSkill
      .mockResolvedValueOnce({ materials: [] })
      .mockResolvedValueOnce({
        materials: [createMaterial({ id: 'material-created' })]
      });

    setupProfileSkills();

    await screen.findByText('Материалы пока не добавлены');
    fireEvent.change(screen.getByLabelText('Тип материала'), {
      target: { value: 'practice' }
    });
    fireEvent.change(screen.getByLabelText('Название материала'), {
      target: { value: '  Практика планирования  ' }
    });
    fireEvent.change(screen.getByLabelText('Описание материала'), {
      target: { value: '  Кратко  ' }
    });
    fireEvent.change(screen.getByLabelText('Содержимое материала'), {
      target: { value: '  Соберите план  ' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Добавить материал' }));

    await waitFor(() => {
      expect(mockCreateMaterial).toHaveBeenCalledWith(
        'token',
        'skill-teach-1',
        {
          type: 'practice',
          title: 'Практика планирования',
          description: 'Кратко',
          content: 'Соберите план'
        }
      );
    });
    await waitFor(() => {
      expect(mockListByUserSkill).toHaveBeenCalledTimes(2);
    });
  });

  it('updates material with access token', async () => {
    mockListByUserSkill
      .mockResolvedValueOnce({
        materials: [
          createMaterial({ id: 'material-1', title: 'Старый материал' })
        ]
      })
      .mockResolvedValueOnce({
        materials: [
          createMaterial({ id: 'material-1', title: 'Новый материал' })
        ]
      });

    setupProfileSkills();

    await screen.findByText('Старый материал');
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Редактировать материал Старый материал'
      })
    );
    fireEvent.change(screen.getByLabelText('Название материала'), {
      target: { value: '  Новый материал  ' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить материал' }));

    await waitFor(() => {
      expect(mockUpdateMaterial).toHaveBeenCalledWith(
        'token',
        'material-1',
        expect.objectContaining({
          type: 'theory',
          title: 'Новый материал'
        })
      );
    });
    await waitFor(() => {
      expect(mockListByUserSkill).toHaveBeenCalledTimes(2);
    });
  });

  it('deletes material with access token and refreshes the skill materials', async () => {
    mockListByUserSkill
      .mockResolvedValueOnce({
        materials: [
          createMaterial({ id: 'material-1', title: 'Удаляемый материал' })
        ]
      })
      .mockResolvedValueOnce({ materials: [] });

    setupProfileSkills();

    await screen.findByText('Удаляемый материал');
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Удалить материал Удаляемый материал'
      })
    );

    await waitFor(() => {
      expect(mockRemoveMaterial).toHaveBeenCalledWith('token', 'material-1');
    });
    await waitFor(() => {
      expect(mockListByUserSkill).toHaveBeenCalledTimes(2);
    });
  });

  it('shows question editor only for testing materials', async () => {
    mockListByUserSkill.mockResolvedValue({
      materials: [
        createMaterial({
          id: 'theory-1',
          type: 'theory',
          title: 'Теоретический материал'
        }),
        createMaterial({
          id: 'testing-1',
          type: 'testing',
          title: 'Тестовый материал',
          questions: [createQuestion()]
        })
      ]
    });

    setupProfileSkills();

    expect(await screen.findByText('Тестовый материал')).toBeInTheDocument();
    expect(screen.getByText('Теоретический материал')).toBeInTheDocument();
    expect(screen.getAllByText('Вопросы теста')).toHaveLength(1);
    expect(screen.getByText('Старый вопрос')).toBeInTheDocument();
    expect(screen.getByText('Старый вариант')).toBeInTheDocument();
    expect(screen.getByText('Правильный ответ')).toBeInTheDocument();
  });

  it('creates question with access token and refreshes materials', async () => {
    mockListByUserSkill
      .mockResolvedValueOnce({
        materials: [
          createMaterial({
            id: 'testing-1',
            type: 'testing',
            questions: []
          })
        ]
      })
      .mockResolvedValueOnce({
        materials: [
          createMaterial({
            id: 'testing-1',
            type: 'testing',
            questions: [createQuestion({ text: 'Новый вопрос' })]
          })
        ]
      });

    setupProfileSkills();

    await screen.findByText('Вопросы пока не добавлены');
    fireEvent.change(screen.getByLabelText('Текст вопроса'), {
      target: { value: '  Новый вопрос  ' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Добавить вопрос' }));

    await waitFor(() => {
      expect(mockCreateQuestion).toHaveBeenCalledWith('token', 'testing-1', {
        text: 'Новый вопрос'
      });
    });
    await waitFor(() => {
      expect(mockListByUserSkill).toHaveBeenCalledTimes(2);
    });
  });

  it('updates question with access token and refreshes materials', async () => {
    mockListByUserSkill
      .mockResolvedValueOnce({
        materials: [
          createMaterial({
            id: 'testing-1',
            type: 'testing',
            questions: [createQuestion()]
          })
        ]
      })
      .mockResolvedValueOnce({
        materials: [
          createMaterial({
            id: 'testing-1',
            type: 'testing',
            questions: [createQuestion({ text: 'Обновленный вопрос' })]
          })
        ]
      });

    setupProfileSkills();

    await screen.findByText('Старый вопрос');
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Редактировать вопрос Старый вопрос'
      })
    );
    fireEvent.change(screen.getByLabelText('Текст вопроса'), {
      target: { value: '  Обновленный вопрос  ' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить вопрос' }));

    await waitFor(() => {
      expect(mockUpdateQuestion).toHaveBeenCalledWith('token', 'question-1', {
        text: 'Обновленный вопрос'
      });
    });
    await waitFor(() => {
      expect(mockListByUserSkill).toHaveBeenCalledTimes(2);
    });
  });

  it('deletes question with access token and refreshes materials', async () => {
    mockListByUserSkill
      .mockResolvedValueOnce({
        materials: [
          createMaterial({
            id: 'testing-1',
            type: 'testing',
            questions: [createQuestion()]
          })
        ]
      })
      .mockResolvedValueOnce({
        materials: [
          createMaterial({
            id: 'testing-1',
            type: 'testing',
            questions: []
          })
        ]
      });

    setupProfileSkills();

    await screen.findByText('Старый вопрос');
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Удалить вопрос Старый вопрос'
      })
    );

    await waitFor(() => {
      expect(mockRemoveQuestion).toHaveBeenCalledWith('token', 'question-1');
    });
    await waitFor(() => {
      expect(mockListByUserSkill).toHaveBeenCalledTimes(2);
    });
  });

  it('creates answer option with access token and refreshes materials', async () => {
    mockListByUserSkill
      .mockResolvedValueOnce({
        materials: [
          createMaterial({
            id: 'testing-1',
            type: 'testing',
            questions: [createQuestion({ answerOptions: [] })]
          })
        ]
      })
      .mockResolvedValueOnce({
        materials: [
          createMaterial({
            id: 'testing-1',
            type: 'testing',
            questions: [
              createQuestion({
                answerOptions: [
                  createAnswerOption({
                    id: 'option-created',
                    text: 'Новый вариант'
                  })
                ]
              })
            ]
          })
        ]
      });

    setupProfileSkills();

    await screen.findByText('Варианты ответа пока не добавлены');
    fireEvent.change(screen.getByLabelText('Текст варианта'), {
      target: { value: '  Новый вариант  ' }
    });
    fireEvent.click(screen.getByLabelText('Правильный вариант'));
    fireEvent.click(screen.getByRole('button', { name: 'Добавить вариант' }));

    await waitFor(() => {
      expect(mockCreateAnswerOption).toHaveBeenCalledWith(
        'token',
        'question-1',
        {
          text: 'Новый вариант',
          isCorrect: true
        }
      );
    });
    await waitFor(() => {
      expect(mockListByUserSkill).toHaveBeenCalledTimes(2);
    });
  });

  it('updates answer option with access token and refreshes materials', async () => {
    mockListByUserSkill
      .mockResolvedValueOnce({
        materials: [
          createMaterial({
            id: 'testing-1',
            type: 'testing',
            questions: [createQuestion()]
          })
        ]
      })
      .mockResolvedValueOnce({
        materials: [
          createMaterial({
            id: 'testing-1',
            type: 'testing',
            questions: [
              createQuestion({
                answerOptions: [
                  createAnswerOption({
                    id: 'option-1',
                    text: 'Обновленный вариант',
                    isCorrect: false
                  })
                ]
              })
            ]
          })
        ]
      });

    setupProfileSkills();

    await screen.findByText('Старый вариант');
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Редактировать вариант Старый вариант'
      })
    );
    fireEvent.change(screen.getByLabelText('Текст варианта'), {
      target: { value: '  Обновленный вариант  ' }
    });
    fireEvent.click(screen.getByLabelText('Правильный вариант'));
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить вариант' }));

    await waitFor(() => {
      expect(mockUpdateAnswerOption).toHaveBeenCalledWith('token', 'option-1', {
        text: 'Обновленный вариант',
        isCorrect: false
      });
    });
    await waitFor(() => {
      expect(mockListByUserSkill).toHaveBeenCalledTimes(2);
    });
  });

  it('deletes answer option with access token and refreshes materials', async () => {
    mockListByUserSkill
      .mockResolvedValueOnce({
        materials: [
          createMaterial({
            id: 'testing-1',
            type: 'testing',
            questions: [createQuestion()]
          })
        ]
      })
      .mockResolvedValueOnce({
        materials: [
          createMaterial({
            id: 'testing-1',
            type: 'testing',
            questions: [createQuestion({ answerOptions: [] })]
          })
        ]
      });

    setupProfileSkills();

    await screen.findByText('Старый вариант');
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Удалить вариант Старый вариант'
      })
    );

    await waitFor(() => {
      expect(mockRemoveAnswerOption).toHaveBeenCalledWith('token', 'option-1');
    });
    await waitFor(() => {
      expect(mockListByUserSkill).toHaveBeenCalledTimes(2);
    });
  });

  it('does not call write operations without access token', async () => {
    mockListByUserSkill.mockResolvedValue({
      materials: [
        createMaterial({
          id: 'testing-1',
          type: 'testing',
          questions: [createQuestion({ answerOptions: [] })]
        })
      ]
    });

    setupProfileSkills({ accessToken: null });

    await screen.findByText('Старый вопрос');
    fireEvent.change(screen.getByLabelText('Название материала'), {
      target: { value: 'Материал без токена' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Добавить материал' }));

    expect(mockCreateMaterial).not.toHaveBeenCalled();
    expect(
      await screen.findByText(
        'Для управления материалами нужно войти в аккаунт'
      )
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Текст вопроса'), {
      target: { value: 'Вопрос без токена' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Добавить вопрос' }));
    expect(mockCreateQuestion).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Текст варианта'), {
      target: { value: 'Вариант без токена' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Добавить вариант' }));
    expect(mockCreateAnswerOption).not.toHaveBeenCalled();
  });
});

describe('ProfileSkills helpers', () => {
  describe('sanitizeSkillsForSubmit', () => {
    it('trims fields, resolves fallbacks and removes blank URLs', () => {
      const input: UserSkill = createSkill({
        id: 'skill-1',
        title: '  ',
        description: '   ',
        categoryId: null,
        subcategoryId: 1,
        imageUrls: [' https://image ', '   ', '']
      });
      const [result] = sanitizeSkillsForSubmit(
        [input],
        buildSubskillCategoryMap(),
        buildSubskillNameMap()
      );

      expect(result).toEqual({
        id: 'skill-1',
        title: 'Гитара',
        categoryId: 101,
        subcategoryId: 1,
        description: expect.any(String),
        imageUrls: ['https://image']
      });
      expect(result.description.length).toBeGreaterThan(0);
    });

    it('keeps provided title/description when valid and clears missing category data', () => {
      const input: UserSkill = createSkill({
        title: '  Custom ',
        description: '  Detailed ',
        subcategoryId: null
      });
      const [result] = sanitizeSkillsForSubmit(
        [input],
        buildSubskillCategoryMap(),
        buildSubskillNameMap()
      );

      expect(result.title).toBe('Custom');
      expect(result.description).toBe('Detailed');
      expect(result.categoryId).toBeNull();
      expect(result.subcategoryId).toBeNull();
    });
  });

  describe('serializeSkills', () => {
    it('returns stable JSON sorted by id', () => {
      const skillA = createSkill({ id: 'b-skill', title: 'B title' });
      const skillB = createSkill({ id: 'a-skill', title: 'A title' });

      const serialized = serializeSkills(
        [skillA, skillB],
        buildSubskillCategoryMap(),
        buildSubskillNameMap()
      );
      const parsed = JSON.parse(serialized);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe('a-skill');
      expect(parsed[1].id).toBe('b-skill');
    });
  });
});
