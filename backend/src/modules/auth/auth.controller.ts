import type { Request, Response } from 'express';
import { syncUser } from './auth.service';
import { ok } from '../../utils/http';

export async function syncUserController(req: Request, res: Response): Promise<void> {
  const { uid, email } = req.user!;
  const { nombre, fotoUrl } = req.body as { nombre: string; fotoUrl?: string };

  const usuario = await syncUser(uid, email, nombre, fotoUrl);
  ok(res, usuario, 200);
}
