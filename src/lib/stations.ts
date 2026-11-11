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
        'id, slug, name, address, city, district, latitude, longitude, is_sample, ' +
          'operator:operators(id, slug, name, website, color), ' +
          'connectors(id, connector_type, current_type, power_kw, quantity)'
      )
      .limit(10000);

    if (!error && data && data.length > 0) {
      return { stations: (data as unknown as StationRow[]).map(mapRow), source: 'supabase' };
    }
  }
  return { stations: SAMPLE_STATIONS, source: 'sample' };
}
