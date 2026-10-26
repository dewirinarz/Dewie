import { KDKMPLocation } from '../types/kdkmp';

export const PROVINCE_COORDINATES: Record<string, [number, number]> = {
  'Aceh': [4.6951, 96.7494],
  'Sumatera Utara': [2.1154, 99.5451],
  'Sumatera Barat': [-0.7399, 100.8000],
  'Riau': [0.2933, 101.7068],
  'Kepulauan Riau': [3.9457, 108.1429],
  'Jambi': [-1.6101, 103.6131],
  'Sumatera Selatan': [-3.3194, 104.9144],
  'Bangka Belitung': [-2.7411, 106.4406],
  'Bengkulu': [-3.5778, 102.3464],
  'Lampung': [-4.5586, 105.4068],
  'DKI Jakarta': [-6.2088, 106.8456],
  'Jawa Barat': [-6.9175, 107.6191],
  'Banten': [-6.4058, 106.0640],
  'Jawa Tengah': [-7.1510, 110.1403],
  'D.I. Yogyakarta': [-7.7956, 110.3695],
  'Jawa Timur': [-7.5361, 112.2384],
  'Bali': [-8.4095, 115.1889],
  'Nusa Tenggara Barat': [-8.6529, 117.3616],
  'Nusa Tenggara Timur': [-8.6574, 121.0794],
  'Kalimantan Barat': [-0.0263, 109.3425],
  'Kalimantan Tengah': [-1.6815, 113.3824],
  'Kalimantan Selatan': [-3.0926, 115.2838],
  'Kalimantan Timur': [0.5387, 116.4194],
  'Kalimantan Utara': [2.7259, 116.9110],
  'Sulawesi Utara': [0.6247, 123.9750],
  'Gorontalo': [0.6999, 122.4467],
  'Sulawesi Tengah': [-1.4300, 121.4456],
  'Sulawesi Barat': [-2.8441, 119.2321],
  'Sulawesi Selatan': [-3.6687, 119.9741],
  'Sulawesi Tenggara': [-4.1449, 122.1746],
  'Maluku': [-3.2385, 130.1453],
  'Maluku Utara': [1.5709, 127.8088],
  'Papua': [-4.2699, 138.0804],
  'Papua Barat': [-1.3361, 133.1747],
  'Papua Selatan': [-7.4716, 139.9575],
  'Papua Tengah': [-3.6396, 136.2361],
  'Papua Pegunungan': [-4.0898, 138.9954],
  'Papua Barat Daya': [-0.8789, 131.2560]
};

export const REGENCIES_COORDINATES: Record<string, [number, number]> = {
  'kabupaten cianjur': [-6.8166, 107.1394],
  'kabupaten bantul': [-7.8938, 110.3344],
  'kabupaten malang': [-8.1666, 112.6333],
  'kabupaten bengkalis': [1.4727, 102.1388],
  'kabupaten bekasi': [-6.2383, 107.1064],
  'kabupaten manggarai barat': [-8.5833, 120.0000],
  'kabupaten maros': [-5.0048, 119.6454],
  'kabupaten sukoharjo': [-7.6833, 110.8333],
  'purbayan': [-7.5898, 110.7788],
  'cianjur': [-6.8166, 107.1394],
  'bantul': [-7.8938, 110.3344],
  'malang': [-7.9797, 112.6304],
  'bengkalis': [1.4727, 102.1388],
  'bekasi': [-6.2383, 107.1064],
  'labuan bajo': [-8.4964, 119.8877],
  'maros': [-5.0048, 119.6454]
};

/**
 * Returns [latitude, longitude] for a location.
 * Falls back to regency or province coordinates with slight jitter if identical.
 */
export function getLocationCoordinates(loc: KDKMPLocation, index = 0): [number, number] {
  if (loc.latitude && loc.longitude && !isNaN(loc.latitude) && !isNaN(loc.longitude)) {
    return [loc.latitude, loc.longitude];
  }

  // Check specific regency / district keywords
  const kabKey = (loc.kabupatenKota || '').toLowerCase().trim();
  const desaKey = (loc.desaKelurahan || '').toLowerCase().trim();
  const namaKey = (loc.namaLokasi || '').toLowerCase().trim();

  for (const [key, coords] of Object.entries(REGENCIES_COORDINATES)) {
    if (kabKey.includes(key) || desaKey.includes(key) || namaKey.includes(key)) {
      // Add slight offset based on index so multiple pins in same regency don't overlap completely
      const latOffset = (Math.sin(index * 2.4) * 0.015);
      const lngOffset = (Math.cos(index * 2.4) * 0.015);
      return [coords[0] + latOffset, coords[1] + lngOffset];
    }
  }

  // Fallback to province
  const provCoords = PROVINCE_COORDINATES[loc.provinsi] || [-2.5489, 118.0149]; // Center of Indonesia
  const latOffset = (Math.sin(index * 1.5) * 0.04);
  const lngOffset = (Math.cos(index * 1.5) * 0.04);

  return [provCoords[0] + latOffset, provCoords[1] + lngOffset];
}
