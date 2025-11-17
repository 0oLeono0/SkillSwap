export interface Skill {
  id: string;
  title: string;
  description: string;
  type: 'teach' | 'learn';
  category: string;
  imageUrl?: string;
  imageUrls?: string[];
  authorAvatarUrl?: string;
  tags: string[];
  authorId: string;
  isFavorite?: boolean;
}
