import { Zap, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const links = {
  Platform: ['Şarj Haritası', 'Araçlar', 'İstasyon Ekle', 'API Erişimi'],
  Şirket: ['Hakkımızda', 'Kariyer', 'Basın Odası', 'İletişim'],
  Destek: ['Yardım Merkezi', 'Kullanım Koşulları', 'Gizlilik Politikası', 'KVKK'],
};

const socials = [
  { icon: Twitter, label: 'Twitter' },
  { icon: Instagram, label: 'Instagram' },
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Youtube, label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer id="hakkimizda" className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" fill="currentColor" />
              </div>
              <span className="text-white text-xl font-bold">
                Carge<span className="text-green-500">Way</span>
              </span>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Türkiye'nin elektrikli araç ekosistemini güçlendiren kapsamlı şarj ve bilgi platformu.
            </p>
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-10 h-10 bg-gray-900 border border-gray-800 hover:border-green-500/40 hover:bg-green-500/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-green-400 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h3 className="text-white font-bold text-sm mb-5 tracking-wide">{title}</h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; 2025 CargeWay. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-500 text-sm">Tüm sistemler çalışıyor</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
