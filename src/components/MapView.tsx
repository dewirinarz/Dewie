import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  FileText,
  Navigation,
  Layers,
  ChevronRight,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { KDKMPLocation, calculateReadiness } from '../types/kdkmp';
import { getLocationCoordinates } from '../utils/geoUtils';

interface MapViewProps {
  locations: KDKMPLocation[];
  onOpenChecklist: (location: KDKMPLocation, tab?: 'fisik' | 'sdm' | 'sistem' | 'produk' | 'transaksi') => void;
  onOpenPdfPreview: (location: KDKMPLocation) => void;
  onOpenAddModal: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  locations,
  onOpenChecklist,
  onOpenPdfPreview,
  onOpenAddModal
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Provinces list
  const provinces = useMemo(() => {
    const set = new Set<string>();
    locations.forEach(loc => {
      if (loc.provinsi) set.add(loc.provinsi);
    });
    return Array.from(set).sort();
  }, [locations]);

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const score = calculateReadiness(loc.checklist);
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        loc.namaLokasi.toLowerCase().includes(q) ||
        loc.kodeKDKMP.toLowerCase().includes(q) ||
        loc.provinsi.toLowerCase().includes(q) ||
        loc.kabupatenKota.toLowerCase().includes(q) ||
        loc.desaKelurahan.toLowerCase().includes(q);

      const matchesStatus = selectedStatus === 'all' || score.status === selectedStatus;
      const matchesProvince = selectedProvince === 'all' || loc.provinsi === selectedProvince;

      return matchesSearch && matchesStatus && matchesProvince;
    });
  }, [locations, searchQuery, selectedStatus, selectedProvince]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Indonesia archipelago
      const map = L.map(mapContainerRef.current, {
        center: [-2.5, 118.0],
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers whenever filteredLocations or locations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    const bounds = L.latLngBounds([]);

    filteredLocations.forEach((loc, idx) => {
      const [lat, lng] = getLocationCoordinates(loc, idx);
      const score = calculateReadiness(loc.checklist);
      const cl = loc.checklist;

      // Color scheme based on readiness status
      let pinColor = '#10b981'; // emerald
      let pulseColor = 'rgba(16, 185, 129, 0.4)';
      let badgeLabel = 'Sangat Siap';

      if (score.status === 'Siap Bersyarat') {
        pinColor = '#f59e0b'; // amber
        pulseColor = 'rgba(245, 158, 11, 0.4)';
        badgeLabel = 'Siap Bersyarat';
      } else if (score.status === 'Belum Siap') {
        pinColor = '#f43f5e'; // rose
        pulseColor = 'rgba(244, 63, 94, 0.4)';
        badgeLabel = 'Belum Siap';
      }

      // Custom HTML Pin Marker with SVG and Score Badge
      const customIcon = L.divIcon({
        className: 'custom-kdkmp-marker',
        html: `
          <div style="position: relative; width: 36px; height: 44px; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="position: absolute; bottom: 0; width: 14px; height: 6px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(2px);"></div>
            <div style="width: 32px; height: 32px; border-radius: 50% 50% 50% 0; background: ${pinColor}; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px ${pulseColor}; border: 2px solid #ffffff;">
              <span style="transform: rotate(45deg); color: #ffffff; font-weight: 800; font-size: 11px; font-family: sans-serif;">
                ${score.percentage}%
              </span>
            </div>
          </div>
        `,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -42]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const hasLPG = cl.produk.lpg3kg.status === 'ada';
      const hasPupuk = cl.produk.pupukBersubsidi.status === 'ada';
      const hasBeras = cl.produk.berasSPHP.status === 'ada';
      const hasMinyak = cl.produk.minyakita.status === 'ada';

      const popupContent = document.createElement('div');
      popupContent.className = 'kdkmp-popup-card';
      popupContent.innerHTML = `
        <div style="min-width: 250px; font-family: ui-sans-serif, system-ui, sans-serif; color: #1e293b; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-family: monospace; font-weight: 700; background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">
              ${loc.kodeKDKMP || 'KDKMP'}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: ${pinColor}; background: ${pinColor}15; padding: 2px 8px; border-radius: 9999px; border: 1px solid ${pinColor}40;">
              ${score.percentage}% • ${badgeLabel}
            </span>
          </div>

          <h4 style="font-weight: 800; font-size: 14px; margin: 0 0 4px 0; color: #0f172a; line-height: 1.3;">
            ${loc.namaLokasi}
          </h4>

          <div style="font-size: 11px; color: #64748b; margin-bottom: 10px; line-height: 1.4;">
            <div>📍 ${loc.desaKelurahan}, Kec. ${loc.kecamatan}</div>
            <div>${loc.kabupatenKota}, ${loc.provinsi}</div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; margin-bottom: 10px; font-size: 11px;">
            <div style="font-weight: 600; color: #475569; margin-bottom: 4px; font-size: 10px; text-transform: uppercase;">
              Komoditas Strategis Masuk:
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              <span style="padding: 1px 5px; border-radius: 4px; font-size: 10px; font-weight: 600; ${hasLPG ? 'background: #dcfce7; color: #15803d;' : 'background: #f1f5f9; color: #94a3b8; text-decoration: line-through;'}">
                LPG 3kg ${hasLPG ? '✓' : '✗'}
              </span>
              <span style="padding: 1px 5px; border-radius: 4px; font-size: 10px; font-weight: 600; ${hasPupuk ? 'background: #dcfce7; color: #15803d;' : 'background: #f1f5f9; color: #94a3b8; text-decoration: line-through;'}">
                Pupuk ${hasPupuk ? '✓' : '✗'}
              </span>
              <span style="padding: 1px 5px; border-radius: 4px; font-size: 10px; font-weight: 600; ${hasBeras ? 'background: #dcfce7; color: #15803d;' : 'background: #f1f5f9; color: #94a3b8; text-decoration: line-through;'}">
                Beras SPHP ${hasBeras ? '✓' : '✗'}
              </span>
              <span style="padding: 1px 5px; border-radius: 4px; font-size: 10px; font-weight: 600; ${hasMinyak ? 'background: #dcfce7; color: #15803d;' : 'background: #f1f5f9; color: #94a3b8; text-decoration: line-through;'}">
                Minyakita ${hasMinyak ? '✓' : '✗'}
              </span>
            </div>
          </div>

          <div style="display: flex; gap: 6px;">
            <button id="btn-popup-checklist-${loc.id}" style="flex: 1; background: #dc2626; color: #ffffff; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
              Input Checklist
            </button>
            <button id="btn-popup-pdf-${loc.id}" style="background: #ffffff; color: #334155; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
              PDF Resmi
            </button>
          </div>
        </div>
      `;

      // Attach button events after popup opens
      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        setSelectedLocationId(loc.id);
        const btnChecklist = document.getElementById(`btn-popup-checklist-${loc.id}`);
        if (btnChecklist) {
          btnChecklist.onclick = () => onOpenChecklist(loc);
        }
        const btnPdf = document.getElementById(`btn-popup-pdf-${loc.id}`);
        if (btnPdf) {
          btnPdf.onclick = () => onOpenPdfPreview(loc);
        }
      });

      marker.on('click', () => {
        setSelectedLocationId(loc.id);
      });

      markersRef.current[loc.id] = marker;
      bounds.extend([lat, lng]);
    });

    // Auto-fit bounds if we have markers
    if (filteredLocations.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [filteredLocations]);

  // Function to pan to specific location
  const handleSelectLocationCard = (loc: KDKMPLocation, idx: number) => {
    setSelectedLocationId(loc.id);
    const map = mapInstanceRef.current;
    if (!map) return;

    const [lat, lng] = getLocationCoordinates(loc, idx);
    map.flyTo([lat, lng], 13, { duration: 1.2 });

    const marker = markersRef.current[loc.id];
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 700);
    }
  };

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([-2.5, 118.0], 5, { duration: 1 });
    setSelectedLocationId(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari lokasi KDKMP di peta..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              aria-label="Filter status kesiapan peta"
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-700"
            >
              <option value="all">Semua Status Kesiapan</option>
              <option value="Sangat Siap">🟢 Sangat Siap (&ge;85%)</option>
              <option value="Siap Bersyarat">🟡 Siap Bersyarat (60-84%)</option>
              <option value="Belum Siap">🔴 Belum Siap (&lt;60%)</option>
            </select>
          </div>

          {/* Province Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedProvince}
              onChange={e => setSelectedProvince(e.target.value)}
              aria-label="Filter provinsi peta"
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-700"
            >
              <option value="all">Semua Provinsi ({provinces.length})</option>
              {provinces.map(prov => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* Reset View Button */}
          <div className="sm:col-span-1 flex justify-end">
            <button
              onClick={handleResetView}
              title="Pusatkan Seluruh Wilayah Indonesia"
              className="w-full py-2 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center text-xs font-semibold"
            >
              <Maximize2 className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Quick Legend & Count Strip */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">Legenda Pin:</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Sangat Siap (≥85%)
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Siap Bersyarat (60–84%)
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Belum Siap (&lt;60%)
            </span>
          </div>

          <div className="text-slate-500">
            Terplot <strong className="text-slate-900">{filteredLocations.length}</strong> unit lokasi di peta
          </div>
        </div>
      </div>

      {/* Main Map & Interactive Location Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px]">
        {/* Map Container */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs relative flex flex-col">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating Focus Badge */}
          {selectedLocationId && (
            <div className="absolute top-4 left-4 z-20 bg-slate-900/90 text-white backdrop-blur-xs px-3.5 py-2 rounded-lg shadow-lg border border-slate-700 text-xs flex items-center gap-2 animate-in fade-in">
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                Fokus Lokasi:{' '}
                <strong>
                  {locations.find(l => l.id === selectedLocationId)?.namaLokasi || 'Terpilih'}
                </strong>
              </span>
              <button
                onClick={() => setSelectedLocationId(null)}
                className="text-slate-400 hover:text-white ml-2 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Location List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Daftar Titik Koordinat</h4>
              <p className="text-[11px] text-slate-500">Klik kartu untuk menuju ke pin pada peta</p>
            </div>
            <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {filteredLocations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100">
            {filteredLocations.map((loc, idx) => {
              const score = calculateReadiness(loc.checklist);
              const isSelected = selectedLocationId === loc.id;
              const [lat, lng] = getLocationCoordinates(loc, idx);

              return (
                <div
                  key={loc.id}
                  onClick={() => handleSelectLocationCard(loc, idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-50/70 border-red-300 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {loc.kodeKDKMP}
                      </span>
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900 mt-1 leading-snug">
                        {loc.namaLokasi}
                      </h5>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 border ${
                        score.status === 'Sangat Siap'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : score.status === 'Siap Bersyarat'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {score.percentage}%
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      <span>{loc.desaKelurahan}, {loc.kecamatan}</span>
                    </div>
                    <div className="text-slate-400 pl-4">{loc.kabupatenKota}, {loc.provinsi}</div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-100">
                    <span className="font-mono">
                      GPS: {lat.toFixed(4)}, {lng.toFixed(4)}
                    </span>
                    <span className="font-semibold text-red-600 flex items-center gap-0.5">
                      Lihat Pin <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredLocations.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada titik lokasi yang sesuai dengan filter pencarian.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
