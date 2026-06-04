import type { Request, Response, NextFunction } from 'express';
import { fail } from '../utils/http';
import logger from '../utils/logger';

/**
 * Global error handler. Must be registered LAST in the Express middleware chain.
 * Catches any error thrown (or passed to `next(err)`) in route handlers.
 *
 * Maps known error types to appropriate HTTP status codes.
 * Falls back to 500 for unexpected errors and avoids leaking stack traces
 * in production.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');

  if (res.headersSent) return;

  if (err instanceof Error) {
    const msg = err.message.toLowerCase();

    if (msg.includes('unauthorized') || msg.includes('token')) {
      fail(res, err.message, 401, 'UNAUTHORIZED');
      return;
    }
    if (msg.includes('not found')) {
      fail(res, err.message, 404, 'NOT_FOUND');
      return;
    }
    if (msg.includes('plan upgrade required')) {
      fail(res, err.message, 403, 'PLAN_REQUIRED');
      return;
    }
  }

  const message =
    process.env['NODE_ENV'] === 'production'
      ? 'An unexpected error occurred'
      : err instanceof Error
        ? err.message
        : String(err);

  fail(res, message, 500, 'INTERNAL_ERROR');
}
