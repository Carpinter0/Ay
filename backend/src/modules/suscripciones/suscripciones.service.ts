import { z } from 'zod';
import { stripe } from '../../utils/stripe';
import { firestoreDoc, firestoreGet, firestoreQuery, getServiceToken } from '../../utils/firestore';
import { PlanTierSchema, type PlanTier, type Usuario } from '../../types/usuario';
import type { Plan } from '../../types/plan';
import type { Suscripcion, PagoRegistro } from '../../types/suscripcion';
import { env } from '../../config/env';
import logger from '../../utils/logger';

export const PLAN_PRIORITY: Record<PlanTier, number> = {
  gratuito: 0,
  romantico: 1,
  apasionado: 2,
  eterno: 3,
};

// Minimal Zod schemas for runtime validation of Firestore reads
const PlanSchema = z.object({
  stripePriceId: z.string(),
  nombre: z.string(),
});

const UsuarioPartialSchema = z.object({
  stripeCustomerId: z.string().optional(),
  plan: PlanTierSchema,
});

const SuscripcionSchema = z.object({
  id: z.string(),
  usuarioUid: z.string(),
  planId: PlanTierSchema,
  stripeSubscriptionId: z.string(),
  stripeCustomerId: z.string(),
  estado: z.enum(['activa', 'cancelada', 'pausada', 'trial', 'past_due']),
  inicioEn: z.string(),
  proximaFacturaEn: z.string(),
  canceladaEn: z.string().optional(),
  sorpresasDesbloqueadasIds: z.array(z.string()),
  historialPagos: z.array(z.object({
    stripeInvoiceId: z.string(),
    monto: z.number(),
    moneda: z.string(),
    estado: z.enum(['pagado', 'fallido']),
    fecha: z.string(),
  })),
});

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

  const planRaw = await firestoreGet('planes', planId, token);
  if (!planRaw) throw new Error(`Plan not found: ${planId}`);
  const plan = PlanSchema.parse(planRaw) as Pick<Plan, 'stripePriceId' | 'nombre'>;

  const userRaw = await firestoreGet('usuarios', uid, token);
  if (!userRaw) throw new Error(`User not found: ${uid}`);
  const user = UsuarioPartialSchema.parse(userRaw) as Pick<Usuario, 'stripeCustomerId' | 'plan'>;

  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email, name: nombre, metadata: { uid } });
    stripeCustomerId = customer.id;
    await firestoreDoc('usuarios', uid, { stripeCustomerId }, token);
    logger.info({ uid, stripeCustomerId }, 'Stripe customer created');
  }

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

  const active = rows
    .map((r) => {
      const parsed = SuscripcionSchema.safeParse(r);
      return parsed.success ? parsed.data : null;
    })
    .filter((s): s is Suscripcion => s !== null)
    .find((s) => s.estado === 'activa' || s.estado === 'trial');

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
