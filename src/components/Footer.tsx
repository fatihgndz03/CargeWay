import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

type FooterLink = { label: string; to: string };

/**
 * Yalnızca var olan sayfalara/bölümlere bağlantı verilir.
 */
const links: Record<string, FooterLink[]> = {
  Platform: [
    { label: 'Şarj Haritası', to: '/sarj-haritasi' },
    { label: 'Araçlar', to: '/araclar' },
    { label: 'Haberler', to: '/#haberler' },
  ],
  CargeWay: [
    { label: 'Nasıl Çalışır?', to: '/#nasil-calisir' },
    { label: 'Neden CargeWay?', to: '/#neden-cargeway' },
  ],
  Yasal: [
    { label: 'KVKK Aydınlatma Metni', to: '/kvkk' },
    { label: 'Gizlilik Politikası', to: '/gizlilik' },
    { label: 'Çerez Bilgilendirmesi', to: '/cerezler' },
    { label: 'İletişim ve Künye', to: '/iletisim' },
  ],
};

function FooterAnchor({ label, to }: FooterLink) {
  const className = 'text-gray-400 hover:text-green-400 text-sm transition-colors';
  return to.includes('#') ? (
    <a href={to} className={className}>
      {label}
    </a>
  ) : (
    <Link to={to} className={className}>
      {label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer id="hakkimizda" className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" fill="currentColor" />
              </div>
              <span className="text-white text-xl font-bold">
                Carge<span className="text-green-500">Way</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Türkiye'deki elektrikli araç şarj istasyonlarını tek haritada bir araya getiren bağımsız bilgi platformu.
              CargeWay bir şarj operatörü değildir.
            </p>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h3 className="text-white font-bold text-sm mb-5 tracking-wide">{title}</h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <FooterAnchor {...item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-6 border-t border-gray-800">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} CargeWay. Tüm hakları saklıdır.</p>
          <p className="text-gray-600 text-xs mt-2">
            İstasyon bilgileri bilgilendirme amaçlıdır; doğruluğu ve güncelliği garanti edilmez. Yola çıkmadan önce
            operatörün uygulamasından kontrol edin.
          </p>
        </div>
      </div>
    </footer>
  );
}
