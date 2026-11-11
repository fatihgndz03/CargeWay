import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Şarj Haritası', href: '/sarj-haritasi' },
  { label: 'Haberler', href: '/#haberler' },
  { label: 'Araçlar', href: '/#araclar' },
  { label: 'Nasıl Çalışır?', href: '/#nasil-calisir' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

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
                  href={item.href}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200 font-medium"
                >
                  {item.label}
                </a>
              )
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/sarj-haritasi"
              className="px-5 py-2 bg-green-500 hover:bg-green-400 text-black text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-400/30"
            >
              Haritayı Aç
            </Link>
          </div>

          <button
            aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
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
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all font-medium"
              >
                {item.label}
              </a>
            )
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link
              to="/sarj-haritasi"
              onClick={() => setMenuOpen(false)}
              className="block w-full px-4 py-3 text-center bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg transition-colors"
            >
              Haritayı Aç
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
