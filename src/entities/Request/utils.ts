import type { Request } from './types';

export const isRequestActive = (request: Request): boolean => {
  return request.status === 'accepted' || request.status === 'inProgress';
};
