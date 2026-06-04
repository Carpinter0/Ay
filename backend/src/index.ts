import 'express-async-errors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middleware/error';
import logger from './utils/logger';

// Route modules
import authRoutes from './modules/auth/auth.routes';
import planesRoutes from './modules/planes/planes.routes';
import suscripcionesRoutes from './modules/suscripciones/suscripciones.routes';
import sorpresasRoutes from './modules/sorpresas/sorpresas.routes';
import webhookRoutes from './modules/webhook/webhook.routes';

const app = express();

// ---------------------------------------------------------------------------
// Body parsers
// NOTE: express.raw() for the webhook route is applied inside webhook.routes.ts
// so it only applies to that specific endpoint.
// ---------------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// CORS — allow requests from the configured frontend URL
// ---------------------------------------------------------------------------
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', env.FRONTEND_URL);
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// ---------------------------------------------------------------------------
// Health check — used by Cloud Run and load balancers
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'ay-amor-backend', env: env.NODE_ENV });
});

// ---------------------------------------------------------------------------
// API routes — all prefixed with /api/v1
// ---------------------------------------------------------------------------
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/planes', planesRoutes);
app.use('/api/v1/suscripciones', suscripcionesRoutes);
app.use('/api/v1/sorpresas', sorpresasRoutes);

// Webhook must be mounted BEFORE the global json middleware catches the body.
// express.raw() is applied per-route inside webhook.routes.ts.
app.use('/api/v1/webhook', webhookRoutes);

// ---------------------------------------------------------------------------
// 404 handler — catches any unmatched route
// ---------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', code: 'NOT_FOUND' });
});

// ---------------------------------------------------------------------------
// Global error handler — must be registered last
// ---------------------------------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(env.PORT, () => {
  logger.info(`♥️  Ay Amor backend running on port ${env.PORT} [${env.NODE_ENV}]`);
});

export default app;
