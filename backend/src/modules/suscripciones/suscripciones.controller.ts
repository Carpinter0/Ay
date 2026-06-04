import type { Request, Response } from 'express';
import {
  createCheckoutSession,
  getUserSuscripcion,
  cancelSuscripcion,
} from './suscripciones.service';
import { ok, fail } from '../../utils/http';

export async function checkoutController(req: Request, res: Response): Promise<void> {
  const { uid, email } = req.user!;
  const { planId, nombre } = req.body as { planId: string; nombre: string };

  const result = await createCheckoutSession(uid, email, nombre, planId as any);
  ok(res, result);
}

export async function getMiaSuscripcionController(req: Request, res: Response): Promise<void> {
  const { uid } = req.user!;
  const suscripcion = await getUserSuscripcion(uid);
  ok(res, suscripcion);
}

export async function cancelarController(req: Request, res: Response): Promise<void> {
  const { uid } = req.user!;
  await cancelSuscripcion(uid);
  ok(res, { message: 'Subscription will be cancelled at the end of the billing period' });
}
