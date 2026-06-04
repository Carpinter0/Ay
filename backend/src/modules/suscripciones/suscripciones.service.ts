import { stripe } from '../../utils/stripe';
import { firestoreDoc, firestoreGet, firestoreQuery, getServiceToken } from '../../utils/firestore';
import type { Usuario, PlanTier } from '../../types/usuario';
import type { Plan } from '../../types/plan';
import type { Suscripcion } from '../../types/suscripcion';
import { env } from '../../config/env';
import logger from '../../utils/logger';

const PLAN_PRIORITY: Record<PlanTier, number> = {
  gratuito: 0,
  romantico: 1,
  apasionado: 2,
  eterno: 3,
};

/**
 * Creates a Stripe Checkout session for a new subscription.
 * Also creates (or retrieves) the Stripe customer for the user.
 */
export async function createCheckoutSession(
  uid: string,
  email: string,
  nombre: string,
  planId: PlanTier
): Promise<{ checkoutUrl: string }> {
  const token = await getServiceToken();

  // 1. Get the plan's stripePriceId
  const planDoc = await firestoreGet('planes', planId, token);
  if (!planDoc) throw new Error(`Plan not found: ${planId}`);
  const plan = planDoc as unknown as Plan;

  // 2. Get or create Stripe customer
  const userDoc = await firestoreGet('usuarios', uid, token);
  const user = userDoc as unknown as Usuario;
  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email, name: nombre, metadata: { uid } });
    stripeCustomerId = customer.id;
    await firestoreDoc('usuarios', uid, { stripeCustomerId }, token);
    logger.info({ uid, stripeCustomerId }, 'Stripe customer created');
  }

  // 3. Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${env.FRONTEND_URL}/dashboard?checkout=success`,
    cancel_url: `${env.FRONTEND_URL}/planes?checkout=cancelled`,
    metadata: { usuarioUid: uid, planId },
  });

  if (!session.url) throw new Error('Stripe did not return a checkout URL');

  return { checkoutUrl: session.url };
}

/**
 * Returns the user's current active (or trial) subscription, or null.
 */
export async function getUserSuscripcion(uid: string): Promise<Suscripcion | null> {
  const token = await getServiceToken();

  const rows = await firestoreQuery(
    'suscripciones',
    { filters: [{ field: 'usuarioUid', op: 'EQUAL', value: uid }] },
    token
  );

  const active = (rows as unknown as Suscripcion[]).find(
    (s) => s.estado === 'activa' || s.estado === 'trial'
  );

  return active ?? null;
}

/**
 * Cancels a subscription at the end of the current billing period.
 */
export async function cancelSuscripcion(uid: string): Promise<void> {
  const suscripcion = await getUserSuscripcion(uid);
  if (!suscripcion) throw new Error('No active subscription found');

  await stripe.subscriptions.update(suscripcion.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  const token = await getServiceToken();
  await firestoreDoc(
    'suscripciones',
    suscripcion.id,
    { estado: 'cancelada', canceladaEn: new Date().toISOString() },
    token
  );

  logger.info({ uid, subscriptionId: suscripcion.stripeSubscriptionId }, 'Subscription cancelled');
}

export { PLAN_PRIORITY };
