export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const createBadRequest = (message: string, details?: unknown) => new HttpError(400, message, details);
export const createUnauthorized = (message = 'Unauthorized') => new HttpError(401, message);
export const createForbidden = (message = 'Forbidden') => new HttpError(403, message);
export const createConflict = (message = 'Conflict') => new HttpError(409, message);
export const createNotFound = (message = 'Not Found') => new HttpError(404, message);
