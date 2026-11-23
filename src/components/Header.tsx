import { useState } from 'react';
import { Link } from './DilLink';
import { Zap, Menu, X } from 'lucide-react';
import { useDil, useT } from '../i18n';
import DilSecici from './DilSecici';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useT();
  const dil = useDil();
  // Haberler, rehberler ve ürünler Türkiye'ye özel ve yalnızca Türkçe; EN/AZ menüsünde kurulum öne çıkar.
  const navItems = [
    { label: t.ust.harita, href: '/sarj-haritasi' },
    ...(dil === 'tr' ? [{ label: t.ust.haberler, href: '/#haberler' }] : []),
    { label: t.ust.araclar, href: '/araclar' },
    { label: t.ust.kurulum, href: '/sarj-unitesi-kurulumu' },
    ...(dil === 'tr'
      ? [
          { label: t.ust.rehber, href: '/rehber' },
          { label: t.ust.urunler, href: '/urunler' },
        ]
      : []),
  ];
  const hashHref = (h: string) => (dil === 'tr' ? h : `/${dil}${h.slice(1)}`);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-green-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-400 transition-colors">
              <Zap className="w-5 h-5 text-black" fill="currentColor" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">
              Carge<span className="text-green-500">Way</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              !item.href.includes('#') ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200 font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={hashHref(item.href)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200 font-medium"
                >
                  {item.label}
                </a>
              )
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <DilSecici />
            <Link
              to="/sarj-haritasi"
              className="px-5 py-2 bg-green-500 hover:bg-green-400 text-black text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-400/30"
            >
              {t.ortak.haritayiAc}
            </Link>
          </div>

          <button
            aria-label={menuOpen ? t.ust.menuKapat : t.ust.menuAc}
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-black border-t border-green-500/20 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            !item.href.includes('#') ? (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={hashHref(item.href)}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all font-medium"
              >
                {item.label}
              </a>
            )
          ))}
          <DilSecici className="px-4 pt-2" />
          <div className="pt-3 flex flex-col gap-2">
            <Link
              to="/sarj-haritasi"
              onClick={() => setMenuOpen(false)}
              className="block w-full px-4 py-3 text-center bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg transition-colors"
            >
              {t.ortak.haritayiAc}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
