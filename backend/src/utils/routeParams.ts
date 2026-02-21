import { createBadRequest, createNotFound } from './httpErrors.js';

type ParamsInput = Record<string, unknown> | undefined;

export const requireStringParam = (
  params: ParamsInput,
  key: string,
  message: string
): string => {
  const value = params?.[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw createBadRequest(message);
  }

  return value;
};

export const parseNumberParamOrNotFound = (
  params: ParamsInput,
  key: string,
  notFoundMessage: string
): number => {
  const parsed = Number(params?.[key]);
  if (!Number.isFinite(parsed)) {
    throw createNotFound(notFoundMessage);
  }

  return parsed;
};
