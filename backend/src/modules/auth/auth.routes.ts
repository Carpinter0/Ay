import { Router } from 'express';
import { z } from 'zod';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { syncUserController } from './auth.controller';

const router = Router();

const syncSchema = z.object({
  nombre: z.string().min(1).max(100),
  fotoUrl: z.string().url().optional(),
});

// POST /api/v1/auth/sync — upsert user in Firestore after Firebase login
router.post('/sync', auth, validate(syncSchema), syncUserController);

export default router;
