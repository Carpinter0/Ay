import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { fail } from '../utils/http.js';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      fail(res, 'Validation error', 'VALIDATION_ERROR', 400);
    }
  };
}
