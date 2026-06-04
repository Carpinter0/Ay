import { Request, Response } from 'express';
import { getStripeClient } from '../../utils/stripe.js';
import prisma from '../../config/db.js';
import { ok, fail } from '../../utils/http.js';
import { env } from '../../config/env.js';

export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    fail(res, 'Missing signature', 'INVALID_SIGNATURE', 400);
    return;
  }

  let event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    fail(res, (error as Error).message, 'WEBHOOK_ERROR', 400);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        await handleSubscriptionDeleted(subscription);
        break;
      }
    }

    ok(res, { received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    ok(res, { received: true }); // Return 200 anyway to acknowledge receipt
  }
}

async function handleCheckoutSessionCompleted(session: any): Promise<void> {
  const { metadata, subscription, customer } = session;
  const { userId, planId } = metadata || {};

  if (!userId || !planId || !subscription) {
    return;
  }

  // Check if subscription already exists (idempotency)
  const existingSuscripcion = await prisma.suscripcion.findUnique({
    where: { stripeSubscriptionId: subscription },
  });

  if (existingSuscripcion) {
    return;
  }

  const stripe = getStripeClient();
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription);

  await prisma.suscripcion.create({
    data: {
      usuarioId: userId,
      planId,
      stripeSubscriptionId: subscription,
      stripeCustomerId: customer,
      estado: 'activa',
      inicioEn: new Date(stripeSubscription.current_period_start * 1000),
      proximaFacturaEn: new Date(stripeSubscription.current_period_end * 1000),
      sorpresasDesbloqueadas: [],
    },
  });

  await prisma.usuario.update({
    where: { id: userId },
    data: {
      plan: planId,
      suscripcionActivaDesde: new Date().toISOString(),
    },
  });
}

async function handleInvoicePaid(invoice: any): Promise<void> {
  const { subscription, id, amount_paid } = invoice;

  if (!subscription) {
    return;
  }

  // Check idempotency
  const existingPago = await prisma.pagoRegistro.findUnique({
    where: { stripeInvoiceId: id },
  });

  if (existingPago) {
    return;
  }

  const suscripcion = await prisma.suscripcion.findUnique({
    where: { stripeSubscriptionId: subscription },
  });

  if (!suscripcion) {
    return;
  }

  const stripe = getStripeClient();
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription);

  await prisma.pagoRegistro.create({
    data: {
      suscripcionId: suscripcion.id,
      stripeInvoiceId: id,
      monto: Math.round(amount_paid / 100),
      moneda: invoice.currency.toUpperCase(),
      estado: 'pagado',
    },
  });

  await prisma.suscripcion.update({
    where: { id: suscripcion.id },
    data: {
      proximaFacturaEn: new Date(stripeSubscription.current_period_end * 1000),
    },
  });
}

async function handleInvoicePaymentFailed(invoice: any): Promise<void> {
  const { subscription } = invoice;

  if (!subscription) {
    return;
  }

  const suscripcion = await prisma.suscripcion.findUnique({
    where: { stripeSubscriptionId: subscription },
  });

  if (!suscripcion) {
    return;
  }

  await prisma.suscripcion.update({
    where: { id: suscripcion.id },
    data: {
      estado: 'past_due',
    },
  });
}

async function handleSubscriptionDeleted(subscription: any): Promise<void> {
  const { id, customer } = subscription;

  const suscripcion = await prisma.suscripcion.findUnique({
    where: { stripeSubscriptionId: id },
  });

  if (!suscripcion) {
    return;
  }

  await prisma.suscripcion.update({
    where: { id: suscripcion.id },
    data: {
      estado: 'cancelada',
      canceladaEn: new Date(),
    },
  });

  await prisma.usuario.update({
    where: { id: suscripcion.usuarioId },
    data: {
      plan: 'GRATUITO',
    },
  });
}
