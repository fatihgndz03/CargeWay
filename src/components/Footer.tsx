import { Link } from './DilLink';
import { Zap } from 'lucide-react';
import { useDil, useT } from '../i18n';

type FooterLink = { label: string; to: string };

function FooterAnchor({ label, to }: FooterLink) {
  const dil = useDil();
  const className = 'text-gray-400 hover:text-green-400 text-sm transition-colors';
  return to.includes('#') ? (
    <a href={dil === 'tr' ? to : `/${dil}${to.slice(1)}`} className={className}>
      {label}
    </a>
  ) : (
    <Link to={to} className={className}>
      {label}
    </Link>
  );
}

export default function Footer() {
  const t = useT();
  const dil = useDil();
  const a = t.alt;
  // Yalnızca var olan sayfalara/bölümlere bağlantı verilir. Türkçeye özel içerik EN/AZ'de listelenmez.
  const links: [string, FooterLink[]][] = [
    [
      a.platform,
      [
        { label: a.harita, to: '/sarj-haritasi' },
        { label: a.araclar, to: '/araclar' },
        { label: a.kurulum, to: '/sarj-unitesi-kurulumu' },
        ...(dil === 'tr'
          ? [
              { label: a.rehberler, to: '/rehber' },
              { label: a.urunler, to: '/urunler' },
              { label: a.haberler, to: '/#haberler' },
            ]
          : []),
      ],
    ],
    [
      a.sirket,
      [
        { label: a.nasil, to: '/#nasil-calisir' },
        { label: a.neden, to: '/#neden-cargeway' },
        { label: a.isOrtagi, to: '/is-ortagi-ol' },
      ],
    ],
    [
      a.yasal,
      [
        { label: a.kvkk, to: '/kvkk' },
        { label: a.gizlilik, to: '/gizlilik' },
        { label: a.cerezler, to: '/cerezler' },
        { label: a.iletisim, to: '/iletisim' },
      ],
    ],
  ];
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
              {a.tanitim}
            </p>
          </div>

          {links.map(([title, items]) => (
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
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} CargeWay. {t.ortak.telif}</p>
          <p className="text-gray-600 text-xs mt-2">{t.ortak.sorumluluk}</p>
        </div>
      </div>
    </footer>
  );
}
