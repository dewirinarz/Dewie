import type { KDKMPLocation } from '../types/kdkmp.ts';
import { INITIAL_LOCATIONS } from '../data/defaultData.ts';
import fs from 'fs';
import path from 'path';

const DB_FILE_PATH = path.resolve(process.cwd(), 'src/data/kdkmp_local_db.json');
const BACKUP_PATH = path.resolve(process.cwd(), 'src/data/backup_development_db_pre_stage1.json');

// In-memory cache for fast read/write
let memoryStore: KDKMPLocation[] | null = null;
let isWriting = false;
let pendingSave = false;

function loadFromDisk(): KDKMPLocation[] {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => (item.data || item) as KDKMPLocation);
      }
    }
  } catch (err) {
    console.warn('[Local DB] Error loading from primary DB file, falling back to master backup:', err);
  }

  try {
    if (fs.existsSync(BACKUP_PATH)) {
      const content = fs.readFileSync(BACKUP_PATH, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const initial = parsed.map((item: any) => (item.data || item) as KDKMPLocation);
        // Persist to primary DB file
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), 'utf8');
        return initial;
      }
    }
  } catch (err) {
    console.warn('[Local DB] Error loading from master backup:', err);
  }

  return INITIAL_LOCATIONS;
}

function getStore(): KDKMPLocation[] {
  if (!memoryStore) {
    memoryStore = loadFromDisk();
  }
  return memoryStore;
}

function scheduleSaveToDisk() {
  if (isWriting) {
    pendingSave = true;
    return;
  }
  isWriting = true;
  setTimeout(() => {
    try {
      if (memoryStore) {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(memoryStore, null, 2), 'utf8');
      }
    } catch (err) {
      console.error('[Local DB] Failed to save to disk:', err);
    } finally {
      isWriting = false;
      if (pendingSave) {
        pendingSave = false;
        scheduleSaveToDisk();
      }
    }
  }, 100);
}

export async function isDatabaseOnline(): Promise<boolean> {
  return true;
}

export function getLocalMasterData(): KDKMPLocation[] {
  return getStore();
}

export async function seedInitialLocationsIfEmpty(): Promise<number> {
  const store = getStore();
  if (store.length === 0 && INITIAL_LOCATIONS.length > 0) {
    memoryStore = [...INITIAL_LOCATIONS];
    scheduleSaveToDisk();
    return memoryStore.length;
  }
  return store.length;
}

export async function getAllLocationsFromDb(): Promise<KDKMPLocation[]> {
  const store = getStore();
  // Return sorted by updatedAt desc
  return [...store].sort((a, b) => {
    const timeA = new Date(a.updatedAt || 0).getTime();
    const timeB = new Date(b.updatedAt || 0).getTime();
    return timeB - timeA;
  });
}

export async function upsertLocationToDb(loc: KDKMPLocation): Promise<void> {
  if (!loc || !loc.id) return;
  const store = getStore();
  const index = store.findIndex(item => item.id === loc.id);
  const updatedItem: KDKMPLocation = {
    ...loc,
    updatedAt: new Date().toISOString()
  };

  if (index >= 0) {
    store[index] = updatedItem;
  } else {
    store.unshift(updatedItem);
  }
  scheduleSaveToDisk();
}

export async function upsertMultipleLocationsToDb(locs: KDKMPLocation[]): Promise<number> {
  if (!locs || locs.length === 0) return 0;
  const store = getStore();
  const map = new Map<string, KDKMPLocation>();

  // Populate existing
  store.forEach(l => map.set(l.id, l));

  // Merge new
  locs.forEach(l => {
    if (l && l.id) {
      map.set(l.id, {
        ...l,
        updatedAt: l.updatedAt || new Date().toISOString()
      });
    }
  });

  memoryStore = Array.from(map.values());
  scheduleSaveToDisk();
  return locs.length;
}

export async function deleteLocationFromDb(locationId: string): Promise<void> {
  if (!locationId) return;
  const store = getStore();
  memoryStore = store.filter(item => item.id !== locationId);
  scheduleSaveToDisk();
}

export async function deleteMultipleLocationsFromDb(locationIds: string[]): Promise<void> {
  if (!locationIds || locationIds.length === 0) return;
  const idSet = new Set(locationIds);
  const store = getStore();
  memoryStore = store.filter(item => !idSet.has(item.id));
  scheduleSaveToDisk();
}

export async function resetLocationsInDb(initialLocs?: KDKMPLocation[]): Promise<void> {
  if (Array.isArray(initialLocs) && initialLocs.length > 0) {
    memoryStore = [...initialLocs];
  } else {
    // Reset to verified master backup
    memoryStore = loadFromDisk();
  }
  scheduleSaveToDisk();
}

export async function getDatabaseStatus(): Promise<{ connected: boolean; count: number; dbName: string; error?: string }> {
  const store = getStore();
  return {
    connected: true,
    count: store.length,
    dbName: 'Basis Data Lokal Mandiri (Penyimpanan JSON Permanen)',
    error: undefined
  };
}
