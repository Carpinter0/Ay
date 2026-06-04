import { Router } from 'express';
import express from 'express';
import type { Request, Response } from 'express';
import { handleStripeWebhook } from './webhook.handler';
import logger from '../../utils/logger';

const router = Router();

/**
 * CRITICAL: This route uses express.raw() as the body parser.
 * Stripe's signature verification requires the raw Buffer, NOT a parsed JSON object.
 * Using express.json() here will break webhook signature verification.
 */
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['stripe-signature'];

    if (!signature || typeof signature !== 'string') {
      res.status(400).json({ success: false, error: 'Missing Stripe-Signature header' });
      return;
    }

    try {
      await handleStripeWebhook(req.body as Buffer, signature);
      res.status(200).json({ received: true });
    } catch (err) {
      logger.error({ err }, 'Webhook processing failed');
      res.status(400).json({ success: false, error: String(err) });
    }
  }
);

export default router;
