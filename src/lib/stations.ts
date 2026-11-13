import { supabase } from './supabase';
import { SAMPLE_STATIONS } from '../data/sampleStations';

export type CurrentType = 'AC' | 'DC';

export type ConnectorType =
  | 'type2'
  | 'ccs2'
  | 'chademo'
  | 'type1'
  | 'ccs1'
  | 'gbt'
  | 'schuko'
  | 'tesla'
  | 'other';

export interface Operator {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  color: string | null;
}

export interface Connector {
  id: string;
  connectorType: ConnectorType;
  currentType: CurrentType;
  powerKw: number | null;
  quantity: number;
}

export interface Station {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  city: string | null;
  district: string | null;
  latitude: number;
  longitude: number;
  operator: Operator | null;
  connectors: Connector[];
  isSample: boolean;
  /** Veri kaynağı kodu ('ocm', 'csv:…', 'manual'); örnek veride null */
  source?: string | null;
}

export const CONNECTOR_LABELS: Record<ConnectorType, string> = {
  type2: 'Type 2',
  ccs2: 'CCS2',
  chademo: 'CHAdeMO',
  type1: 'Type 1',
  ccs1: 'CCS1',
  gbt: 'GB/T',
  schuko: 'Schuko',
  tesla: 'Tesla',
  other: 'Diğer',
};

/** İstasyondaki en yüksek soket gücü (kW). Bilinmiyorsa null. */
export function maxPower(station: Station): number | null {
  const powers = station.connectors
    .map((c) => c.powerKw)
    .filter((p): p is number => typeof p === 'number');
  return powers.length ? Math.max(...powers) : null;
}

export function hasCurrent(station: Station, current: CurrentType): boolean {
  return station.connectors.some((c) => c.currentType === current);
}

/** Google Haritalar yol tarifi bağlantısı (uygulama yüklüyse mobilde uygulamayı açar). */
export function directionsUrl(station: Station): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
}

export interface StationFilters {
  current: 'all' | CurrentType;
  minPowerKw: number;
  connectorTypes: ConnectorType[];
  operatorSlug: string; // '' = tümü
}

export const DEFAULT_FILTERS: StationFilters = {
  current: 'all',
  minPowerKw: 0,
  connectorTypes: [],
  operatorSlug: '',
};

/**
 * Soket bazlı filtre: istasyon, TÜM koşulları aynı anda sağlayan
 * en az bir sokete sahipse listede kalır.
 */
export function filterStations(stations: Station[], f: StationFilters): Station[] {
  return stations.filter((s) => {
    if (f.operatorSlug && s.operator?.slug !== f.operatorSlug) return false;
    return s.connectors.some((c) => {
      if (f.current !== 'all' && c.currentType !== f.current) return false;
      if (f.minPowerKw > 0 && (c.powerKw ?? 0) < f.minPowerKw) return false;
      if (f.connectorTypes.length && !f.connectorTypes.includes(c.connectorType)) return false;
      return true;
    });
  });
}

// --- Supabase -------------------------------------------------------------

interface StationRow {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  city: string | null;
  district: string | null;
  latitude: number;
  longitude: number;
  is_sample: boolean;
  source?: string | null;
  operator: { id: string; slug: string; name: string; website: string | null; color: string | null } | null;
  connectors: {
    id: string;
    connector_type: ConnectorType;
    current_type: CurrentType;
    power_kw: number | string | null;
    quantity: number;
  }[];
}

function mapRow(r: StationRow): Station {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    address: r.address,
    city: r.city,
    district: r.district,
    latitude: r.latitude,
    longitude: r.longitude,
    isSample: r.is_sample,
    source: r.source ?? null,
    operator: r.operator,
    connectors: r.connectors.map((c) => ({
      id: c.id,
      connectorType: c.connector_type,
      currentType: c.current_type,
      powerKw: c.power_kw === null ? null : Number(c.power_kw),
      quantity: c.quantity,
    })),
  };
}

export interface StationsResult {
  stations: Station[];
  /** 'supabase' = gerçek veritabanı, 'sample' = yerleşik örnek veri */
  source: 'supabase' | 'sample';
}

/**
 * İstasyonları Supabase'den yükler. Supabase yapılandırılmamışsa, tablolar henüz
 * oluşturulmamışsa veya tabloda kayıt yoksa açıkça işaretli örnek veriye düşer.
 */
export async function loadStations(): Promise<StationsResult> {
  if (supabase) {
    const { data, error } = await supabase
      .from('stations')
      .select(
        'id, slug, name, address, city, district, latitude, longitude, is_sample, source, ' +
          'operator:operators(id, slug, name, website, color), ' +
          'connectors(id, connector_type, current_type, power_kw, quantity)'
      )
      .limit(20000);

    if (!error && data && data.length > 0) {
      return { stations: (data as unknown as StationRow[]).map(mapRow), source: 'supabase' };
    }
  }
  return { stations: SAMPLE_STATIONS, source: 'sample' };
}

/** İki koordinat arası kuş uçuşu mesafe (km). */
export function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface GeocodeResult {
  label: string;
  position: [number, number];
}

/** Yer adı → koordinat (OpenStreetMap Nominatim, yalnızca Türkiye). */
export async function geocode(query: string): Promise<GeocodeResult | null> {
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=tr&accept-language=tr&q=' +
    encodeURIComponent(query);
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  const data = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  if (!data.length) return null;
  return { label: data[0].display_name, position: [Number(data[0].lat), Number(data[0].lon)] };
}

// --- Tek istasyon (detay sayfası) -------------------------------------------

export type StationStatus = 'operational' | 'planned' | 'out_of_service' | 'unknown';

export interface StationDetail extends Station {
  openingHours: string | null;
  accessType: 'public' | 'restricted' | 'private' | null;
  status: StationStatus | null;
  source: string | null;
  sourceUpdatedAt: string | null;
}

export const STATUS_LABELS: Record<StationStatus, string> = {
  operational: 'Çalışıyor (kaynağa göre)',
  planned: 'Planlanıyor',
  out_of_service: 'Hizmet dışı (kaynağa göre)',
  unknown: 'Durum bilinmiyor',
};

export const ACCESS_LABELS: Record<NonNullable<StationDetail['accessType']>, string> = {
  public: 'Herkese açık',
  restricted: 'Kısıtlı erişim (ör. müşterilere / sakinlere)',
  private: 'Özel',
};

/** Veri kaynağı kodunu okunur hale getirir. */
export function sourceLabel(source: string | null): string | null {
  if (!source) return null;
  if (source === 'ocm') return 'Open Charge Map (CC BY 4.0)';
  if (source === 'manual') return 'CargeWay (elle girildi)';
  if (source.startsWith('csv:')) return `Operatör/CSV listesi (${source.slice(4)})`;
  return source;
}

/** Slug ile tek istasyon getirir. Bulunamazsa null. */
export async function loadStationBySlug(slug: string): Promise<StationDetail | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('stations')
      .select(
        'id, slug, name, address, city, district, latitude, longitude, is_sample, ' +
          'opening_hours, access_type, status, source_updated_at, ' +
          'operator:operators(id, slug, name, website, color), ' +
          'connectors(id, connector_type, current_type, power_kw, quantity)'
      )
      .eq('slug', slug)
      .maybeSingle();
    if (!error && data) {
      const row = data as unknown as StationRow & {
        opening_hours: string | null;
        access_type: StationDetail['accessType'];
        status: StationStatus | null;
        source: string | null;
        source_updated_at: string | null;
      };
      return {
        ...mapRow(row),
        openingHours: row.opening_hours,
        accessType: row.access_type,
        status: row.status,
        source: row.source ?? null,
        sourceUpdatedAt: row.source_updated_at,
      };
    }
  }
  const sample = SAMPLE_STATIONS.find((s) => s.slug === slug);
  return sample
    ? { ...sample, openingHours: null, accessType: null, status: null, source: null, sourceUpdatedAt: null }
    : null;
}

/** Yakındaki istasyonlar (kendisi hariç), en yakından uzağa. */
export function nearbyStations(all: Station[], from: Station, limit = 5): { station: Station; distance: number }[] {
  return all
    .filter((s) => s.id !== from.id)
    .map((s) => ({ station: s, distance: distanceKm([from.latitude, from.longitude], [s.latitude, s.longitude]) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

/** Apple Haritalar yol tarifi bağlantısı. */
export function appleMapsUrl(station: Station): string {
  return `https://maps.apple.com/?daddr=${station.latitude},${station.longitude}`;
}

/** Yandex Haritalar yol tarifi bağlantısı. */
export function yandexMapsUrl(station: Station): string {
  return `https://yandex.com.tr/harita/?rtext=~${station.latitude},${station.longitude}&rtt=auto`;
}
