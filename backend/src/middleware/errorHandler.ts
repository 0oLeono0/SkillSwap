import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../utils/httpErrors.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
      details: err.details,
    });
  }

  console.error('[errorHandler] Unhandled error:', err);
  return res.status(500).json({ message: 'Internal Server Error' });
};
