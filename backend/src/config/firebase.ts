import { env } from './env.js';

export const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;

export const IDENTITY_TOOLKIT_URL = 'https://identitytoolkit.googleapis.com/v1';

export async function getAccessToken(): Promise<string> {
  // Note: In production, use Application Default Credentials or service account.
  // For now, this is a placeholder. In Cloud Run, the environment will provide
  // automatic credentials via the metadata server.
  throw new Error('getAccessToken not implemented. Use Cloud Run service account.');
}
