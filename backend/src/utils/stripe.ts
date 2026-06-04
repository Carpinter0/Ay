import Stripe from 'stripe';
import { env } from '../config/env.js';

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
    });
  }
  return stripeInstance;
}
