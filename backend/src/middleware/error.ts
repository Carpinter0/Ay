import { Request, Response, NextFunction } from 'express';
import { fail } from '../utils/http.js';
import pino from 'pino';

const logger = pino();

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof ApiError) {
    fail(res, err.message, err.code, err.statusCode);
    return;
  }

  if (err instanceof Error) {
    logger.error(err);
    fail(res, err.message, 'INTERNAL_ERROR', 500);
    return;
  }

  logger.error('Unknown error:', err);
  fail(res, 'Unknown error', 'INTERNAL_ERROR', 500);
}
