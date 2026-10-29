/**
 * Robust storage caching utility for KDKMP Locations.
 * 
 * Uses IndexedDB as primary persistent storage (supporting large datasets > 100MB),
 * with a resilient, quota-safe fallback to localStorage for synchronous instant boot.
 */

import { KDKMPLocation } from '../types/kdkmp';

const STORAGE_KEY = 'kdkmp_locations_v1';
const DB_NAME = 'kdkmp_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'locations_cache';
const RECORD_KEY = 'all_locations';

// Max payload size allowed for localStorage (~1.5 MB) to avoid QuotaExceededError
const LOCAL_STORAGE_MAX_SAFE_BYTES = 1.5 * 1024 * 1024;

/**
 * Open or upgrade the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

/**
 * Save locations to IndexedDB asynchronously
 */
export async function saveLocationsToIndexedDB(locations: KDKMPLocation[]): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(locations, RECORD_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch (err) {
    // Gracefully ignore IndexedDB failures in restricted private browsing
    console.warn('[Cache] Catatan IndexedDB tidak dapat disimpan:', err);
  }
}

/**
 * Load locations from IndexedDB asynchronously
 */
export async function loadLocationsFromIndexedDB(): Promise<KDKMPLocation[] | null> {
  try {
    const db = await openDB();
    return await new Promise<KDKMPLocation[] | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(RECORD_KEY);

      req.onsuccess = () => {
        const val = req.result;
        if (Array.isArray(val) && val.length > 0) {
          resolve(val);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/**
 * Synchronous read from localStorage for instant initial render
 */
export function getQuickCachedLocations(): KDKMPLocation[] | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // If parse error or quota corrupt, clean up safely
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
  return null;
}

/**
 * Save locations to both IndexedDB (unlimited quota) and localStorage (if within safe size).
 * Prevents QuotaExceededError from being thrown and protects existing data on publish/boot.
 */
export async function cacheLocations(locations: KDKMPLocation[], allowInitialOverwrite = false): Promise<void> {
  if (!locations || locations.length === 0) return;

  // Protect against resetting user's custom/imported data when the app boots or publishes
  if (!allowInitialOverwrite && locations.length <= 7) {
    const isDefaultList = locations.every(l =>
      l.id.startsWith('kdkmp-1') ||
      l.id.startsWith('kdkmp-2') ||
      l.id.startsWith('kdkmp-3') ||
      l.id.startsWith('kdkmp-4') ||
      l.id.startsWith('kdkmp-5') ||
      l.id.startsWith('kdkmp-6') ||
      l.id.startsWith('kdkmp-7')
    );
    if (isDefaultList) {
      const existing = await loadLocationsFromIndexedDB();
      if (
        existing &&
        existing.length > 0 &&
        (existing.length !== locations.length || existing.some(e => !e.id.startsWith('kdkmp-')))
      ) {
        // User has customized or imported data in IndexedDB, NEVER overwrite with default template!
        return;
      }
    }
  }

  // 1. Asynchronously save to IndexedDB (safe for huge arrays of locations)
  saveLocationsToIndexedDB(locations).catch(() => {});

  // 2. Safely attempt localStorage for instantaneous subsequent reloads
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      // Save lightweight metadata indicator
      localStorage.setItem('kdkmp_data_count_v1', String(locations.length));

      const jsonStr = JSON.stringify(locations);
      
      // If the data is too large for standard localStorage, do not attempt to write
      // to avoid triggering browser QuotaExceededError
      if (jsonStr.length > LOCAL_STORAGE_MAX_SAFE_BYTES) {
        // Clear old oversized cache in localStorage so it frees up storage quota
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore
        }
        return;
      }

      localStorage.setItem(STORAGE_KEY, jsonStr);
    } catch (e: any) {
      // Handle QuotaExceededError safely without crashing or polluting error logs
      const isQuota =
        e?.name === 'QuotaExceededError' ||
        e?.code === 22 ||
        e?.code === 1014 ||
        e?.number === -2147024882;

      if (isQuota) {
        try {
          // Clean up to keep localStorage healthy
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore
        }
      }
    }
  }
}

/**
 * Clear cached locations from both localStorage and IndexedDB
 */
export async function clearLocationsCache(): Promise<void> {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(RECORD_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore
  }
}

/**
 * Intelligently reconciles local client cache with server PostgreSQL records.
 * Ensures:
 * 1. Server locations are never ignored.
 * 2. Unsaved offline additions on device are preserved and returned to be pushed.
 * 3. Newer local edits (higher updatedAt timestamp) take precedence over older server records.
 */
export function reconcileLocations(
  localLocations: KDKMPLocation[],
  serverLocations: KDKMPLocation[]
): { merged: KDKMPLocation[]; localOnlyToPush: KDKMPLocation[] } {
  if (!serverLocations || serverLocations.length === 0) {
    return { merged: localLocations, localOnlyToPush: [] };
  }

  const serverMap = new Map<string, KDKMPLocation>();
  serverLocations.forEach(loc => serverMap.set(loc.id, loc));

  const localOnlyToPush: KDKMPLocation[] = [];
  const mergedMap = new Map<string, KDKMPLocation>();

  // 1. Add all server locations as primary source
  serverLocations.forEach(loc => mergedMap.set(loc.id, loc));

  // 2. Cross-check against local locations to protect offline edits and new local drafts
  localLocations.forEach(localLoc => {
    const serverLoc = serverMap.get(localLoc.id);
    if (!serverLoc) {
      // Local location does not exist on server (drafted on this device while offline)
      mergedMap.set(localLoc.id, localLoc);
      localOnlyToPush.push(localLoc);
    } else {
      // Conflict resolution based on timestamps
      const localTime = localLoc.updatedAt ? new Date(localLoc.updatedAt).getTime() : 0;
      const serverTime = serverLoc.updatedAt ? new Date(serverLoc.updatedAt).getTime() : 0;

      // If local version was edited more recently (by >1000ms), preserve local and push
      if (localTime > serverTime + 1000) {
        mergedMap.set(localLoc.id, localLoc);
        localOnlyToPush.push(localLoc);
      } else {
        // Otherwise server version is up-to-date
        mergedMap.set(localLoc.id, serverLoc);
      }
    }
  });

  return {
    merged: Array.from(mergedMap.values()),
    localOnlyToPush
  };
}
