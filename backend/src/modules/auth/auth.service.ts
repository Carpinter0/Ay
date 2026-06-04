import { z } from 'zod';
import { firestoreDoc, firestoreGet, getServiceToken } from '../../utils/firestore';
import type { Usuario } from '../../types/usuario';
import { PlanTierSchema } from '../../types/usuario';
import logger from '../../utils/logger';

// ---------------------------------------------------------------------------
// Zod schema — validates the raw Firestore document before casting to Usuario.
// This replaces the unsafe `as unknown as Usuario` cast that existed before.
// ---------------------------------------------------------------------------
const UsuarioSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  nombre: z.string(),
  fotoUrl: z.string().url().optional(),
  stripeCustomerId: z.string().optional(),
  plan: PlanTierSchema,
  suscripcionActivaDesde: z.string().optional(),
  creadoEn: z.string(),
  isActive: z.boolean(),
});

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
  const raw = await firestoreGet('usuarios', uid, token);

  if (raw) {
    // Validate the existing document before trusting it
    const existing = UsuarioSchema.parse(raw);

    const updates: Partial<Usuario> = { nombre };
    if (fotoUrl !== undefined) updates.fotoUrl = fotoUrl;

    await firestoreDoc('usuarios', uid, updates as Record<string, unknown>, token);
    logger.info({ uid }, 'User synced (updated)');

    return { ...existing, ...updates };
  }

  const newUser: Usuario = {
    uid,
    email,
    nombre,
    ...(fotoUrl !== undefined ? { fotoUrl } : {}),
    plan: 'gratuito',
    creadoEn: new Date().toISOString(),
    isActive: true,
  };

  await firestoreDoc('usuarios', uid, newUser as unknown as Record<string, unknown>, token);
  logger.info({ uid }, 'User synced (created)');

  return newUser;
}
