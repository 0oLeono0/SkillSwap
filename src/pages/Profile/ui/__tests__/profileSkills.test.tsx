import { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@/app/providers/auth';
import type { UserSkill } from '@/entities/User/types';
import { useFiltersBaseData } from '@/features/Filter/model/useFiltersBaseData';
import { materialsApi, type MaterialDto } from '@/shared/api/materials';
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
    remove: jest.fn()
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

  it('does not call write operations without access token', async () => {
    setupProfileSkills({ accessToken: null });

    await screen.findByText('Материалы пока не добавлены');
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
