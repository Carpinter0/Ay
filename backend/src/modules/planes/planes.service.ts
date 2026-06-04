import { firestoreQuery, getServiceToken } from '../../utils/firestore';
import type { Plan } from '../../types/plan';

/**
 * Returns all active plans ordered by `orden` ascending.
 * Uses anonymous service token since this endpoint is public.
 */
export async function getActivePlanes(): Promise<Plan[]> {
  const token = await getServiceToken();

  const rows = await firestoreQuery(
    'planes',
    {
      filters: [{ field: 'isActive', op: 'EQUAL', value: true }],
      orderBy: { field: 'orden', direction: 'ASCENDING' },
    },
    token
  );

  return rows as unknown as Plan[];
}
