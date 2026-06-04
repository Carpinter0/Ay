import { env } from '../config/env';
import { FIRESTORE_BASE_URL } from '../config/firebase';
import logger from './logger';

// ---------------------------------------------------------------------------
// Firestore REST value type
// Using `unknown` here is intentional: Firestore REST responses are deeply
// nested, dynamically typed JSON. Narrowing happens in fromREST() below.
// ---------------------------------------------------------------------------
type FSValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { arrayValue: { values?: FSValue[] } }
  | { mapValue: { fields: Record<string, FSValue> } };

type FSFields = Record<string, FSValue>;

// ---------------------------------------------------------------------------
// mapToREST — converts a plain JS object to Firestore REST fields format
// ---------------------------------------------------------------------------
export function mapToREST(data: Record<string, unknown>): FSFields {
  const fields: FSFields = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      fields[key] = { nullValue: null };
    } else if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      Number.isInteger(value)
        ? (fields[key] = { integerValue: value.toString() })
        : (fields[key] = { doubleValue: value });
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map((item) => {
            const wrapped = mapToREST({ v: item as unknown as Record<string, unknown> });
            return wrapped['v'] as FSValue;
          }),
        },
      };
    } else if (typeof value === 'object') {
      fields[key] = {
        mapValue: { fields: mapToREST(value as Record<string, unknown>) },
      };
    }
  }

  return fields;
}

// ---------------------------------------------------------------------------
// fromREST — converts Firestore REST fields format back to a plain JS object
// ---------------------------------------------------------------------------
export function fromREST(fields: FSFields): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    result[key] = unwrapValue(value);
  }
  return result;
}

function unwrapValue(value: FSValue): unknown {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return parseInt(value.integerValue, 10);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(unwrapValue);
  if ('mapValue' in value) return fromREST(value.mapValue.fields);
  return null;
}

// ---------------------------------------------------------------------------
// firestoreDoc — PATCH a single document (idempotent upsert)
// ---------------------------------------------------------------------------
export async function firestoreDoc(
  collection: string,
  docId: string,
  data: Record<string, unknown>,
  idToken: string
): Promise<void> {
  const fields = mapToREST(data);
  const updateMask = Object.keys(fields)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join('&');

  const url = `${FIRESTORE_BASE_URL}/${collection}/${docId}?${updateMask}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error({ collection, docId, status: res.status, body }, 'Firestore PATCH failed');
    throw new Error(`Firestore PATCH failed: ${res.status}`);
  }
}

// ---------------------------------------------------------------------------
// firestoreGet — GET a single document
// ---------------------------------------------------------------------------
export async function firestoreGet(
  collection: string,
  docId: string,
  idToken: string
): Promise<Record<string, unknown> | null> {
  const url = `${FIRESTORE_BASE_URL}/${collection}/${docId}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const body = await res.text();
    logger.error({ collection, docId, status: res.status, body }, 'Firestore GET failed');
    throw new Error(`Firestore GET failed: ${res.status}`);
  }

  const doc = (await res.json()) as { fields?: FSFields };
  return doc.fields ? fromREST(doc.fields) : null;
}

// ---------------------------------------------------------------------------
// firestoreQuery — run a simple structuredQuery against a collection
// ---------------------------------------------------------------------------
interface QueryFilter {
  field: string;
  op:
    | 'EQUAL'
    | 'NOT_EQUAL'
    | 'LESS_THAN'
    | 'LESS_THAN_OR_EQUAL'
    | 'GREATER_THAN'
    | 'GREATER_THAN_OR_EQUAL'
    | 'ARRAY_CONTAINS';
  value: unknown;
}

interface QueryOptions {
  filters?: QueryFilter[];
  orderBy?: { field: string; direction?: 'ASCENDING' | 'DESCENDING' };
  limit?: number;
}

export async function firestoreQuery(
  collection: string,
  options: QueryOptions,
  idToken: string
): Promise<Array<Record<string, unknown>>> {
  const url = `${FIRESTORE_BASE_URL}:runQuery`;

  const where =
    options.filters && options.filters.length > 0
      ? {
          compositeFilter: {
            op: 'AND',
            filters: options.filters.map((f) => ({
              fieldFilter: {
                field: { fieldPath: f.field },
                op: f.op,
                value: mapToREST({ v: f.value as Record<string, unknown> })['v'],
              },
            })),
          },
        }
      : undefined;

  const body: Record<string, unknown> = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      ...(where ? { where } : {}),
      ...(options.orderBy
        ? {
            orderBy: [
              {
                field: { fieldPath: options.orderBy.field },
                direction: options.orderBy.direction ?? 'ASCENDING',
              },
            ],
          }
        : {}),
      ...(options.limit ? { limit: options.limit } : {}),
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ collection, status: res.status, text }, 'Firestore query failed');
    throw new Error(`Firestore query failed: ${res.status}`);
  }

  const rows = (await res.json()) as Array<{ document?: { fields?: FSFields } }>;
  return rows
    .filter((r) => r.document?.fields)
    .map((r) => fromREST(r.document!.fields!));
}

// ---------------------------------------------------------------------------
// getServiceToken — obtains a short-lived Firebase anonymous ID token for
// server-initiated Firestore writes (no user token available).
//
// FIX: The previous version called accounts:signUp on every invocation,
// creating a new anonymous user in Firebase Auth each time — wasting quota
// and polluting the user table. We now cache the token in memory and only
// refresh it 60 seconds before it expires.
// ---------------------------------------------------------------------------
interface CachedToken {
  value: string;
  expiresAt: number; // Unix ms
}

let _serviceTokenCache: CachedToken | null = null;

export async function getServiceToken(): Promise<string> {
  const now = Date.now();
  const REFRESH_BUFFER_MS = 60_000; // refresh 60s before expiry

  if (_serviceTokenCache && now < _serviceTokenCache.expiresAt - REFRESH_BUFFER_MS) {
    return _serviceTokenCache.value;
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${env.FIREBASE_WEB_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true }),
    }
  );

  if (!res.ok) throw new Error('Failed to obtain service token');

  const data = (await res.json()) as { idToken: string; expiresIn: string };
  const expiresInMs = parseInt(data.expiresIn, 10) * 1000;

  _serviceTokenCache = {
    value: data.idToken,
    expiresAt: now + expiresInMs,
  };

  logger.info('Service token refreshed');
  return _serviceTokenCache.value;
}

/**
 * Clears the cached service token. Useful in tests or after a 401 response.
 */
export function clearServiceTokenCache(): void {
  _serviceTokenCache = null;
}
