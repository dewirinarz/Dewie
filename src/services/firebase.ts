import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { KDKMPLocation } from '../types/kdkmp';
import { INITIAL_LOCATIONS } from '../data/defaultData';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Check if the error is a quota exhaustion, rate limit, or network offline condition
 */
export function isQuotaOrNetworkError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code;
  const lowerMsg = msg.toLowerCase();
  return (
    code === 'resource-exhausted' ||
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    code === 'cancelled' ||
    lowerMsg.includes('quota') ||
    lowerMsg.includes('resource-exhausted') ||
    lowerMsg.includes('client is offline') ||
    lowerMsg.includes('failed to get document from server') ||
    lowerMsg.includes('network')
  );
}

/**
 * Check if the error is specifically a security rule permission denial
 */
export function isPermissionDeniedError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code;
  return (
    code === 'permission-denied' ||
    msg.includes('Missing or insufficient permissions') ||
    msg.includes('permission-denied')
  );
}

/**
 * Formats and throws structured FirestoreErrorInfo for permission & rule verification
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Test connection on boot with graceful offline/quota handling
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (isQuotaOrNetworkError(error)) {
      console.warn('[Firestore] Koneksi cloud sedang offline atau kuota harian tercapai. Beralih ke cache lokal.');
    }
    return false;
  }
}

const LOCATIONS_COLLECTION = 'locations';
const SYSTEM_COLLECTION = 'system';
const SEED_META_DOC = 'seed_meta';

/**
 * Fetch all locations once from Firestore with quota fallback
 */
export async function fetchLocationsFromFirestore(): Promise<KDKMPLocation[]> {
  try {
    const snap = await getDocs(collection(db, LOCATIONS_COLLECTION));
    const items: KDKMPLocation[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data() as KDKMPLocation;
      if (data && data.id) {
        items.push(data);
      }
    });
    return items;
  } catch (err) {
    if (isQuotaOrNetworkError(err)) {
      console.warn('[Firestore] Pembacaan cloud dialihkan ke cache lokal (kuota/offline):', (err as any)?.message);
      return [];
    }
    handleFirestoreError(err, OperationType.LIST, LOCATIONS_COLLECTION);
  }
}

/**
 * Seeds initial locations to Firestore ONLY if system has never been initialized.
 * Once initialized, deletions made by the user will NOT be overwritten by auto-reseeding.
 */
export async function ensureLocationsSeeded(): Promise<KDKMPLocation[]> {
  try {
    const metaRef = doc(db, SYSTEM_COLLECTION, SEED_META_DOC);
    const metaSnap = await getDoc(metaRef);

    if (metaSnap.exists()) {
      // System was already initialized before; do not overwrite user data/deletions
      return await fetchLocationsFromFirestore();
    }

    const existing = await fetchLocationsFromFirestore();
    if (existing.length > 0) {
      await setDoc(metaRef, { initialized: true, initializedAt: new Date().toISOString() });
      return existing;
    }

    // Collection is truly pristine: seed with INITIAL_LOCATIONS
    const batch = writeBatch(db);
    for (const loc of INITIAL_LOCATIONS) {
      const ref = doc(db, LOCATIONS_COLLECTION, loc.id);
      batch.set(ref, loc);
    }
    batch.set(metaRef, { initialized: true, initializedAt: new Date().toISOString() });
    await batch.commit();
    return INITIAL_LOCATIONS;
  } catch (err) {
    if (isQuotaOrNetworkError(err)) {
      console.warn('[Firestore] Seeding ditangguhkan ke cache lokal (kuota/offline):', (err as any)?.message);
      return INITIAL_LOCATIONS;
    }
    console.warn('Error in ensureLocationsSeeded:', err);
    return INITIAL_LOCATIONS;
  }
}

/**
 * Real-time listener for locations with smart seeding and resilient quota fallback
 */
export function subscribeToLocations(
  onData: (locations: KDKMPLocation[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, LOCATIONS_COLLECTION);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const metaRef = doc(db, SYSTEM_COLLECTION, SEED_META_DOC);
          const metaSnap = await getDoc(metaRef);
          // Only seed if system has NEVER been initialized
          if (!metaSnap.exists()) {
            const seeded = await ensureLocationsSeeded();
            onData(seeded);
            return;
          }
        } catch {
          // If offline or error, don't force seed
        }
        // User deliberately deleted all locations
        onData([]);
      } else {
        const items: KDKMPLocation[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as KDKMPLocation;
          if (data && data.id) {
            items.push(data);
          }
        });
        // Sort by updatedAt descending (newest first)
        items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
        onData(items);
      }
    },
    (error) => {
      if (onError) {
        onError(error);
      }
      if (isQuotaOrNetworkError(error)) {
        console.warn('[Firestore] Kuota cloud harian tercapai atau offline. Menggunakan cache lokal & IndexedDB:', error.message);
        return;
      }
      handleFirestoreError(error, OperationType.LIST, LOCATIONS_COLLECTION);
    }
  );
}

/**
 * Save or update single location in Firestore with quota-safe fallback
 */
export async function saveLocationToFirestore(location: KDKMPLocation): Promise<void> {
  const path = `${LOCATIONS_COLLECTION}/${location.id}`;
  try {
    const ref = doc(db, LOCATIONS_COLLECTION, location.id);
    await setDoc(ref, location);
    // Ensure system is marked as initialized
    const metaRef = doc(db, SYSTEM_COLLECTION, SEED_META_DOC);
    await setDoc(metaRef, { initialized: true, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    if (isQuotaOrNetworkError(err)) {
      console.warn('[Firestore] Penyimpanan cloud dialihkan ke cache lokal (kuota/offline):', (err as any)?.message);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Delete a single location from Firestore with quota-safe fallback
 */
export async function deleteLocationFromFirestore(locationId: string): Promise<void> {
  const path = `${LOCATIONS_COLLECTION}/${locationId}`;
  try {
    const ref = doc(db, LOCATIONS_COLLECTION, locationId);
    await deleteDoc(ref);
    // Mark system as initialized so empty state doesn't re-seed
    const metaRef = doc(db, SYSTEM_COLLECTION, SEED_META_DOC);
    await setDoc(metaRef, { initialized: true, lastAction: 'delete' }, { merge: true });
  } catch (err) {
    if (isQuotaOrNetworkError(err)) {
      console.warn('[Firestore] Penghapusan cloud dialihkan ke cache lokal (kuota/offline):', (err as any)?.message);
      return;
    }
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Delete multiple locations in batch (Bulk Delete) with quota-safe fallback
 */
export async function deleteMultipleLocationsFromFirestore(locationIds: string[]): Promise<void> {
  try {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < locationIds.length; i += CHUNK_SIZE) {
      const chunk = locationIds.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const id of chunk) {
        batch.delete(doc(db, LOCATIONS_COLLECTION, id));
      }
      await batch.commit();
    }
    const metaRef = doc(db, SYSTEM_COLLECTION, SEED_META_DOC);
    await setDoc(metaRef, { initialized: true, lastAction: 'bulk_delete' }, { merge: true });
  } catch (err) {
    if (isQuotaOrNetworkError(err)) {
      console.warn('[Firestore] Penghapusan massal dialihkan ke cache lokal (kuota/offline):', (err as any)?.message);
      return;
    }
    handleFirestoreError(err, OperationType.DELETE, LOCATIONS_COLLECTION);
  }
}

/**
 * Clear all locations from Firestore completely (Delete All Data)
 */
export async function deleteAllLocationsFromFirestore(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, LOCATIONS_COLLECTION));
    const batch = writeBatch(db);
    snap.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    // Mark system as initialized so empty collection doesn't auto-seed
    batch.set(doc(db, SYSTEM_COLLECTION, SEED_META_DOC), {
      initialized: true,
      wipedAt: new Date().toISOString()
    });
    await batch.commit();
  } catch (err) {
    if (isQuotaOrNetworkError(err)) {
      console.warn('[Firestore] Reset data dialihkan ke cache lokal (kuota/offline):', (err as any)?.message);
      return;
    }
    handleFirestoreError(err, OperationType.DELETE, LOCATIONS_COLLECTION);
  }
}

/**
 * Save multiple locations in batch (for import / bulk operations) with quota-safe fallback
 */
export async function saveMultipleLocationsToFirestore(locations: KDKMPLocation[]): Promise<void> {
  try {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < locations.length; i += CHUNK_SIZE) {
      const chunk = locations.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const loc of chunk) {
        const ref = doc(db, LOCATIONS_COLLECTION, loc.id);
        batch.set(ref, loc);
      }
      await batch.commit();
    }
    const metaRef = doc(db, SYSTEM_COLLECTION, SEED_META_DOC);
    await setDoc(metaRef, { initialized: true, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    if (isQuotaOrNetworkError(err)) {
      console.warn('[Firestore] Penyimpanan massal dialihkan ke cache lokal (kuota/offline):', (err as any)?.message);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, LOCATIONS_COLLECTION);
  }
}

/**
 * Reset all locations in Firestore to default initial data
 */
export async function resetLocationsInFirestore(defaults: KDKMPLocation[] = INITIAL_LOCATIONS): Promise<void> {
  try {
    const snap = await getDocs(collection(db, LOCATIONS_COLLECTION));
    const batch = writeBatch(db);
    snap.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    for (const loc of defaults) {
      batch.set(doc(db, LOCATIONS_COLLECTION, loc.id), loc);
    }
    batch.set(doc(db, SYSTEM_COLLECTION, SEED_META_DOC), {
      initialized: true,
      resetAt: new Date().toISOString()
    });
    await batch.commit();
  } catch (err) {
    if (isQuotaOrNetworkError(err)) {
      console.warn('[Firestore] Reset awal dialihkan ke cache lokal (kuota/offline):', (err as any)?.message);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, LOCATIONS_COLLECTION);
  }
}
