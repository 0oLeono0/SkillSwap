import type { User } from './types';
import { db } from '@/api/mockData';

export const getUserName = (user: User): string => user.name;

export const getUserAge = (user: User): number => {
  const [year, month, day] = user.birthDate.split('-').map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const getUserCity = (user: User): string => {
  const city = db.cities.find((c) => c.id === user.cityId);
  return city ? city.name : '';
};
