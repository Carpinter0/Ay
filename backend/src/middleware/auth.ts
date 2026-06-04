import type { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from '../config/firebase';
import { fail } from '../utils/http';
import logger from '../utils/logger';

/**
 * Middleware that verifies the Firebase ID token from the Authorization header.
 * On success, attaches `req.user = { uid, email }` for use in controllers.
 * On failure, responds with 401 immediately.
 *
 * Usage: router.get('/protected', auth, controller)
 */
export async function auth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    fail(res, 'Missing or malformed Authorization header', 401, 'UNAUTHORIZED');
    return;
  }

  const idToken = authHeader.slice(7);

  try {
    const decoded = await verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn({ err }, 'Token verification failed');
    fail(res, 'Invalid or expired token', 401, 'TOKEN_INVALID');
  }
}
