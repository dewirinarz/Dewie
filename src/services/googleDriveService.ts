/**
 * Google Drive REST API v3 Integration Service
 * Handles folder creation, file uploads (JSON backups, PDF checklists, CSV recaps),
 * listing, downloading, and deletion with OAuth2 Bearer token authentication.
 */

export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
export const KDKMP_FOLDER_NAME = 'KDKMP_Dokumen_dan_Cadangan';

/**
 * Find or create the dedicated KDKMP folder in Google Drive root
 */
export async function findOrCreateKdkmpFolder(accessToken: string): Promise<string> {
  const query = `name = '${KDKMP_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sesi Google Drive telah berakhir. Silakan Masuk dengan Google kembali.');
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal memeriksa folder Google Drive (${response.status})`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Folder doesn't exist, create it
  const createRes = await fetch(`${DRIVE_API_URL}/files?fields=id,name`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: KDKMP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Folder penyimpanan otomatis data cadangan, PDF checklist, dan rekapitulasi Kesiapan KDKMP Merah Putih'
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal membuat folder di Google Drive (${createRes.status})`);
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * Upload a file using multipart upload to ensure metadata and content are transferred reliably
 */
export async function uploadFileToDrive(options: {
  name: string;
  mimeType: string;
  blobOrText: Blob | string;
  accessToken: string;
  folderId?: string;
  description?: string;
}): Promise<DriveFileMetadata> {
  const { name, mimeType, blobOrText, accessToken, folderId, description } = options;

  let targetFolderId = folderId;
  if (!targetFolderId) {
    targetFolderId = await findOrCreateKdkmpFolder(accessToken);
  }

  const metadata: Record<string, any> = {
    name,
    mimeType,
    parents: [targetFolderId]
  };

  if (description) {
    metadata.description = description;
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let fileBlob: Blob;
  if (typeof blobOrText === 'string') {
    fileBlob = new Blob([blobOrText], { type: mimeType });
  } else {
    fileBlob = blobOrText;
  }

  const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json; charset=UTF-8' });

  // Compose multipart body using Blob array to safely stream binary/text
  const multipartBody = new Blob(
    [
      delimiter,
      'Content-Type: application/json; charset=UTF-8\r\n\r\n',
      metadataBlob,
      delimiter,
      `Content-Type: ${mimeType}\r\n\r\n`,
      fileBlob,
      closeDelimiter
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const uploadUrl = `${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,iconLink`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sesi Google Drive telah berakhir. Silakan Masuk dengan Google kembali.');
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal mengunggah berkas ke Google Drive (${response.status})`);
  }

  return await response.json();
}

/**
 * Upload full KDKMP application data backup as JSON
 */
export async function uploadBackupToDrive(
  locations: any[],
  accessToken: string,
  backupNote?: string
): Promise<DriveFileMetadata> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `Cadangan_KDKMP_${timestamp}.json`;

  const backupPayload = {
    appName: 'Kesiapan Operasionalisasi KDKMP',
    version: '1.2.0',
    exportDate: new Date().toISOString(),
    totalLocations: locations.length,
    note: backupNote || 'Pencadangan rutin data KDKMP ke Google Drive',
    data: locations
  };

  const jsonContent = JSON.stringify(backupPayload, null, 2);

  return uploadFileToDrive({
    name: fileName,
    mimeType: 'application/json',
    blobOrText: jsonContent,
    accessToken,
    description: `Cadangan data ${locations.length} unit KDKMP dibuat pada ${new Date().toLocaleString('id-ID')}`
  });
}

/**
 * Upload checklist PDF for a specific location
 */
export async function uploadPdfChecklistToDrive(
  pdfBlob: Blob,
  fileName: string,
  locationName: string,
  accessToken: string
): Promise<DriveFileMetadata> {
  return uploadFileToDrive({
    name: fileName,
    mimeType: 'application/pdf',
    blobOrText: pdfBlob,
    accessToken,
    description: `Lembar Evaluasi Checklist Resmi KDKMP: ${locationName}`
  });
}

/**
 * Upload summary CSV to Google Drive
 */
export async function uploadSummaryCsvToDrive(
  csvContent: string,
  accessToken: string
): Promise<DriveFileMetadata> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Rekapitulasi_Kesiapan_KDKMP_${dateStr}.csv`;

  return uploadFileToDrive({
    name: fileName,
    mimeType: 'text/csv',
    blobOrText: csvContent,
    accessToken,
    description: `Rekapitulasi kesiapan KDKMP format CSV per tanggal ${dateStr}`
  });
}

/**
 * List files stored in the KDKMP folder in Google Drive
 */
export async function listKdkmpDriveFiles(accessToken: string): Promise<DriveFileMetadata[]> {
  const folderId = await findOrCreateKdkmpFolder(accessToken);
  const query = `'${folderId}' in parents and trashed = false`;
  const url = `${DRIVE_API_URL}/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,iconLink)&orderBy=modifiedTime desc&pageSize=100`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sesi Google Drive telah berakhir. Silakan login ulang.');
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal mengambil daftar berkas Google Drive (${response.status})`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Download file content as text (useful for reading backup JSON or CSV)
 */
export async function downloadDriveFileContent(fileId: string, accessToken: string): Promise<string> {
  const url = `${DRIVE_API_URL}/files/${fileId}?alt=media`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sesi Google Drive telah berakhir. Silakan Masuk dengan Google kembali.');
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal mengunduh berkas Google Drive (${response.status})`);
  }

  return await response.text();
}

/**
 * Delete a file in Google Drive permanently or move to trash
 * Requires user confirmation dialog in the UI before invocation!
 */
export async function deleteDriveFile(fileId: string, accessToken: string): Promise<boolean> {
  const url = `${DRIVE_API_URL}/files/${fileId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok && response.status !== 204) {
    if (response.status === 401) {
      throw new Error('Sesi Google Drive telah berakhir. Silakan Masuk dengan Google kembali.');
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal menghapus berkas Google Drive (${response.status})`);
  }

  return true;
}
