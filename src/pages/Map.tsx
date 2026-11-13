import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { ChevronRight, ChevronUp, Crosshair, List, Navigation, Search, SlidersHorizontal, X, Zap } from 'lucide-react';
import {
  CONNECTOR_LABELS,
  DEFAULT_FILTERS,
  directionsUrl,
  distanceKm,
  geocode,
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
  const bolt =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#000"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
  const icon = L.divIcon({
    className: '',
    html: `<div style="position:relative;width:32px;height:32px">
      <div style="background:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding-bottom:2px">${bolt}</div>
      ${dc ? '<span style="position:absolute;top:-6px;right:-10px;background:#000;color:#fb923c;border:1px solid #fb923c;border-radius:6px;font:700 9px system-ui;padding:0 3px">DC</span>' : ''}
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });
  iconCache.set(key, icon);
  return icon;
}

/** Küme (cluster) simgesi: koyu zemin, yeşil halka, içinde istasyon sayısı. */
function clusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount();
  const size = count < 10 ? 36 : count < 100 ? 44 : 52;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:rgba(0,0,0,.85);border:3px solid #22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.25);display:flex;align-items:center;justify-content:center;color:#fff;font:700 13px system-ui">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const OCM_ATTRIBUTION =
  'İstasyon verisi: <a href="https://openchargemap.org" target="_blank" rel="noopener">Open Charge Map</a> (CC BY 4.0)';

function ExtraAttribution({ html }: { html: string }) {
  const map = useMap();
  useEffect(() => {
    map.attributionControl.addAttribution(html);
    return () => {
      map.attributionControl.removeAttribution(html);
    };
  }, [map, html]);
  return null;
}

interface FlyTarget {
  position: [number, number];
  zoom: number;
  /** Aynı noktaya tekrar uçabilmek için her istekte değişir */
  key: number;
}

function FlyTo({ target }: { target: FlyTarget | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target.position, target.zoom, { duration: 0.8 });
  }, [map, target]);
  return null;
}

/** Harita merkezini takip eder (liste sıralaması için). */
function CenterTracker({ onChange }: { onChange: (c: [number, number]) => void }) {
  const map = useMap();
  useEffect(() => {
    const update = () => {
      const c = map.getCenter();
      onChange([c.lat, c.lng]);
    };
    update();
    map.on('moveend', update);
    return () => {
      map.off('moveend', update);
    };
  }, [map, onChange]);
  return null;
}

function StationPopup({ station }: { station: Station }) {
  const power = maxPower(station);
  return (
    <div className="min-w-[220px]">
      {station.isSample && (
        <div className="mb-2 inline-block rounded bg-yellow-500/15 px-2 py-0.5 text-[11px] font-semibold text-yellow-300">
          Örnek veri
        </div>
      )}
      <h3 className="font-bold text-white leading-snug">{station.name}</h3>
      <p className="text-xs text-gray-400 mb-2">
        {station.operator?.name ?? 'Operatör bilinmiyor'}
        {station.city ? ` · ${station.city}` : ''}
      </p>
      {station.address && <p className="text-xs text-gray-300 mb-2">{station.address}</p>}

      <ul className="space-y-1 border-t border-gray-800 pt-2 text-sm">
        {station.connectors.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3">
            <span className="text-gray-300">
              {c.quantity}× {CONNECTOR_LABELS[c.connectorType]}{' '}
              <span className={c.currentType === 'DC' ? 'text-orange-400' : 'text-sky-400'}>({c.currentType})</span>
            </span>
            <span className="font-semibold text-white">{c.powerKw ? `${c.powerKw} kW` : '—'}</span>
          </li>
        ))}
      </ul>
      {power !== null && <p className="mt-2 text-xs text-gray-500">Maks. {power} kW</p>}

      <div className="mt-3 flex items-center justify-between gap-2">
        <Link
          to={`/istasyon/${station.slug}`}
          className="inline-flex items-center gap-0.5 text-xs font-semibold !text-green-400 hover:!text-green-300"
        >
          Detaylar <ChevronRight className="h-3.5 w-3.5" />
        </Link>
        <a
          href={directionsUrl(station)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-bold !text-black hover:bg-green-400"
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

interface StationListProps {
  stations: { station: Station; distance: number | null }[];
  onSelect: (s: Station) => void;
  selectedId: string | null;
}

const LIST_LIMIT = 100;

function StationList({ stations, onSelect, selectedId }: StationListProps) {
  if (stations.length === 0) {
    return <p className="text-sm text-gray-500">Filtrelere uyan istasyon bulunamadı.</p>;
  }
  return (
    <ul className="space-y-2">
      {stations.slice(0, LIST_LIMIT).map(({ station, distance }) => {
        const power = maxPower(station);
        const dc = hasCurrent(station, 'DC');
        return (
          <li key={station.id}>
            <button
              type="button"
              onClick={() => onSelect(station)}
              className={`w-full text-left rounded-xl border p-3 transition-colors ${
                selectedId === station.id ? 'border-green-500 bg-green-500/10' : 'border-gray-800 bg-gray-900 hover:border-green-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-sm text-white leading-snug">{station.name}</span>
                {distance !== null && (
                  <span className="shrink-0 text-xs text-gray-400">
                    {distance < 10 ? distance.toFixed(1) : Math.round(distance)} km
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                <span>{station.operator?.name ?? 'Operatör bilinmiyor'}</span>
                <span className={dc ? 'text-orange-400 font-semibold' : 'text-sky-400 font-semibold'}>{dc ? 'DC' : 'AC'}</span>
                {power !== null && <span>maks. {power} kW</span>}
                {station.isSample && <span className="text-yellow-400">örnek veri</span>}
              </div>
            </button>
          </li>
        );
      })}
      {stations.length > LIST_LIMIT && (
        <li className="text-xs text-gray-500 pt-1">
          En yakın {LIST_LIMIT} istasyon gösteriliyor. Haritayı kaydırarak diğerlerini görebilirsiniz.
        </li>
      )}
    </ul>
  );
}

export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState<StationsResult | null>(null);
  const [filters, setFilters] = useState<StationFilters>(DEFAULT_FILTERS);
  const [drawer, setDrawer] = useState<'closed' | 'list' | 'filters'>('closed');
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [searching, setSearching] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const markerRefs = useRef(new Map<string, L.Marker>());
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const initialParamsHandled = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadStations().then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);


  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setMessage({ kind: 'error', text: 'Tarayıcınız konum özelliğini desteklemiyor.' });
      return;
    }
    setLocating(true);
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(p);
        setFlyTarget({ position: p, zoom: 12, key: Date.now() });
        setLocating(false);
      },
      () => {
        setMessage({ kind: 'error', text: 'Konumunuza erişilemedi. Tarayıcı izinlerini kontrol edin.' });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const runSearch = useCallback(async (q: string) => {
    const text = q.trim();
    if (!text) return;
    setSearching(true);
    setMessage(null);
    try {
      const r = await geocode(text);
      if (r) {
        setFlyTarget({ position: r.position, zoom: 12, key: Date.now() });
      } else {
        setMessage({ kind: 'info', text: `"${text}" bulunamadı. Farklı bir yazım deneyin.` });
      }
    } catch {
      setMessage({ kind: 'error', text: 'Adres araması şu anda yapılamıyor. Lütfen daha sonra tekrar deneyin.' });
    } finally {
      setSearching(false);
    }
  }, []);

  // Ana sayfadan gelen ?q= ve ?konum=1 parametreleri
  useEffect(() => {
    if (initialParamsHandled.current) return;
    initialParamsHandled.current = true;
    const q = searchParams.get('q');
    if (q) runSearch(q);
    else if (searchParams.get('konum') === '1') locate();
  }, [searchParams, runSearch, locate]);

  const onSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setSearchParams(q ? { q } : {}, { replace: true });
    runSearch(q);
  };

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

  const usesOcm = useMemo(() => stations.some((s) => s.source === 'ocm'), [stations]);

  const filtered = useMemo(() => filterStations(stations, filters), [stations, filters]);

  // Liste: kullanıcı konumu varsa ona, yoksa harita merkezine göre yakından uzağa
  const sorted = useMemo(() => {
    const ref = userPos ?? center;
    const withDist = filtered.map((station) => ({
      station,
      distance: ref ? distanceKm(ref, [station.latitude, station.longitude]) : null,
    }));
    if (ref) withDist.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    return withDist;
  }, [filtered, userPos, center]);

  const selectStation = useCallback((s: Station) => {
    setSelectedId(s.id);
    setDrawer('closed');
    const marker = markerRefs.current.get(s.id);
    const cluster = clusterRef.current;
    if (marker && cluster) {
      // Kümelenmiş işaretçiyi görünür hale getirip popup'ını aç
      cluster.zoomToShowLayer(marker, () => marker.openPopup());
    } else {
      setFlyTarget({ position: [s.latitude, s.longitude], zoom: 15, key: Date.now() });
    }
  }, []);

  // Detay sayfasından gelen ?istasyon=slug parametresi
  const stationParamHandled = useRef(false);
  useEffect(() => {
    if (stationParamHandled.current || !result) return;
    const slug = searchParams.get('istasyon');
    if (!slug) return;
    stationParamHandled.current = true;
    const s = result.stations.find((x) => x.slug === slug);
    if (s) window.setTimeout(() => selectStation(s), 300);
  }, [result, searchParams, selectStation]);

  const panelProps = {
    filters,
    onChange: setFilters,
    operators,
    connectorTypes,
    resultCount: filtered.length,
    totalCount: stations.length,
  };

  const searchForm = (
    <form onSubmit={onSearchSubmit} role="search" className="flex gap-2">
      <label className="relative flex-1">
        <span className="sr-only">Şehir, ilçe veya adres</span>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Şehir, ilçe veya adres ara"
          className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2.5 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={searching}
        className="rounded-lg bg-green-500 px-4 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-60"
      >
        {searching ? '…' : 'Ara'}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-black pt-18">
      <div className="relative h-[calc(100dvh-4.5rem)] flex">
        <aside className="hidden lg:flex w-96 shrink-0 flex-col border-r border-gray-800 bg-black">
          <div className="p-5 space-y-5 border-b border-gray-800">
            {searchForm}
            <FilterPanel {...panelProps} />
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-white">
              <List className="h-4 w-4 text-green-400" /> {userPos ? 'Size en yakın istasyonlar' : 'İstasyonlar'}
            </h2>
            <StationList stations={sorted} onSelect={selectStation} selectedId={selectedId} />
          </div>
          <p className="border-t border-gray-800 px-5 py-3 text-[11px] leading-snug text-gray-500">
            İstasyon bilgileri bilgilendirme amaçlıdır; doğruluğu garanti edilmez. Yola çıkmadan önce operatörün
            uygulamasından kontrol edin.
          </p>
        </aside>

        <div className="relative flex-1">
          <MapContainer center={TURKEY_CENTER} zoom={6} style={{ width: '100%', height: '100%' }} className="z-10">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {/* Open Charge Map verisi CC BY 4.0 lisanslıdır; atıf zorunludur */}
            {usesOcm && <ExtraAttribution html={OCM_ATTRIBUTION} />}
            <FlyTo target={flyTarget} />
            <CenterTracker onChange={setCenter} />

            {userPos && (
              <CircleMarker center={userPos} radius={8} pathOptions={{ color: '#fff', weight: 2, fillColor: '#3b82f6', fillOpacity: 1 }}>
                <Popup>Konumunuz</Popup>
              </CircleMarker>
            )}

            <MarkerClusterGroup
              ref={clusterRef}
              chunkedLoading
              showCoverageOnHover={false}
              maxClusterRadius={50}
              spiderfyOnMaxZoom
              iconCreateFunction={clusterIcon}
            >
            {filtered.map((station) => (
              <Marker
                key={station.id}
                position={[station.latitude, station.longitude]}
                icon={markerIcon(station.operator?.color ?? FALLBACK_COLOR, hasCurrent(station, 'DC'))}
                eventHandlers={{ click: () => setSelectedId(station.id) }}
                ref={(m) => {
                  if (m) markerRefs.current.set(station.id, m);
                  else markerRefs.current.delete(station.id);
                }}
              >
                <Popup maxWidth={300}>
                  <StationPopup station={station} />
                </Popup>
              </Marker>
            ))}
            </MarkerClusterGroup>
          </MapContainer>

          {/* Mobil arama kutusu */}
          <div className="lg:hidden absolute top-3 left-14 right-3 z-[401]">{searchForm}</div>

          {result?.source === 'sample' && (
            <div className="absolute top-16 lg:top-3 left-14 right-3 sm:right-auto z-[401] sm:max-w-sm bg-black/85 border border-yellow-500/40 text-yellow-300 text-xs font-semibold rounded-lg px-3 py-2 backdrop-blur-md">
              Örnek veri: Haritadaki istasyonlar ve operatörler kurgusaldır; gerçek veriler yakında eklenecek.
            </div>
          )}

          {!result && (
            <div className="absolute inset-0 z-[402] flex items-center justify-center bg-black/40 text-white text-sm">
              <Zap className="h-4 w-4 mr-2 animate-pulse text-green-400" /> İstasyonlar yükleniyor…
            </div>
          )}

          <div className="absolute bottom-20 lg:bottom-6 right-4 z-[401] flex flex-col items-end gap-2">
            {message && (
              <div
                className={`max-w-xs rounded-lg border bg-black/90 px-3 py-2 text-xs ${
                  message.kind === 'error' ? 'border-red-500/40 text-red-300' : 'border-gray-700 text-gray-200'
                }`}
              >
                {message.text}
              </div>
            )}
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              aria-label="Konumuma git"
              title="Konumuma git"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-black shadow-lg shadow-green-500/30 hover:bg-green-400 disabled:opacity-60"
            >
              <Crosshair className={`h-5 w-5 ${locating ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Mobil alt çekmece: kapalıyken yalnızca küçük bir çubuk, açıkken ekranın en fazla %55'i */}
          <div className="lg:hidden absolute inset-x-0 bottom-0 z-[403]">
            {drawer === 'closed' ? (
              <div className="flex gap-2 px-3 pt-3 pb-7">
                <button
                  type="button"
                  onClick={() => setDrawer('list')}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-gray-700 bg-black/90 px-4 py-3 text-sm font-semibold text-white shadow-lg"
                >
                  <ChevronUp className="h-4 w-4 text-green-400" /> Liste
                  <span className="rounded-full bg-green-500 px-2 text-xs text-black">{filtered.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDrawer('filters')}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-black/90 px-4 py-3 text-sm font-semibold text-white shadow-lg"
                >
                  <SlidersHorizontal className="h-4 w-4 text-green-400" /> Filtreler
                </button>
              </div>
            ) : (
              <div className="max-h-[55dvh] overflow-y-auto rounded-t-2xl border-t border-gray-800 bg-black p-5 shadow-2xl">
                {drawer === 'filters' ? (
                  <FilterPanel {...panelProps} onClose={() => setDrawer('closed')} />
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 font-bold text-white">
                        <List className="h-4 w-4 text-green-400" /> {filtered.length} istasyon
                      </h2>
                      <button onClick={() => setDrawer('closed')} aria-label="Listeyi kapat" className="text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <StationList stations={sorted} onSelect={selectStation} selectedId={selectedId} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
