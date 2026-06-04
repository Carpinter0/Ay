import type { Request, Response } from 'express';
import { getActivePlanes } from './planes.service';
import { ok } from '../../utils/http';

export async function getPlanesController(_req: Request, res: Response): Promise<void> {
  const planes = await getActivePlanes();
  ok(res, planes);
}
