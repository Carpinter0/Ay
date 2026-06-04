import express from 'express';
import 'express-async-errors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';
import authRoutes from './modules/auth/routes.js';
import planesRoutes from './modules/planes/routes.js';
import sorpresasRoutes from './modules/sorpresas/routes.js';
import suscripcionesRoutes from './modules/suscripciones/routes.js';
import webhookRoutes from './modules/webhook/routes.js';
import cors from 'cors';

const app = express();

// CORS middleware
const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Body parser - but webhook must use raw
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/planes', planesRoutes);
app.use('/api/v1/sorpresas', sorpresasRoutes);
app.use('/api/v1/suscripciones', suscripcionesRoutes);
app.use('/api/v1/webhook', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

export default app;
