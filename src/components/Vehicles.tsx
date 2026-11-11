import { ArrowUpRight, Car } from 'lucide-react';

/**
 * Sade araç kartları. Görsel ve teknik değerler (menzil, güç, şarj süresi)
 * doğrulanmış bir kaynaktan araç veritabanı kurulana kadar (Faz 3) gösterilmez.
 */
const vehicles = [
  { brand: 'Togg', name: 'T10X', body: 'SUV', note: 'Yerli üretim', url: 'https://www.togg.com.tr/' },
  { brand: 'Togg', name: 'T10F', body: 'Sedan', note: 'Yerli üretim', url: 'https://www.togg.com.tr/' },
  { brand: 'Tesla', name: 'Model Y', body: 'SUV', note: 'İthal', url: 'https://www.tesla.com/tr_tr/modely' },
];

export default function Vehicles() {
  return (
    <section id="araclar" className="bg-black py-24 border-t border-gray-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">Araçlar</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Türkiye'de Sık Görülen
            <br />
            Elektrikli Araçlar
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl">
            Menzil, batarya ve şarj hızı bilgilerini içeren araç rehberi hazırlanıyor. Şimdilik güncel teknik bilgiler için
            üreticinin sayfasına bakabilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <a
              key={`${v.brand}-${v.name}`}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-5 p-6 bg-gray-900 border border-gray-800 hover:border-green-500/30 rounded-2xl transition-all duration-300"
            >
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Car className="w-7 h-7 text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{v.brand}</div>
                <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">{v.name}</h3>
                <div className="text-xs text-gray-400 mt-1">
                  {v.body} · {v.note}
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-green-400 transition-colors" aria-label="Üretici sayfası" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
