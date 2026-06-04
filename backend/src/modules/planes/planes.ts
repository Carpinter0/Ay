import { Request, Response } from 'express';
import prisma from '../../config/db.js';
import { ok } from '../../utils/http.js';

export async function getPlanes(req: Request, res: Response): Promise<void> {
  const planes = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { orden: 'asc' },
  });

  ok(res, planes);
}
