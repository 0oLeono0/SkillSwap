import type { User } from './types';

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

const fallbackCityName = 'گ"گ?‘?گ?گ? گ?گç ‘?گَگّگْگّگ?';

export const getUserCity = (
  user: User,
  cityNameById?: Map<number, string>,
): string => {
  if (typeof user.cityId !== 'number') {
    return fallbackCityName;
  }
  if (!cityNameById) {
    return fallbackCityName;
  }
  return cityNameById.get(user.cityId) ?? fallbackCityName;
};
