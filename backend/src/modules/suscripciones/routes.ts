import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { checkout, getMySuscripcion, cancelSuscripcion, getSuscripcionStatus } from './suscripciones.js';
import { z } from 'zod';

const router = Router();

const checkoutSchema = z.object({
  planId: z.enum(['ROMANTICO', 'APASIONADO', 'ETERNO']),
});

const cancelSchema = z.object({
  reason: z.string().optional(),
});

router.post('/checkout', authMiddleware, validate(checkoutSchema), (req, res, next) => {
  checkout(req, res).catch(next);
});

router.get('/mia', authMiddleware, (req, res, next) => {
  getMySuscripcion(req, res).catch(next);
});

router.get('/status', authMiddleware, (req, res, next) => {
  getSuscripcionStatus(req, res).catch(next);
});

router.post('/cancelar', authMiddleware, validate(cancelSchema), (req, res, next) => {
  cancelSuscripcion(req, res).catch(next);
});

export default router;
