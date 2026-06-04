import { cleanEnv, str, port } from 'envalid';

export const env = cleanEnv(process.env, {
  // Firebase
  FIREBASE_PROJECT_ID: str(),
  FIREBASE_API_KEY: str(),
  FIREBASE_WEB_API_KEY: str(),

  // Stripe
  STRIPE_SECRET_KEY: str(),
  STRIPE_WEBHOOK_SECRET: str(),

  // App
  PORT: port({ default: 3000 }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  FRONTEND_URL: str({ default: 'http://localhost:5173' }),
});
