import type { SkillDetailsMaterialGroup } from '@/pages/SkillDetails/model/types';

export type MaterialGroup = SkillDetailsMaterialGroup;

export type MaterialsSectionProps = {
  isLoading: boolean;
  error: string | null;
  materialsCount: number;
  materialGroups: MaterialGroup[];
};
