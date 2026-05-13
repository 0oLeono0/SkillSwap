import type { Meta, StoryObj } from '@storybook/react-vite';
import { MaterialsSection } from './MaterialsSection';
import type { MaterialGroup } from './MaterialsSection.types';

const materialGroups: MaterialGroup[] = [
  {
    type: 'theory',
    label: 'Теория',
    items: [
      {
        id: 'material-theory',
        userSkillId: 'user-skill-react',
        type: 'theory',
        title: 'Основы компонентов',
        description: 'Короткая вводная перед практикой.',
        content:
          'Компонент описывает часть интерфейса и получает данные через props.',
        attachments: [],
        questions: [],
        position: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      }
    ]
  },
  {
    type: 'testing',
    label: 'Тестирование',
    items: [
      {
        id: 'material-test',
        userSkillId: 'user-skill-react',
        type: 'testing',
        title: 'Проверка знаний',
        description: null,
        content: null,
        attachments: [],
        position: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        questions: [
          {
            id: 'question-1',
            materialId: 'material-test',
            type: 'single',
            text: 'Что получает React-компонент через props?',
            position: 0,
            answerOptions: [
              {
                id: 'answer-1',
                questionId: 'question-1',
                text: 'Данные от родителя',
                isCorrect: true,
                position: 0,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z'
              },
              {
                id: 'answer-2',
                questionId: 'question-1',
                text: 'Файл сборки',
                isCorrect: false,
                position: 1,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z'
              }
            ],
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z'
          }
        ]
      }
    ]
  }
];

const meta: Meta<typeof MaterialsSection> = {
  title: 'Pages/SkillDetails/MaterialsSection',
  component: MaterialsSection,
  parameters: {
    layout: 'fullscreen'
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 32, background: 'var(--bg-color-primary)' }}>
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof MaterialsSection>;

export const Default: Story = {
  args: {
    isLoading: false,
    error: null,
    materialsCount: 2,
    materialGroups
  }
};

export const Empty: Story = {
  args: {
    isLoading: false,
    error: null,
    materialsCount: 0,
    materialGroups: []
  }
};
