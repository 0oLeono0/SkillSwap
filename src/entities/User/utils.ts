import type { User } from './types';
import { db } from '@/api/mockData';

export const getUserName = (user: User): string => user.name;

export const getUserAge = (user: User): number => {
  if (!user.birthDate) {
    return 0;
  }

  const birth = new Date(user.birthDate);
  if (Number.isNaN(birth.getTime())) {
    return 0;
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const getUserCity = (user: User): string => {
  if (typeof user.cityId !== 'number') {
    return '�?�� �?��������?';
  }
  const city = db.cities.find((c) => c.id === user.cityId);
  return city ? city.name : '�?�� �?��������?';
};
