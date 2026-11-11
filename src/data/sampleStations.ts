import type { Operator, Station } from '../lib/stations';

/**
 * ÖRNEK VERİ — gerçek istasyonları temsil ETMEZ.
 * Yalnızca harita arayüzünü (filtreler, işaretçiler) geliştirmek için kullanılır.
 * Supabase'de gerçek istasyon verisi olduğunda otomatik olarak devre dışı kalır.
 * Operatör adları bilerek kurgusal tutulmuştur.
 */

const opA: Operator = { id: 'ornek-op-a', slug: 'ornek-operator-a', name: 'Örnek Operatör A', website: null, color: '#22c55e' };
const opB: Operator = { id: 'ornek-op-b', slug: 'ornek-operator-b', name: 'Örnek Operatör B', website: null, color: '#3b82f6' };
const opC: Operator = { id: 'ornek-op-c', slug: 'ornek-operator-c', name: 'Örnek Operatör C', website: null, color: '#f97316' };

function station(
  n: number,
  city: string,
  latitude: number,
  longitude: number,
  operator: Operator,
  connectors: Station['connectors']
): Station {
  return {
    id: `ornek-${n}`,
    slug: `ornek-istasyon-${n}`,
    name: `Örnek İstasyon ${n} (${city})`,
    address: null,
    city,
    district: null,
    latitude,
    longitude,
    operator,
    connectors,
    isSample: true,
  };
}

export const SAMPLE_STATIONS: Station[] = [
  station(1, 'İstanbul', 40.9833, 29.0333, opA, [
    { id: 'c1a', connectorType: 'ccs2', currentType: 'DC', powerKw: 180, quantity: 2 },
    { id: 'c1b', connectorType: 'type2', currentType: 'AC', powerKw: 22, quantity: 2 },
  ]),
  station(2, 'Ankara', 39.9208, 32.8541, opB, [
    { id: 'c2a', connectorType: 'ccs2', currentType: 'DC', powerKw: 120, quantity: 1 },
    { id: 'c2b', connectorType: 'chademo', currentType: 'DC', powerKw: 50, quantity: 1 },
  ]),
  station(3, 'İzmir', 38.4189, 27.1287, opC, [
    { id: 'c3a', connectorType: 'type2', currentType: 'AC', powerKw: 22, quantity: 4 },
  ]),
  station(4, 'Bursa', 40.1826, 29.0669, opA, [
    { id: 'c4a', connectorType: 'ccs2', currentType: 'DC', powerKw: 60, quantity: 1 },
    { id: 'c4b', connectorType: 'type2', currentType: 'AC', powerKw: 11, quantity: 1 },
  ]),
  station(5, 'Antalya', 36.8841, 30.7056, opB, [
    { id: 'c5a', connectorType: 'type2', currentType: 'AC', powerKw: 7.4, quantity: 2 },
  ]),
];
