import type { Response } from 'express';

/** Sends a successful JSON response. */
export function ok<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data });
}

/** Sends an error JSON response. */
export function fail(res: Response, error: string, status = 500, code?: string): void {
  res.status(status).json({ success: false, error, ...(code ? { code } : {}) });
}

/** Sends a paginated JSON response. */
export function paginated<T>(
  res: Response,
  data: T[],
  pagination: { page: number; perPage: number; total: number }
): void {
  res.status(200).json({ success: true, data, pagination });
}
