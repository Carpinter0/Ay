import { cleanEnv, str, port } from 'envalid';

export const env = cleanEnv(process.env, {
  // Database
  DATABASE_URL: str(),

  // JWT
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str({ default: '7d' }),

  // Stripe
  STRIPE_SECRET_KEY: str(),
  STRIPE_WEBHOOK_SECRET: str(),

  // App
  PORT: port({ default: 3000 }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  FRONTEND_URL: str({ default: 'http://localhost:5173' }),
  ALLOWED_ORIGINS: str({ default: 'http://localhost:5173,http://localhost:3000' }),
});
