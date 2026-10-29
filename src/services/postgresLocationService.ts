import { KDKMPLocation } from '../types/kdkmp';

export async function fetchLocationsFromPostgres(): Promise<KDKMPLocation[] | null> {
  try {
    const res = await fetch('/api/locations');
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return null;
  } catch (err) {
    console.warn('Local DB fetch fallback:', err);
    return null;
  }
}

export async function saveLocationToPostgres(location: KDKMPLocation): Promise<boolean> {
  try {
    const res = await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(location),
    });
    return res.ok;
  } catch (err) {
    console.warn('Local DB save warning:', err);
    return false;
  }
}

export interface BatchSyncReport {
  totalToSync: number;
  totalSaved: number;
  totalFailed: number;
  chunksTotal: number;
  chunksSucceeded: number;
  chunksFailed: number;
  chunkLogs: {
    chunkIndex: number;
    size: number;
    status: 'success' | 'failed';
    error?: string;
    attempts: number;
  }[];
}

export async function saveMultipleLocationsToPostgres(
  locations: KDKMPLocation[],
  chunkSize = 200,
  onProgress?: (saved: number, total: number, chunkIndex: number, totalChunks: number) => void
): Promise<BatchSyncReport> {
  const total = locations?.length || 0;
  const totalChunks = Math.ceil(total / (chunkSize || 200));
  const report: BatchSyncReport = {
    totalToSync: total,
    totalSaved: 0,
    totalFailed: 0,
    chunksTotal: totalChunks,
    chunksSucceeded: 0,
    chunksFailed: 0,
    chunkLogs: [],
  };

  if (!locations || locations.length === 0) return report;

  for (let i = 0; i < total; i += chunkSize) {
    const chunk = locations.slice(i, i + chunkSize);
    const chunkIdx = Math.floor(i / chunkSize) + 1;
    let attempts = 0;
    let success = false;
    let lastError = '';

    while (attempts < 3 && !success) {
      attempts++;
      try {
        const res = await fetch('/api/locations/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chunk),
        });

        if (res.ok) {
          success = true;
          report.totalSaved += chunk.length;
          report.chunksSucceeded++;
          report.chunkLogs.push({
            chunkIndex: chunkIdx,
            size: chunk.length,
            status: 'success',
            attempts,
          });
          if (onProgress) {
            onProgress(report.totalSaved, total, chunkIdx, totalChunks);
          }
        } else {
          lastError = `HTTP ${res.status}`;
          if (attempts < 3) {
            await new Promise(r => setTimeout(r, attempts * 500));
          }
        }
      } catch (err: any) {
        lastError = err?.message || 'Koneksi terputus';
        if (attempts < 3) {
          await new Promise(r => setTimeout(r, attempts * 500));
        }
      }
    }

    if (!success) {
      report.totalFailed += chunk.length;
      report.chunksFailed++;
      report.chunkLogs.push({
        chunkIndex: chunkIdx,
        size: chunk.length,
        status: 'failed',
        error: lastError,
        attempts,
      });
      console.error(`PostgreSQL batch chunk ${chunkIdx}/${totalChunks} gagal setelah ${attempts} percobaan: ${lastError}`);
    }
  }

  return report;
}

export async function deleteLocationFromPostgres(locationId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/locations/${encodeURIComponent(locationId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('PostgreSQL delete warning:', err);
    return false;
  }
}

export async function deleteMultipleLocationsFromPostgres(locationIds: string[]): Promise<boolean> {
  try {
    const res = await fetch('/api/locations/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: locationIds }),
    });
    return res.ok;
  } catch (err) {
    console.warn('PostgreSQL bulk delete warning:', err);
    return false;
  }
}

export async function resetLocationsInPostgres(): Promise<boolean> {
  try {
    const res = await fetch('/api/locations/reset', {
      method: 'POST',
    });
    return res.ok;
  } catch (err) {
    console.warn('PostgreSQL reset warning:', err);
    return false;
  }
}

export async function checkPostgresStatus(): Promise<{ connected: boolean; count: number; database?: string }> {
  try {
    const res = await fetch('/api/db-status');
    if (!res.ok) return { connected: false, count: 0 };
    const json = await res.json();
    return {
      connected: Boolean(json.connected),
      count: Number(json.rowCount || 0),
      database: json.database
    };
  } catch {
    return { connected: false, count: 0 };
  }
}
