import type { Skill } from "@/entities/Skill/types";

export interface SkillsListProps {
  skills: Skill[];
  onToggleFavorite: (id: string) => void;
  onDetailsClick?: (id: string) => void;
}

export interface GroupedSkills {
  authorId: string;
  avatar: string;
  name: string;
  city: string;
  age: number;
  about?: string;
  canTeach: Skill[];
  wantsToLearn: Skill[];
}
