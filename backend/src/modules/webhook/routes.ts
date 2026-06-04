import { Router } from 'express';
import { handleStripeWebhook } from './webhook.js';
import express from 'express';

const router = Router();

// Important: Stripe webhook requires raw body, not JSON parsed
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    handleStripeWebhook(req, res).catch(next);
  },
);

export default router;
