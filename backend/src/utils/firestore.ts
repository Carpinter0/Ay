/**
 * Firestore REST API helpers for converting between Firestore REST value format
 * and TypeScript objects.
 *
 * This module handles all Firestore REST value types:
 * - stringValue
 * - integerValue
 * - booleanValue
 * - doubleValue
 * - arrayValue
 * - mapValue
 * - timestampValue
 * - nullValue
 */

import { FIRESTORE_BASE_URL } from '../config/firebase.js';

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { booleanValue: boolean }
  | { doubleValue: number }
  | { arrayValue: { values: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } }
  | { timestampValue: string }
  | { nullValue: null };

type FirestoreDocument = {
  name: string;
  fields: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
};

/**
 * Convert a TypeScript value to Firestore REST format.
 */
export function toFirestoreValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }

  if (typeof value === 'string') {
    return { stringValue: value };
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }

  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { integerValue: value.toString() };
    }
    return { doubleValue: value };
  }

  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(toFirestoreValue),
      },
    };
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, v] of Object.entries(obj)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }

  // Fallback: convert to string
  return { stringValue: String(value) };
}

/**
 * Convert a Firestore REST value to a TypeScript object.
 */
export function fromFirestoreValue(value: FirestoreValue): unknown {
  if ('stringValue' in value) {
    return value.stringValue;
  }

  if ('integerValue' in value) {
    return parseInt(value.integerValue, 10);
  }

  if ('booleanValue' in value) {
    return value.booleanValue;
  }

  if ('doubleValue' in value) {
    return value.doubleValue;
  }

  if ('arrayValue' in value) {
    return (value.arrayValue.values || []).map(fromFirestoreValue);
  }

  if ('mapValue' in value) {
    const result: Record<string, unknown> = {};
    const fields = value.mapValue.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      result[k] = fromFirestoreValue(v);
    }
    return result;
  }

  if ('timestampValue' in value) {
    return value.timestampValue;
  }

  if ('nullValue' in value) {
    return null;
  }

  return null;
}

/**
 * Convert a Firestore document to a TypeScript object.
 */
export function fromFirestoreDocument<T>(doc: FirestoreDocument): T & { id: string } {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(doc.fields || {})) {
    result[k] = fromFirestoreValue(v);
  }
  // Extract document ID from the `name` field (e.g., "projects/foo/databases/(default)/documents/usuarios/uid123" -> "uid123")
  const id = doc.name.split('/').pop() || '';
  result.id = id;
  return result as T & { id: string };
}

/**
 * Convert a TypeScript object to Firestore document format.
 */
export function toFirestoreDocument(obj: Record<string, unknown>): { fields: Record<string, FirestoreValue> } {
  const fields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k !== 'id') {
      // Skip the `id` field; it's handled separately in the document path
      fields[k] = toFirestoreValue(v);
    }
  }
  return { fields };
}

/**
 * Build a Firestore document path.
 */
export function firestoreDocPath(collection: string, docId: string): string {
  return `${FIRESTORE_BASE_URL}/${collection}/${docId}`;
}

/**
 * Build a Firestore collection path.
 */
export function firestoreCollectionPath(collection: string): string {
  return `${FIRESTORE_BASE_URL}/${collection}`;
}
