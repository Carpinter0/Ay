import { cleanEnv, str, port, url } from 'envalid';

/**
 * Validates all required environment variables at startup.
 * If any are missing or malformed, the process exits with a clear error message.
 * This prevents silent failures caused by undefined env vars at runtime.
 */
export const env = cleanEnv(process.env, {
  FIREBASE_PROJECT_ID: str({ docs: 'Firebase Console > Project Settings > General' }),
  FIREBASE_WEB_API_KEY: str({ docs: 'Firebase Console > Project Settings > General' }),
  STRIPE_SECRET_KEY: str({ docs: 'Stripe Dashboard > Developers > API Keys' }),
  STRIPE_WEBHOOK_SECRET: str({ docs: 'Stripe Dashboard > Developers > Webhooks' }),
  PORT: port({ default: 3000 }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  FRONTEND_URL: url({ default: 'http://localhost:5173' }),
});
