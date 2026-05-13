import type { MaterialDto } from '@/shared/api/materials';

export type MaterialGroup = {
  type: MaterialDto['type'];
  label: string;
  items: MaterialDto[];
};

export type MaterialsSectionProps = {
  isLoading: boolean;
  error: string | null;
  materialsCount: number;
  materialGroups: MaterialGroup[];
};
