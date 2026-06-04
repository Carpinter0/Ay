import Stripe from 'stripe';
import { env } from '../config/env';

/**
 * Stripe client singleton.
 * Initialised once and reused across all modules to avoid creating
 * multiple instances (each of which would open its own HTTP keep-alive pool).
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
  typescript: true,
});
