import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import { fail } from '../utils/http';

/**
 * Factory that returns an Express middleware validating `req.body`
 * against the provided Zod schema.
 *
 * On success, replaces `req.body` with the parsed (coerced) value.
 * On failure, responds 422 with the first Zod issue message.
 *
 * Usage:
 *   import { z } from 'zod';
 *   const schema = z.object({ planId: z.enum(['romantico','apasionado','eterno']) });
 *   router.post('/checkout', auth, validate(schema), checkoutController);
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const firstError = (result.error as ZodError).errors[0];
      const message = firstError
        ? `${firstError.path.join('.')}: ${firstError.message}`
        : 'Validation error';
      fail(res, message, 422, 'VALIDATION_ERROR');
      return;
    }

    req.body = result.data;
    next();
  };
}
