import type {
  MaterialType,
  TestQuestionType
} from '@skillswap/contracts/materials';

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  theory: 'Теория',
  practice: 'Практика',
  testing: 'Тестирование'
};

export const MATERIAL_TYPE_OPTIONS: Array<{
  value: MaterialType;
  label: string;
}> = [
  { value: 'theory', label: MATERIAL_TYPE_LABELS.theory },
  { value: 'practice', label: MATERIAL_TYPE_LABELS.practice },
  { value: 'testing', label: MATERIAL_TYPE_LABELS.testing }
];

export const MATERIAL_TYPE_ORDER: MaterialType[] = [
  'theory',
  'practice',
  'testing'
];

export const TEST_QUESTION_TYPE_LABELS: Record<TestQuestionType, string> = {
  single: 'Один правильный ответ',
  multiple: 'Несколько правильных ответов',
  text: 'Написать текст',
  gap: 'Вставить слово',
  image: 'Загрузить фото'
};

export const TEST_QUESTION_TYPE_OPTIONS: Array<{
  value: TestQuestionType;
  label: string;
}> = [
  { value: 'single', label: TEST_QUESTION_TYPE_LABELS.single },
  { value: 'multiple', label: TEST_QUESTION_TYPE_LABELS.multiple },
  { value: 'text', label: TEST_QUESTION_TYPE_LABELS.text },
  { value: 'gap', label: TEST_QUESTION_TYPE_LABELS.gap },
  { value: 'image', label: TEST_QUESTION_TYPE_LABELS.image }
];

export const normalizeTestQuestionType = (value: unknown): TestQuestionType =>
  TEST_QUESTION_TYPE_OPTIONS.some((option) => option.value === value)
    ? (value as TestQuestionType)
    : 'single';

export const isChoiceQuestionType = (value: unknown) => {
  const questionType = normalizeTestQuestionType(value);
  return questionType === 'single' || questionType === 'multiple';
};

export const isTextQuestionType = (value: unknown) => {
  const questionType = normalizeTestQuestionType(value);
  return questionType === 'text' || questionType === 'gap';
};
