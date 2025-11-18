import type { Gender } from '@/shared/types/gender';

const ALLOWED_GENDERS: Gender[] = ['Мужской', 'Женский'];

export const formatBirthDate = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const toISODate = (value: string): string => {
  const [day, month, year] = value.split(/[./-]/).map(Number);
  if (!day || !month || !year) {
    return value;
  }
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
};

export const normalizeGenderInput = (value: string): Gender | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const lowerValue = trimmed.toLowerCase();
  const match = ALLOWED_GENDERS.find((gender) => gender.toLowerCase() === lowerValue);
  return match ?? null;
};

