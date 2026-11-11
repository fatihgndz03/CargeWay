import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-black flex items-center overflow-hidden pt-18">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-400/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/3 rounded-full blur-3xl" />

        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(74,222,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-8">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Türkiye'nin EV Şarj Platformu</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            Elektrikli Aracınızı
            <br />
            <span className="text-green-500 relative">
              Her Yerde
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 400 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8C80 3 160 1 200 2C240 3 320 5 398 9" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </span>{' '}
            Şarj Edin
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-10 max-w-2xl">
            CargeWay, Türkiye'deki farklı şarj ağlarının istasyonlarını tek haritada bir araya getirir. Size en yakın istasyonu bulun, soket ve güç bilgilerini karşılaştırın, elektrikli araç dünyasındaki gelişmeleri takip edin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/sarj-haritasi"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all duration-200 shadow-xl shadow-green-500/25 hover:shadow-green-400/35 text-lg"
            >
              <MapPin className="w-5 h-5" />
              Şarj İstasyonu Bul
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#haberler"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-gray-700 hover:border-green-500/50 text-white font-bold rounded-xl transition-all duration-200 text-lg hover:bg-green-500/5"
            >
              Son Haberleri Gör
            </a>
          </div>

        </div>
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:block w-1/2 h-full pointer-events-none">
        <div className="relative w-full h-full flex items-center justify-center pr-12">
          <div className="relative w-96 h-96">
            <div className="absolute inset-0 rounded-3xl border border-green-500/10 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-12 rounded-2xl border border-green-500/15 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
            <div className="absolute inset-24 rounded-lg border border-green-500/20 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Elektrikli Araç"
                  className="w-72 h-64 object-cover rounded-2xl shadow-2xl shadow-green-500/30 filter drop-shadow-lg"
                />

                <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-4">
                  <div className="bg-black/90 border border-green-500/30 rounded-xl px-4 py-2 backdrop-blur-md">
                    <div className="text-green-400 text-xs font-bold">MENZIL</div>
                    <div className="text-white font-bold">523 km</div>
                  </div>
                  <div className="bg-black/90 border border-green-500/30 rounded-xl px-4 py-2 backdrop-blur-md">
                    <div className="text-green-400 text-xs font-bold">GÜÇ</div>
                    <div className="text-white font-bold">476 HP</div>
                  </div>
                  <div className="bg-black/90 border border-green-500/30 rounded-xl px-4 py-2 backdrop-blur-md">
                    <div className="text-green-400 text-xs font-bold">ŞARJ</div>
                    <div className="text-white font-bold">28 dk</div>
                  </div>
                </div>

                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-gray-600 tracking-widest uppercase">Keşfet</span>
        <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
      </div>
    </section>
  );
}
