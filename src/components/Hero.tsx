import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Search, Zap } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/sarj-haritasi?q=${encodeURIComponent(q)}` : '/sarj-haritasi');
  };

  return (
    <section className="relative min-h-[85vh] bg-black flex items-center overflow-hidden pt-18">
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

          <form onSubmit={onSubmit} role="search" className="max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="relative flex-1">
                <span className="sr-only">Şehir, ilçe veya adres</span>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Şehir, ilçe veya adres ara"
                  className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 focus:border-green-500 focus:outline-none rounded-xl text-white placeholder-gray-500 text-lg"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-colors shadow-xl shadow-green-500/25 text-lg"
              >
                İstasyon Bul
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigate('/sarj-haritasi?konum=1')}
              className="mt-4 inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold"
            >
              <Crosshair className="w-4 h-4" />
              Konumumu kullan
            </button>
          </form>
        </div>
      </div>

    </section>
  );
}
