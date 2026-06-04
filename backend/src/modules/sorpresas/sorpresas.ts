import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/db.js';
import { ok, fail, paginated } from '../../utils/http.js';
import { ApiError } from '../../middleware/error.js';

const pageSchema = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('20').transform(Number),
});

const planPriority: Record<string, number> = {
  GRATUITO: 0,
  ROMANTICO: 1,
  APASIONADO: 2,
  ETERNO: 3,
};

export async function getSorpresas(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  }

  const { page, limit } = pageSchema.parse(req.query);

  const user = await prisma.usuario.findUnique({
    where: { id: req.user.sub },
  });

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const userPriority = planPriority[user.plan] || 0;

  const total = await prisma.sorpresa.count({
    where: {
      isActive: true,
      planMinimo: {
        in: Object.keys(planPriority).filter((plan) => planPriority[plan] <= userPriority),
      },
    },
  });

  const sorpresas = await prisma.sorpresa.findMany({
    where: {
      isActive: true,
      planMinimo: {
        in: Object.keys(planPriority).filter((plan) => planPriority[plan] <= userPriority),
      },
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { creadoEn: 'desc' },
  });

  paginated(res, sorpresas, page, limit, total);
}

export async function getSorpresaById(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  }

  const { id } = req.params;

  const user = await prisma.usuario.findUnique({
    where: { id: req.user.sub },
  });

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const sorpresa = await prisma.sorpresa.findUnique({
    where: { id },
  });

  if (!sorpresa) {
    throw new ApiError(404, 'SORPRESA_NOT_FOUND', 'Surprise not found');
  }

  const planPriority_: Record<string, number> = {
    GRATUITO: 0,
    ROMANTICO: 1,
    APASIONADO: 2,
    ETERNO: 3,
  };

  const userPriority = planPriority_[user.plan] || 0;
  const sorpresaPriority = planPriority_[sorpresa.planMinimo] || 0;

  if (userPriority < sorpresaPriority) {
    throw new ApiError(403, 'PLAN_REQUIRED', 'Plan upgrade required');
  }

  ok(res, sorpresa);
}

export async function getSorpresasDelMes(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  }

  const user = await prisma.usuario.findUnique({
    where: { id: req.user.sub },
  });

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const plan = await prisma.plan.findUnique({
    where: { id: user.plan },
  });

  if (!plan) {
    throw new ApiError(404, 'PLAN_NOT_FOUND', 'Plan not found');
  }

  const planPriority_: Record<string, number> = {
    GRATUITO: 0,
    ROMANTICO: 1,
    APASIONADO: 2,
    ETERNO: 3,
  };

  const userPriority = planPriority_[user.plan] || 0;

  const sorpresas = await prisma.sorpresa.findMany({
    where: {
      isActive: true,
      planMinimo: {
        in: Object.keys(planPriority_).filter((p) => planPriority_[p] <= userPriority),
      },
    },
    take: plan.sorpresasMensuales,
    orderBy: { creadoEn: 'desc' },
  });

  ok(res, sorpresas);
}
