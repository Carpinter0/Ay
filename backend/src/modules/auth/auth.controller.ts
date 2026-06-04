import { z } from 'zod';
import type { Request, Response } from 'express';
import { syncUser } from './auth.service';
import { ok, fail } from '../../utils/http';

const syncBodySchema = z.object({
  nombre: z.string().min(1, 'nombre is required'),
  fotoUrl: z.string().url().optional(),
});

export async function syncUserController(req: Request, res: Response): Promise<void> {
  const parsed = syncBodySchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, parsed.error.errors.map((e) => e.message).join(', '), 400);
    return;
  }

  const { uid, email } = req.user!;
  const { nombre, fotoUrl } = parsed.data;

  const usuario = await syncUser(uid, email, nombre, fotoUrl);
  ok(res, usuario, 200);
}
