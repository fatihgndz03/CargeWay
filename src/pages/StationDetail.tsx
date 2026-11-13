import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, Clock, ExternalLink, Info, MapPin, Navigation, Plug, ShieldCheck, Zap } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { applySeo, DEFAULT_DESCRIPTION } from '../lib/seo';
import {
  ACCESS_LABELS,
  CONNECTOR_LABELS,
  STATUS_LABELS,
  appleMapsUrl,
  directionsUrl,
  loadStationBySlug,
  loadStations,
  maxPower,
  nearbyStations,
  sourceLabel,
  yandexMapsUrl,
  type Station,
  type StationDetail as StationDetailT,
} from '../lib/stations';

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:36px;height:36px">
    <div style="background:#22c55e;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding-bottom:2px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#000"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

type LoadState =
  | { kind: 'loading' }
  | { kind: 'notfound' }
  | { kind: 'ok'; station: StationDetailT; nearby: { station: Station; distance: number }[] };

export default function StationDetailPage() {
  const { slug = '' } = useParams();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ kind: 'loading' });
    window.scrollTo(0, 0);
    Promise.all([loadStationBySlug(slug), loadStations()]).then(([station, all]) => {
      if (cancelled) return;
      if (!station) {
        setState({ kind: 'notfound' });
        return;
      }
      setState({ kind: 'ok', station, nearby: nearbyStations(all.stations, station) });
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (state.kind === 'notfound') {
      applySeo('İstasyon bulunamadı | CargeWay', DEFAULT_DESCRIPTION);
      return;
    }
    if (state.kind !== 'ok') return;
    const s = state.station;
    const place = [s.district, s.city].filter(Boolean).join(', ');
    const types = [...new Set(s.connectors.map((c) => CONNECTOR_LABELS[c.connectorType]))].join(', ');
    const p = maxPower(s);
    applySeo(
      `${s.name}${place ? ` — ${place}` : ''} şarj istasyonu | CargeWay`,
      `${s.name}${place ? ` (${place})` : ''}: ${types || 'soket bilgisi yok'}${p ? `, en fazla ${p} kW` : ''}. Konum, soketler ve yol tarifi CargeWay'de.`
    );
  }, [state]);

  return (
    <div className="bg-black min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20 text-gray-300">
        <Link to="/sarj-haritasi" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400 mb-6">
          <ArrowLeft className="h-4 w-4" /> Şarj haritasına dön
        </Link>

        {state.kind === 'loading' && (
          <p className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 animate-pulse text-green-400" /> İstasyon yükleniyor…
          </p>
        )}

        {state.kind === 'notfound' && (
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">İstasyon bulunamadı</h1>
            <p className="text-sm text-gray-400 mb-6">Bu adres kaldırılmış ya da hatalı olabilir.</p>
            <Link to="/sarj-haritasi" className="inline-block rounded-lg bg-green-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-green-400">
              Haritada ara
            </Link>
          </div>
        )}

        {state.kind === 'ok' && <Detail station={state.station} nearby={state.nearby} />}
      </main>
      <Footer />
    </div>
  );
}

function Detail({ station: s, nearby }: { station: StationDetailT; nearby: { station: Station; distance: number }[] }) {
  const power = maxPower(s);
  const place = [s.district, s.city].filter(Boolean).join(', ');
  const src = sourceLabel(s.source);

  return (
    <>
      {s.isSample && (
        <p className="mb-5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-300">
          Örnek veri: Bu istasyon ve operatörü kurgusaldır, gerçek bir şarj noktasını temsil etmez.
        </p>
      )}

      <header className="mb-8">
        <p className="text-sm text-green-400 font-semibold mb-1">{s.operator?.name ?? 'Operatör bilinmiyor'}</p>
        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">{s.name}</h1>
        {(s.address || place) && (
          <p className="mt-2 flex items-start gap-1.5 text-gray-400">
            <MapPin className="h-4 w-4 mt-1 shrink-0" />
            <span>{[s.address, place].filter(Boolean).join(' · ')}</span>
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
              <Plug className="h-4 w-4 text-green-400" /> Soketler
            </h2>
            {s.connectors.length === 0 ? (
              <p className="text-sm text-gray-500">Soket bilgisi yok.</p>
            ) : (
              <ul className="divide-y divide-gray-800">
                {s.connectors.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-3">
                    <span>
                      <span className="font-semibold text-white">
                        {c.quantity}× {CONNECTOR_LABELS[c.connectorType]}
                      </span>{' '}
                      <span className={c.currentType === 'DC' ? 'text-orange-400' : 'text-sky-400'}>
                        {c.currentType === 'DC' ? 'DC (hızlı)' : 'AC'}
                      </span>
                    </span>
                    <span className="font-bold text-white">{c.powerKw ? `${c.powerKw} kW` : '—'}</span>
                  </li>
                ))}
              </ul>
            )}
            {power !== null && <p className="mt-3 text-xs text-gray-500">En yüksek güç: {power} kW</p>}
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5 space-y-3 text-sm">
            <h2 className="flex items-center gap-2 font-bold text-white text-base">
              <Info className="h-4 w-4 text-green-400" /> Bilgiler
            </h2>
            {s.openingHours && (
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" /> Çalışma saatleri: <span className="text-white">{s.openingHours}</span>
              </p>
            )}
            {s.accessType && (
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gray-500" /> {ACCESS_LABELS[s.accessType]}
              </p>
            )}
            {s.status && s.status !== 'unknown' && <p>Durum: {STATUS_LABELS[s.status]}</p>}
            {s.operator?.website && (
              <p>
                <a
                  href={s.operator.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-green-400 hover:underline"
                >
                  {s.operator.name} web sitesi <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </p>
            )}
            <p className="text-xs text-gray-500 border-t border-gray-800 pt-3">
              Fiyat ve anlık doluluk bilgisi için operatörün uygulamasını kontrol edin. CargeWay bir şarj operatörü değildir.
              {src && <> Veri kaynağı: {src}.</>}
              {s.sourceUpdatedAt && <> Kaynakta son güncelleme: {new Date(s.sourceUpdatedAt).toLocaleDateString('tr-TR')}.</>}
            </p>
          </div>
        </section>

        <aside className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-gray-800">
            <div className="h-56">
              <MapContainer
                center={[s.latitude, s.longitude]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ width: '100%', height: '100%' }}
                className="z-10"
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <Marker position={[s.latitude, s.longitude]} icon={pinIcon} />
              </MapContainer>
            </div>
            <div className="grid grid-cols-1 gap-2 bg-gray-950 p-4">
              <a
                href={directionsUrl(s)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-green-400"
              >
                <Navigation className="h-4 w-4" /> Google Haritalar ile yol tarifi
              </a>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={appleMapsUrl(s)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-gray-700 px-3 py-2 text-center text-xs font-semibold text-white hover:border-green-500/50"
                >
                  Apple Haritalar
                </a>
                <a
                  href={yandexMapsUrl(s)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-gray-700 px-3 py-2 text-center text-xs font-semibold text-white hover:border-green-500/50"
                >
                  Yandex Haritalar
                </a>
              </div>
              <Link
                to={`/sarj-haritasi?istasyon=${encodeURIComponent(s.slug)}`}
                className="text-center text-xs font-semibold text-green-400 hover:underline pt-1"
              >
                Büyük haritada göster
              </Link>
            </div>
          </div>

          {nearby.length > 0 && (
            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
              <h2 className="mb-3 font-bold text-white">Yakındaki istasyonlar</h2>
              <ul className="space-y-2">
                {nearby.map(({ station: n, distance }) => (
                  <li key={n.id}>
                    <Link
                      to={`/istasyon/${n.slug}`}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-900"
                    >
                      <span className="text-white truncate">{n.name}</span>
                      <span className="shrink-0 text-xs text-gray-500">
                        {distance < 10 ? distance.toFixed(1) : Math.round(distance)} km
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
