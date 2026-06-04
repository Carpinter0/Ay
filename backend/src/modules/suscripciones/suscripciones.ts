import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/db.js';
import { getStripeClient } from '../../utils/stripe.js';
import { ok, fail } from '../../utils/http.js';
import { ApiError } from '../../middleware/error.js';
import { env } from '../../config/env.js';

const checkoutSchema = z.object({
  planId: z.enum(['ROMANTICO', 'APASIONADO', 'ETERNO']),
});

const cancelSchema = z.object({
  reason: z.string().optional(),
});

export async function checkout(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  }

  const { planId } = checkoutSchema.parse(req.body);

  const user = await prisma.usuario.findUnique({
    where: { id: req.user.sub },
  });

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new ApiError(404, 'PLAN_NOT_FOUND', 'Plan not found');
  }

  const stripe = getStripeClient();

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.nombre,
      metadata: {
        userId: user.id,
      },
    });
    customerId = customer.id;

    await prisma.usuario.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.FRONTEND_URL}/planes?canceled=true`,
    metadata: {
      userId: user.id,
      planId,
    },
  });

  if (!session.url) {
    throw new ApiError(500, 'STRIPE_ERROR', 'Failed to create checkout session');
  }

  ok(res, { checkoutUrl: session.url });
}

export async function getMySuscripcion(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  }

  const suscripcion = await prisma.suscripcion.findFirst({
    where: {
      usuarioId: req.user.sub,
      estado: 'activa',
    },
    include: {
      plan: true,
      pagos: true,
    },
  });

  if (!suscripcion) {
    ok(res, null);
    return;
  }

  ok(res, suscripcion);
}

export async function cancelSuscripcion(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  }

  const { reason } = cancelSchema.parse(req.body);

  const suscripcion = await prisma.suscripcion.findFirst({
    where: {
      usuarioId: req.user.sub,
      estado: 'activa',
    },
  });

  if (!suscripcion) {
    throw new ApiError(404, 'SUSCRIPCION_NOT_FOUND', 'No active subscription found');
  }

  const stripe = getStripeClient();

  await stripe.subscriptions.update(suscripcion.stripeSubscriptionId, {
    cancel_at_period_end: true,
    metadata: {
      cancelReason: reason || 'No reason provided',
    },
  });

  await prisma.suscripcion.update({
    where: { id: suscripcion.id },
    data: {
      estado: 'cancelada',
      canceladaEn: new Date(),
    },
  });

  ok(res, { message: 'Subscription canceled' });
}

export async function getSuscripcionStatus(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  }

  const user = await prisma.usuario.findUnique({
    where: { id: req.user.sub },
    include: {
      suscripciones: {
        where: { estado: 'activa' },
        include: { plan: true },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
  }

  ok(res, {
    plan: user.plan,
    activeSuscripcion: user.suscripciones[0] || null,
  });
}
