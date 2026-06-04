import { firestoreDoc, firestoreGet, getServiceToken } from '../../utils/firestore';
import type { Usuario, PlanTier } from '../../types/usuario';
import logger from '../../utils/logger';

/**
 * Upserts a user document in Firestore on first login or subsequent syncs.
 * Creates the document with plan="gratuito" if it does not exist.
 * If it exists, only updates mutable fields (nombre, fotoUrl).
 */
export async function syncUser(
  uid: string,
  email: string,
  nombre: string,
  fotoUrl?: string
): Promise<Usuario> {
  const token = await getServiceToken();
  const existing = await firestoreGet('usuarios', uid, token);

  if (existing) {
    // Only update mutable presentation fields
    const updates: Partial<Usuario> = { nombre };
    if (fotoUrl !== undefined) updates.fotoUrl = fotoUrl;

    await firestoreDoc('usuarios', uid, updates as Record<string, unknown>, token);
    logger.info({ uid }, 'User synced (updated)');

    return { ...(existing as unknown as Usuario), ...updates };
  }

  const newUser: Usuario = {
    uid,
    email,
    nombre,
    ...(fotoUrl !== undefined ? { fotoUrl } : {}),
    plan: 'gratuito' as PlanTier,
    creadoEn: new Date().toISOString(),
    isActive: true,
  };

  await firestoreDoc('usuarios', uid, newUser as unknown as Record<string, unknown>, token);
  logger.info({ uid }, 'User synced (created)');

  return newUser;
}
