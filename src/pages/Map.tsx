import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, Navigation, SlidersHorizontal, X, Zap } from 'lucide-react';
import {
  CONNECTOR_LABELS,
  DEFAULT_FILTERS,
  directionsUrl,
  filterStations,
  hasCurrent,
  loadStations,
  maxPower,
  type ConnectorType,
  type Station,
  type StationFilters,
  type StationsResult,
} from '../lib/stations';

const TURKEY_CENTER: [number, number] = [39.0, 35.0];
const POWER_OPTIONS = [0, 11, 22, 50, 100, 150];
const FALLBACK_COLOR = '#22c55e';

const iconCache = new Map<string, L.DivIcon>();
function markerIcon(color: string, dc: boolean): L.DivIcon {
  const key = `${color}-${dc}`;
  const cached = iconCache.get(key);
  if (cached) return cached;
  const icon = L.divIcon({
    className: '',
    html: `<div style="background:${color};width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center">
      <span style="transform:rotate(45deg);color:#000;font:700 10px system-ui">${dc ? 'DC' : 'AC'}</span>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
  iconCache.set(key, icon);
  return icon;
}

function FlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 12);
  }, [map, position]);
  return null;
}

function StationPopup({ station }: { station: Station }) {
  const power = maxPower(station);
  return (
    <div className="min-w-[220px]">
      {station.isSample && (
        <div className="mb-2 inline-block rounded bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-800">
          Örnek veri
        </div>
      )}
      <h3 className="font-bold text-gray-900 leading-snug">{station.name}</h3>
      <p className="text-xs text-gray-600 mb-2">
        {station.operator?.name ?? 'Operatör bilinmiyor'}
        {station.city ? ` · ${station.city}` : ''}
      </p>
      {station.address && <p className="text-xs text-gray-700 mb-2">{station.address}</p>}

      <ul className="space-y-1 border-t border-gray-200 pt-2 text-sm">
        {station.connectors.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3">
            <span className="text-gray-700">
              {c.quantity}× {CONNECTOR_LABELS[c.connectorType]}{' '}
              <span className={c.currentType === 'DC' ? 'text-orange-600' : 'text-blue-600'}>({c.currentType})</span>
            </span>
            <span className="font-semibold text-gray-900">{c.powerKw ? `${c.powerKw} kW` : '—'}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between gap-2">
        {power !== null && <span className="text-xs text-gray-500">Maks. {power} kW</span>}
        <a
          href={directionsUrl(station)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-xs font-semibold !text-white hover:bg-green-700"
        >
          <Navigation className="h-3.5 w-3.5" /> Yol tarifi
        </a>
      </div>
    </div>
  );
}

interface FilterPanelProps {
  filters: StationFilters;
  onChange: (f: StationFilters) => void;
  operators: { slug: string; name: string }[];
  connectorTypes: ConnectorType[];
  resultCount: number;
  totalCount: number;
  onClose?: () => void;
}

function FilterPanel({ filters, onChange, operators, connectorTypes, resultCount, totalCount, onClose }: FilterPanelProps) {
  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
      active ? 'bg-green-500 text-black border-green-500' : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-green-500/50'
    }`;

  const toggleConnector = (t: ConnectorType) => {
    const has = filters.connectorTypes.includes(t);
    onChange({
      ...filters,
      connectorTypes: has ? filters.connectorTypes.filter((x) => x !== t) : [...filters.connectorTypes, t],
    });
  };

  const isDefault =
    filters.current === 'all' &&
    filters.minPowerKw === 0 &&
    filters.connectorTypes.length === 0 &&
    filters.operatorSlug === '';

  return (
    <div className="space-y-5 text-white">
      <div className="flex items-center justify-between">
        <h2 className="font-bold flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-green-400" /> Filtreler
        </h2>
        {onClose && (
          <button onClick={onClose} aria-label="Filtreleri kapat" className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <fieldset>
        <legend className="text-xs uppercase tracking-wider text-gray-500 mb-2">Akım tipi</legend>
        <div className="flex gap-2">
          {(['all', 'AC', 'DC'] as const).map((c) => (
            <button key={c} type="button" className={chip(filters.current === c)} onClick={() => onChange({ ...filters, current: c })}>
              {c === 'all' ? 'Tümü' : c === 'AC' ? 'AC (normal)' : 'DC (hızlı)'}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="block text-xs uppercase tracking-wider text-gray-500 mb-2">En az güç</span>
        <select
          value={filters.minPowerKw}
          onChange={(e) => onChange({ ...filters, minPowerKw: Number(e.target.value) })}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        >
          {POWER_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p === 0 ? 'Fark etmez' : `${p} kW ve üzeri`}
            </option>
          ))}
        </select>
      </label>

      {connectorTypes.length > 0 && (
        <fieldset>
          <legend className="text-xs uppercase tracking-wider text-gray-500 mb-2">Soket</legend>
          <div className="flex flex-wrap gap-2">
            {connectorTypes.map((t) => (
              <button key={t} type="button" className={chip(filters.connectorTypes.includes(t))} onClick={() => toggleConnector(t)}>
                {CONNECTOR_LABELS[t]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <label className="block">
        <span className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Operatör</span>
        <select
          value={filters.operatorSlug}
          onChange={(e) => onChange({ ...filters, operatorSlug: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        >
          <option value="">Tüm operatörler</option>
          {operators.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center justify-between border-t border-gray-800 pt-4 text-sm">
        <span className="text-gray-400">
          <span className="font-bold text-white">{resultCount}</span> / {totalCount} istasyon
        </span>
        {!isDefault && (
          <button type="button" onClick={() => onChange(DEFAULT_FILTERS)} className="text-green-400 hover:text-green-300 font-semibold">
            Sıfırla
          </button>
        )}
      </div>
    </div>
  );
}

export default function MapPage() {
  const [result, setResult] = useState<StationsResult | null>(null);
  const [filters, setFilters] = useState<StationFilters>(DEFAULT_FILTERS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadStations().then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const stations = useMemo(() => result?.stations ?? [], [result]);

  const operators = useMemo(() => {
    const m = new Map<string, string>();
    stations.forEach((s) => s.operator && m.set(s.operator.slug, s.operator.name));
    return [...m].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [stations]);

  const connectorTypes = useMemo(() => {
    const set = new Set<ConnectorType>();
    stations.forEach((s) => s.connectors.forEach((c) => set.add(c.connectorType)));
    return (Object.keys(CONNECTOR_LABELS) as ConnectorType[]).filter((t) => set.has(t));
  }, [stations]);

  const filtered = useMemo(() => filterStations(stations, filters), [stations, filters]);

  const locate = () => {
    if (!('geolocation' in navigator)) {
      setGeoError('Tarayıcınız konum özelliğini desteklemiyor.');
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        setGeoError('Konumunuza erişilemedi. Tarayıcı izinlerini kontrol edin.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const panelProps = {
    filters,
    onChange: setFilters,
    operators,
    connectorTypes,
    resultCount: filtered.length,
    totalCount: stations.length,
  };

  return (
    <div className="min-h-screen bg-black pt-18">
      <div className="relative h-[calc(100vh-4.5rem)] flex">
        <aside className="hidden lg:block w-80 shrink-0 overflow-y-auto border-r border-gray-800 bg-black p-5">
          <FilterPanel {...panelProps} />
        </aside>

        <div className="relative flex-1">
          <MapContainer center={TURKEY_CENTER} zoom={6} style={{ width: '100%', height: '100%' }} className="z-10">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <FlyTo position={userPos} />

            {userPos && (
              <CircleMarker center={userPos} radius={8} pathOptions={{ color: '#fff', weight: 2, fillColor: '#3b82f6', fillOpacity: 1 }}>
                <Popup>Konumunuz</Popup>
              </CircleMarker>
            )}

            {filtered.map((station) => (
              <Marker
                key={station.id}
                position={[station.latitude, station.longitude]}
                icon={markerIcon(station.operator?.color ?? FALLBACK_COLOR, hasCurrent(station, 'DC'))}
              >
                <Popup maxWidth={300}>
                  <StationPopup station={station} />
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {result?.source === 'sample' && (
            <div className="absolute top-3 left-14 right-3 sm:right-auto z-[401] sm:max-w-sm bg-yellow-500/15 border border-yellow-500/40 text-yellow-300 text-xs font-semibold rounded-lg px-3 py-2 backdrop-blur-md">
              Örnek veri: Haritadaki istasyonlar ve operatörler kurgusaldır; gerçek veriler yakında eklenecek.
            </div>
          )}

          {!result && (
            <div className="absolute inset-0 z-[402] flex items-center justify-center bg-black/40 text-white text-sm">
              <Zap className="h-4 w-4 mr-2 animate-pulse text-green-400" /> İstasyonlar yükleniyor…
            </div>
          )}

          <div className="absolute bottom-6 right-4 z-[401] flex flex-col items-end gap-2">
            {geoError && (
              <div className="max-w-xs rounded-lg border border-red-500/40 bg-black/90 px-3 py-2 text-xs text-red-300">{geoError}</div>
            )}
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              aria-label="Konumumu göster"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-black shadow-lg shadow-green-500/30 hover:bg-green-400 disabled:opacity-60"
            >
              <Crosshair className={`h-5 w-5 ${locating ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="lg:hidden absolute bottom-6 left-4 z-[401] inline-flex items-center gap-2 rounded-full border border-gray-700 bg-black/90 px-4 py-3 text-sm font-semibold text-white shadow-lg"
          >
            <SlidersHorizontal className="h-4 w-4 text-green-400" /> Filtreler
            <span className="rounded-full bg-green-500 px-2 text-xs text-black">{filtered.length}</span>
          </button>

          {panelOpen && (
            <div className="lg:hidden absolute inset-x-0 bottom-0 z-[403] max-h-[75%] overflow-y-auto rounded-t-2xl border-t border-gray-800 bg-black p-5">
              <FilterPanel {...panelProps} onClose={() => setPanelOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
