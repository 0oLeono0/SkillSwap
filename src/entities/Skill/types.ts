export interface Skill {
  id: string;
  title: string;
  description: string;
  type: 'teach' | 'learn';
  category: string;
  imageUrl?: string;
  tags: string[];
  authorId: number;
  isFavorite?: boolean;
}
