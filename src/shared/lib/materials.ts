import type { MaterialType } from '@skillswap/contracts/materials';

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
