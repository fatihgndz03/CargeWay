import { Link } from 'react-router-dom';
import { MapPin, Zap, SlidersHorizontal, Navigation, Crosshair } from 'lucide-react';

type PinSize = 'sm' | 'md' | 'lg';
const PIN_SIZE: Record<PinSize, string> = { sm: 'w-6 h-6', md: 'w-8 h-8', lg: 'w-10 h-10' };
const PINS: { top: string; left: string; size: PinSize }[] = [
  { top: '25%', left: '30%', size: 'lg' },
  { top: '45%', left: '60%', size: 'sm' },
  { top: '65%', left: '25%', size: 'md' },
  { top: '30%', left: '70%', size: 'sm' },
  { top: '70%', left: '55%', size: 'sm' },
  { top: '50%', left: '42%', size: 'lg' },
];

const features = [
  { icon: Crosshair, text: 'Konumunuza göre yakındaki istasyonlar' },
  { icon: Zap, text: 'AC (normal) / DC (hızlı) şarj filtresi' },
  { icon: SlidersHorizontal, text: 'Operatör, güç ve soket tipine göre filtreleme' },
  { icon: Navigation, text: 'Tek dokunuşla yol tarifi' },
];

export default function MapTeaser() {
  return (
    <section id="harita" className="bg-black py-24 border-t border-gray-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">Şarj Haritası</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-6 leading-tight">
              Size En Yakın<br />Şarj İstasyonunu<br />Saniyeler İçinde Bulun
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Türkiye genelindeki farklı şarj ağlarının istasyonlarını tek haritada görebilir, soket ve güç bilgilerini karşılaştırabilir ve yol tarifi alabilirsiniz.
            </p>

            <ul className="space-y-4 mb-10">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-gray-300 font-medium">{text}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/sarj-haritasi"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all duration-200 shadow-xl shadow-green-500/25 text-lg"
            >
              <MapPin className="w-5 h-5" />
              Haritayı Aç
            </Link>
          </div>

          <div className="relative">
            <div className="relative bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden h-96 lg:h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-90" />

              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: 'linear-gradient(rgba(74,222,128,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.6) 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }}
              />

              {PINS.map((pin, i) => (
                <div
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ top: pin.top, left: pin.left }}
                >
                  {pin.size === 'lg' && (
                    <div className="absolute inset-0 -m-4 rounded-full bg-green-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                  )}
                  <div className={`relative ${PIN_SIZE[pin.size]} bg-green-500 shadow-lg shadow-green-500/50 rounded-full flex items-center justify-center border-2 border-green-300`}>
                    <Zap className={`${pin.size === 'sm' ? 'w-2.5 h-2.5' : 'w-4 h-4'} text-black`} fill="currentColor" />
                  </div>
                </div>
              ))}

              <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-4">
                <div className="text-white font-bold text-sm">Temsili görsel</div>
                <div className="text-gray-400 text-xs mt-0.5">Gerçek istasyonları görmek için haritayı açın.</div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-green-500/5 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
