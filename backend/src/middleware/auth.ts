import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { IDENTITY_TOOLKIT_URL } from '../config/firebase.js';
import { Usuario } from '../types/usuario.js';

export async function verifyIdToken(token: string): Promise<Usuario | null> {
  try {
    const response = await fetch(`${IDENTITY_TOOLKIT_URL}/accounts:lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: token,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { users?: Array<{ localId: string; email: string; displayName?: string; photoUrl?: string }> };
    const user = data.users?.[0];

    if (!user) {
      return null;
    }

    // Return a minimal user object; the full document will be fetched from Firestore in services
    return {
      uid: user.localId,
      email: user.email,
      nombre: user.displayName || '',
      fotoUrl: user.photoUrl,
      plan: 'gratuito',
      creadoEn: new Date().toISOString(),
      isActive: true,
    };
  } catch (error) {
    return null;
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const user = await verifyIdToken(token);

  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid token' });
    return;
  }

  req.user = user;
  next();
}
