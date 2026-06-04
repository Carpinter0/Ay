import { firestoreGet, firestoreQuery, getServiceToken } from '../../utils/firestore';
import type { Sorpresa } from '../../types/sorpresa';
import type { PlanTier } from '../../types/usuario';
import type { Plan } from '../../types/plan';
import { PLAN_PRIORITY } from '../suscripciones/suscripciones.service';
import logger from '../../utils/logger';

/**
 * Returns the sorpresas available for the authenticated user's plan this month.
 * Filters by planMinimo ≤ user's plan and respects the sorpresasMensuales limit.
 */
export async function getSorpresasDelMes(
  uid: string
): Promise<Sorpresa[]> {
  const token = await getServiceToken();

  // 1. Get user's current plan
  const userDoc = await firestoreGet('usuarios', uid, token);
  if (!userDoc) throw new Error('User not found');
  const userPlan = (userDoc['plan'] as PlanTier) ?? 'gratuito';

  // 2. Get plan config to know the monthly limit
  const planDoc = await firestoreGet('planes', userPlan, token);
  const sorpresasLimit = planDoc
    ? ((planDoc as unknown as Plan).sorpresasMensuales ?? 0)
    : 0;

  // 3. Get all active sorpresas
  const rows = await firestoreQuery(
    'sorpresas',
    {
      filters: [{ field: 'isActive', op: 'EQUAL', value: true }],
    },
    token
  );

  // 4. Filter by planMinimo server-side
  const userPriority = PLAN_PRIORITY[userPlan];
  const accessible = (rows as unknown as Sorpresa[]).filter(
    (s) => PLAN_PRIORITY[s.planMinimo] <= userPriority
  );

  logger.info({ uid, userPlan, total: accessible.length, limit: sorpresasLimit }, 'Sorpresas fetched');

  return accessible.slice(0, sorpresasLimit);
}

/**
 * Returns a single sorpresa if the user's plan meets the planMinimo.
 * Throws 403-like error if plan is insufficient.
 */
export async function getSorpresaById(
  id: string,
  uid: string
): Promise<Sorpresa> {
  const token = await getServiceToken();

  const [sorpresaDoc, userDoc] = await Promise.all([
    firestoreGet('sorpresas', id, token),
    firestoreGet('usuarios', uid, token),
  ]);

  if (!sorpresaDoc) throw new Error(`Sorpresa not found: ${id}`);

  const sorpresa = sorpresaDoc as unknown as Sorpresa;
  const userPlan = (userDoc?.['plan'] as PlanTier) ?? 'gratuito';

  if (PLAN_PRIORITY[sorpresa.planMinimo] > PLAN_PRIORITY[userPlan]) {
    throw new Error('Plan upgrade required to access this sorpresa');
  }

  return sorpresa;
}
