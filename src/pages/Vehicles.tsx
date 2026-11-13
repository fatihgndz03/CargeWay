import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, Search, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSeo } from '../lib/seo';
import { MARKALAR, MODELLER } from '../data/araclar';

// "Ioniq"/"ioniq" ve "İstanbul"/"istanbul" gibi yazımlar eşleşsin diye ı/i farkı yok sayılır.
const normalize = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/̇/g, '');

export default function VehiclesPage() {
  useSeo(
    'Elektrikli Araçlar | CargeWay',
    "Türkiye'de satılan tam elektrikli otomobil modelleri, markaya göre listelenmiş.",
  );

  const [marka, setMarka] = useState<string>('tumu');
  const [arama, setArama] = useState('');

  const sayilar = useMemo(() => {
    const m: Record<string, number> = {};
    for (const v of MODELLER) m[v.marka] = (m[v.marka] ?? 0) + 1;
    return m;
  }, []);

  const gruplar = useMemo(() => {
    const q = normalize(arama.trim());
    return MARKALAR.filter((b) => marka === 'tumu' || b.slug === marka)
      .map((b) => ({
        marka: b,
        modeller: MODELLER.filter(
          (v) => v.marka === b.slug && (!q || normalize(`${b.ad} ${v.ad}`).includes(q)),
        ),
      }))
      .filter((g) => g.modeller.length > 0);
  }, [marka, arama]);

  const toplam = gruplar.reduce((n, g) => n + g.modeller.length, 0);

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">Araçlar</span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-2">Elektrikli Araçlar</h1>
          <p className="mt-4 text-gray-400 max-w-2xl">
            Türkiye'de satılan tam elektrikli modeller. Menzil, batarya ve şarj hızı gibi teknik bilgiler doğrulanmış
            kaynaklardan eklenene kadar güncel değerler için üreticinin sitesine bakın.
          </p>

          <div className="mt-8 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="search"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Marka veya model ara"
              aria-label="Marka veya model ara"
              className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-500 rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:border-green-500/60"
            />
            {arama && (
              <button
                onClick={() => setArama('')}
                aria-label="Aramayı temizle"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {[{ slug: 'tumu', ad: 'Tümü' }, ...MARKALAR].map((b) => {
              const aktif = marka === b.slug;
              const sayi = b.slug === 'tumu' ? MODELLER.length : sayilar[b.slug];
              return (
                <button
                  key={b.slug}
                  onClick={() => setMarka(b.slug)}
                  className={`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    aktif
                      ? 'bg-green-500 text-black'
                      : 'bg-gray-900 border border-gray-800 text-gray-300 hover:border-green-500/50'
                  }`}
                >
                  {b.ad} <span className={aktif ? 'text-black/60' : 'text-gray-500'}>{sayi}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-sm text-gray-500">{toplam} model</p>

          {gruplar.length === 0 ? (
            <div className="mt-10 text-center text-gray-400">Aramanızla eşleşen model bulunamadı.</div>
          ) : (
            <div className="mt-4 space-y-10">
              {gruplar.map((g) => (
                <section key={g.marka.slug}>
                  <h2 className="text-xl font-bold text-white mb-4">{g.marka.ad}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {g.modeller.map((v) => (
                      <div
                        key={`${v.marka}-${v.ad}`}
                        className="flex items-center gap-4 p-5 bg-gray-900 border border-gray-800 rounded-2xl"
                      >
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                          <Car className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                            {g.marka.ad}
                          </div>
                          <h3 className="text-lg font-bold text-white truncate">{v.ad}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <div className="mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-2xl border border-green-500/20 bg-green-500/5">
            <p className="text-gray-300 flex-1">Aracınıza uygun şarj noktasını haritada bulun.</p>
            <Link
              to="/sarj-haritasi"
              className="inline-flex items-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl"
            >
              <MapPin className="w-4 h-4" /> Şarj haritasını aç
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
