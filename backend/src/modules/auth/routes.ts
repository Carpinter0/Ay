import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { register, login, sync, getCurrentUser } from './auth.js';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const syncSchema = z.object({
  nombre: z.string().min(1),
  fotoUrl: z.string().optional(),
});

router.post('/register', validate(registerSchema), (req, res, next) => {
  register(req, res).catch(next);
});

router.post('/login', validate(loginSchema), (req, res, next) => {
  login(req, res).catch(next);
});

router.post('/sync', authMiddleware, validate(syncSchema), (req, res, next) => {
  sync(req, res).catch(next);
});

router.get('/me', authMiddleware, (req, res, next) => {
  getCurrentUser(req, res).catch(next);
});

export default router;
