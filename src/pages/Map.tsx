import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Zap, DollarSign, Wifi } from 'lucide-react';

const chargingStations = [
  {
    id: 1,
    name: 'ZES İstanbul Kadıköy',
    network: 'ZES',
    lat: 40.9833,
    lng: 29.0333,
    status: 'Müsait',
    power: 150,
    price: 12.5,
    available: 8,
    total: 12,
  },
  {
    id: 2,
    name: 'Eşarj Ankara Çankaya',
    network: 'Eşarj',
    lat: 39.9208,
    lng: 32.8541,
    status: 'Dolu',
    power: 120,
    price: 11.8,
    available: 0,
    total: 10,
  },
  {
    id: 3,
    name: 'Voltrun İzmir Alsancak',
    network: 'Voltrun',
    lat: 38.4189,
    lng: 27.1287,
    status: 'Müsait',
    power: 100,
    price: 10.9,
    available: 5,
    total: 8,
  },
  {
    id: 4,
    name: 'ZES Bursa',
    network: 'ZES',
    lat: 40.1826,
    lng: 29.0669,
    status: 'Müsait',
    power: 150,
    price: 12.0,
    available: 3,
    total: 6,
  },
  {
    id: 5,
    name: 'Eşarj Antalya',
    network: 'Eşarj',
    lat: 36.8841,
    lng: 30.7056,
    status: 'Müsait',
    power: 120,
    price: 13.2,
    available: 6,
    total: 8,
  },
];

const networks = ['Tümü', 'ZES', 'Eşarj', 'Voltrun'];

const networkColors: Record<string, { marker: string; border: string; bg: string }> = {
  ZES: { marker: '#22c55e', border: 'border-green-500/30', bg: 'bg-green-500/10' },
  Eşarj: { marker: '#3b82f6', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  Voltrun: { marker: '#f97316', border: 'border-orange-500/30', bg: 'bg-orange-500/10' },
};

function createMarkerIcon(color: string) {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 32px; height: 40px; border-radius: 4px 4px 0 0; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="3 22 9.46 15.46"></polyline><circle cx="11" cy="11" r="8"></circle></svg>
    </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

export default function Map() {
  const [selectedNetwork, setSelectedNetwork] = useState('Tümü');

  const filteredStations = useMemo(() => {
    if (selectedNetwork === 'Tümü') return chargingStations;
    return chargingStations.filter((station) => station.network === selectedNetwork);
  }, [selectedNetwork]);

  const center: [number, number] = [39.0, 35.0];

  return (
    <div className="min-h-screen bg-black pt-18">
      <div className="relative h-[calc(100vh-72px)]">
        <MapContainer
          center={center}
          zoom={6}
          style={{ width: '100%', height: '100%' }}
          className="z-10"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {filteredStations.map((station) => {
            const colors = networkColors[station.network];
            return (
              <Marker
                key={station.id}
                position={[station.lat, station.lng]}
                icon={createMarkerIcon(colors.marker)}
              >
                <Popup maxWidth={300}>
                  <div className="p-2">
                    <h3 className="font-bold text-gray-900 mb-2">{station.name}</h3>

                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700 font-semibold">{station.network}</span>
                      </div>
                      <div className={`px-2 py-1 rounded font-semibold text-xs ${station.status === 'Müsait' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {station.status}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm border-t border-gray-200 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          Güç
                        </span>
                        <span className="font-semibold text-gray-900">{station.power} kW</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Fiyat
                        </span>
                        <span className="font-semibold text-gray-900">₺{station.price.toFixed(2)}/kWh</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Müsait
                        </span>
                        <span className="font-semibold text-gray-900">
                          {station.available}/{station.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        <div className="absolute top-4 left-4 z-[401] flex gap-2 flex-wrap">
          {networks.map((network) => (
            <button
              key={network}
              onClick={() => setSelectedNetwork(network)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                selectedNetwork === network
                  ? 'bg-green-500 text-black shadow-lg shadow-green-500/30'
                  : 'bg-black/80 backdrop-blur-md border border-gray-700 text-white hover:border-green-500/50'
              }`}
            >
              {network}
            </button>
          ))}
        </div>

        <div className="absolute top-4 right-4 z-[401] max-w-xs bg-yellow-500/15 border border-yellow-500/40 text-yellow-300 text-xs font-semibold rounded-lg px-3 py-2 backdrop-blur-md">
          Örnek veri: Haritadaki istasyonlar, konum, fiyat ve doluluk bilgileri temsilidir; gerçek veriler yakında eklenecek.
        </div>

        <div className="absolute bottom-4 right-4 z-[401] bg-black/80 backdrop-blur-md border border-gray-700 rounded-xl p-4 max-w-xs">
          <h3 className="font-bold text-white mb-2">Sonuçlar</h3>
          <p className="text-sm text-gray-400 mb-3">
            {filteredStations.length} istasyon bulundu
          </p>
          <div className="space-y-2 text-xs">
            {filteredStations.map((station) => (
              <div key={station.id} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                <div>
                  <p className="text-gray-200 font-semibold">{station.name}</p>
                  <p className="text-gray-500">{station.network}</p>
                </div>
                <div className={`px-2 py-1 rounded font-semibold ${station.status === 'Müsait' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {station.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
