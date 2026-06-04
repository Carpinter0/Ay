import type Stripe from 'stripe';
import { stripe } from '../../utils/stripe';
import { env } from '../../config/env';
import { firestoreDoc, firestoreGet, getServiceToken } from '../../utils/firestore';
import type { PlanTier } from '../../types/usuario';
import type { Suscripcion, PagoRegistro } from '../../types/suscripcion';
import logger from '../../utils/logger';

/**
 * Dispatches incoming Stripe webhook events to the appropriate handler.
 * Signature verification happens here before any processing.
 *
 * IMPORTANT: This handler requires the raw request body (Buffer).
 * The webhook route uses express.raw() — NOT express.json().
 */
export async function handleStripeWebhook(
  rawBody: Buffer,
  signature: string
): Promise<void> {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${String(err)}`);
  }

  logger.info({ type: event.type, id: event.id }, 'Stripe webhook received');

  switch (event.type) {
    case 'checkout.session.completed':
      await onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'invoice.paid':
      await onInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_failed':
      await onInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    case 'customer.subscription.deleted':
      await onSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    default:
      logger.info({ type: event.type }, 'Unhandled Stripe event type — skipping');
  }
}

async function onCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const uid = session.metadata?.['usuarioUid'];
  const planId = session.metadata?.['planId'] as PlanTier | undefined;
  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;

  if (!uid || !planId || !subscriptionId) {
    logger.warn({ sessionId: session.id }, 'checkout.session.completed missing metadata');
    return;
  }

  const token = await getServiceToken();
  const stripeCustomerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id ?? '';

  // Retrieve full subscription for billing dates
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const item = sub.items.data[0];
  const proximaFacturaEn = item
    ? new Date((sub.current_period_end) * 1000).toISOString()
    : new Date().toISOString();

  const suscripcion: Suscripcion = {
    id: subscriptionId,
    usuarioUid: uid,
    planId,
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId,
    estado: 'activa',
    inicioEn: new Date().toISOString(),
    proximaFacturaEn,
    sorpresasDesbloqueadasIds: [],
    historialPagos: [],
  };

  await firestoreDoc('suscripciones', subscriptionId, suscripcion as unknown as Record<string, unknown>, token);
  await firestoreDoc('usuarios', uid, {
    plan: planId,
    suscripcionActivaDesde: new Date().toISOString(),
    stripeCustomerId,
  }, token);

  logger.info({ uid, planId, subscriptionId }, 'Checkout completed — subscription activated');
}

async function onInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id;

  if (!subscriptionId) return;

  const token = await getServiceToken();
  const docData = await firestoreGet('suscripciones', subscriptionId, token);
  if (!docData) return;

  const suscripcion = docData as unknown as Suscripcion;

  // Idempotency: skip if this invoice was already processed
  const alreadyRecorded = suscripcion.historialPagos?.some(
    (p) => p.stripeInvoiceId === invoice.id
  );
  if (alreadyRecorded) {
    logger.info({ invoiceId: invoice.id }, 'Invoice already recorded — skipping');
    return;
  }

  const pago: PagoRegistro = {
    stripeInvoiceId: invoice.id,
    monto: invoice.amount_paid,
    moneda: invoice.currency,
    estado: 'pagado',
    fecha: new Date().toISOString(),
  };

  const updatedHistorial = [...(suscripcion.historialPagos ?? []), pago];
  const proximaFacturaEn = invoice.lines.data[0]?.period?.end
    ? new Date(invoice.lines.data[0].period.end * 1000).toISOString()
    : suscripcion.proximaFacturaEn;

  await firestoreDoc(
    'suscripciones',
    subscriptionId,
    { historialPagos: updatedHistorial, proximaFacturaEn },
    token
  );

  logger.info({ subscriptionId, invoiceId: invoice.id }, 'Invoice paid — history updated');
}

async function onInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id;

  if (!subscriptionId) return;

  const token = await getServiceToken();
  await firestoreDoc('suscripciones', subscriptionId, { estado: 'past_due' }, token);

  logger.warn({ subscriptionId, invoiceId: invoice.id }, 'Invoice payment failed — marked past_due');
}

async function onSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const token = await getServiceToken();
  const uid = sub.metadata?.['uid'];

  await firestoreDoc(
    'suscripciones',
    sub.id,
    { estado: 'cancelada', canceladaEn: new Date().toISOString() },
    token
  );

  if (uid) {
    await firestoreDoc('usuarios', uid, { plan: 'gratuito' as PlanTier }, token);
  }

  logger.info({ subscriptionId: sub.id, uid }, 'Subscription deleted — plan reverted to gratuito');
}
