import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MaterialDto } from '@/shared/api/materials';
import { MaterialTestRunner } from './MaterialTestRunner';

const meta: Meta<typeof MaterialTestRunner> = {
  title: 'Pages/SkillDetails/MaterialTestRunner',
  component: MaterialTestRunner,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <div style={{ width: 640, maxWidth: '100%', padding: 24 }}>
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof MaterialTestRunner>;

const choiceMaterial: MaterialDto = {
  id: 'material-test',
  userSkillId: 'user-skill-react',
  type: 'testing',
  title: 'React quiz',
  description: null,
  content: null,
  attachments: [],
  position: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  questions: [
    {
      id: 'question-1',
      materialId: 'material-test',
      type: 'single',
      text: 'Какой хук хранит локальное состояние?',
      position: 0,
      answerOptions: [
        {
          id: 'answer-1',
          questionId: 'question-1',
          text: 'useState',
          isCorrect: true,
          position: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z'
        },
        {
          id: 'answer-2',
          questionId: 'question-1',
          text: 'useMemo',
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
};

export const ChoiceQuestions: Story = {
  args: {
    material: choiceMaterial
  }
};

export const Empty: Story = {
  args: {
    material: {
      ...choiceMaterial,
      questions: []
    }
  }
};
