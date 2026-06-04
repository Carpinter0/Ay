import type { Request, Response } from 'express';
import { getSorpresasDelMes, getSorpresaById } from './sorpresas.service';
import { ok } from '../../utils/http';

export async function getSorpresasDelMesController(req: Request, res: Response): Promise<void> {
  const { uid } = req.user!;
  const sorpresas = await getSorpresasDelMes(uid);
  ok(res, sorpresas);
}

export async function getSorpresaByIdController(req: Request, res: Response): Promise<void> {
  const { uid } = req.user!;
  const { id } = req.params;
  const sorpresa = await getSorpresaById(id!, uid);
  ok(res, sorpresa);
}
