import type { ApiUser } from '@/api/types';
import type { User } from './types';
import { db } from '@/api/mockData';

export const mapApiToUser = (apiUser: ApiUser): User => {
  const city = db.cities.find((c) => c.name === apiUser.city);
  const cityId = city ? city.id : 0;

  return {
    id: apiUser.id,
    name: apiUser.name,
    avatarUrl: apiUser.avatarUrl,
    cityId,
    birthDate: apiUser.birthDate,
    gender: apiUser.gender,
    bio: apiUser.bio,
    teachableSkills: apiUser.teachableSkills,
    learningSkills: apiUser.learningSkills
  };
};
