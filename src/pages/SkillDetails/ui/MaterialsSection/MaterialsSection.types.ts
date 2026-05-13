import type { SkillDetailsMaterialGroup } from '@/pages/SkillDetails/model';

export type MaterialGroup = SkillDetailsMaterialGroup;

export type MaterialsSectionProps = {
  isLoading: boolean;
  error: string | null;
  materialsCount: number;
  materialGroups: MaterialGroup[];
};
