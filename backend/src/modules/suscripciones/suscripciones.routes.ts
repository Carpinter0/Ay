import { Router } from 'express';
import { z } from 'zod';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  checkoutController,
  getMiaSuscripcionController,
  cancelarController,
} from './suscripciones.controller';

const router = Router();

const checkoutSchema = z.object({
  planId: z.enum(['romantico', 'apasionado', 'eterno']),
  nombre: z.string().min(1).max(100),
});

// POST /api/v1/suscripciones/checkout
router.post('/checkout', auth, validate(checkoutSchema), checkoutController);

// GET /api/v1/suscripciones/mia
router.get('/mia', auth, getMiaSuscripcionController);

// POST /api/v1/suscripciones/cancelar
router.post('/cancelar', auth, cancelarController);

export default router;
