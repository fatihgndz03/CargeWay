import { ArrowUpRight, BarChart3, Clock, PlugZap, Scale, type LucideIcon } from 'lucide-react';
import { HABERLER, formatTarih, type HaberKategori } from '../data/haberler';

const KATEGORI_STIL: Record<HaberKategori, { icon: LucideIcon; badge: string; gradient: string; iconColor: string }> = {
  Altyapı: {
    icon: PlugZap,
    badge: 'bg-green-500/10 text-green-400 border-green-500/20',
    gradient: 'from-green-500/25 via-green-500/5 to-transparent',
    iconColor: 'text-green-400',
  },
  Pazar: {
    icon: BarChart3,
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    gradient: 'from-blue-500/25 via-blue-500/5 to-transparent',
    iconColor: 'text-blue-400',
  },
  Mevzuat: {
    icon: Scale,
    badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    gradient: 'from-yellow-500/25 via-yellow-500/5 to-transparent',
    iconColor: 'text-yellow-400',
  },
};

export default function News() {
  if (HABERLER.length === 0) return null;
  const [featured, ...rest] = HABERLER;
  const fStil = KATEGORI_STIL[featured.kategori];
  const FIcon = fStil.icon;

  return (
    <section id="haberler" className="bg-black py-24 border-t border-gray-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">Son Haberler</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            EV Dünyasından
            <br />
            Güncel Gelişmeler
          </h2>
          <p className="mt-4 text-sm text-gray-500 max-w-2xl">
            Haberler kaynaklarından kısaca özetlenmiştir; ayrıntılar için kaynağa gidin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <a
            href={featured.kaynakUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="lg:col-span-2 group relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 hover:border-green-500/30 transition-all duration-300 flex flex-col"
          >
            <div className={`relative h-48 sm:h-56 bg-gradient-to-br ${fStil.gradient} flex items-center justify-center`}>
              <FIcon className={`w-20 h-20 ${fStil.iconColor} opacity-80`} strokeWidth={1.5} />
              <span className={`absolute top-4 left-4 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${fStil.badge}`}>
                {featured.kategori}
              </span>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors leading-snug">
                {featured.baslik}
              </h3>
              <p className="text-gray-400 leading-relaxed mb-5 text-sm sm:text-base">{featured.ozet}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <time dateTime={featured.tarih}>{formatTarih(featured.tarih)}</time> · {featured.kaynakAdi}
                </span>
                <span className="inline-flex items-center gap-1 text-green-500 text-sm font-semibold">
                  Kaynağa git <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </a>

          <div className="flex flex-col gap-4">
            {rest.map((item) => {
              const stil = KATEGORI_STIL[item.kategori];
              const Icon = stil.icon;
              return (
                <a
                  key={item.id}
                  href={item.kaynakUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-4 p-4 bg-gray-900 border border-gray-800 hover:border-green-500/30 rounded-2xl transition-all duration-300"
                >
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${stil.gradient} border border-gray-800 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stil.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${stil.badge} mb-2`}>
                      {item.kategori}
                    </span>
                    <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-green-400 transition-colors">
                      {item.baslik}
                    </h3>
                    <div className="text-xs text-gray-500 mt-2">
                      <time dateTime={item.tarih}>{formatTarih(item.tarih)}</time> · {item.kaynakAdi}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
