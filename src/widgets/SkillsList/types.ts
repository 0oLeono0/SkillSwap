import type { Skill } from "@/entities/Skill/types";

export interface SkillsListProps {
  skills: Skill[];
  onToggleFavorite: (id: number) => void;
  onDetailsClick?: (id: number) => void;
}

export interface GroupedSkills {
  authorId: number;
  avatar: string;
  name: string;
  city: string;
  age: number;
  about?: string;
  canTeach: Skill[];
  wantsToLearn: Skill[];
}
