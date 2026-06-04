import { env } from './env';

export const FIRESTORE_BASE_URL =
  `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;

export const IDENTITY_TOOLKIT_URL =
  `https://identitytoolkit.googleapis.com/v1/accounts`;

/**
 * Verifies a Firebase ID token using the Identity Toolkit REST API.
 * Returns the decoded token payload (uid, email, etc.) on success.
 * Throws if the token is invalid or expired.
 */
export async function verifyIdToken(idToken: string): Promise<{ uid: string; email: string }> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_WEB_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!res.ok) {
    throw new Error('Invalid or expired Firebase ID token');
  }

  const body = (await res.json()) as { users?: Array<{ localId: string; email: string }> };
  const user = body.users?.[0];

  if (!user) {
    throw new Error('No user found for the provided token');
  }

  return { uid: user.localId, email: user.email };
}
