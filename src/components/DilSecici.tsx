import { Link, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { DILLER, adrestenDil, useDil, useT, yol } from '../i18n';

/** TR / EN / AZ geçişi: aynı sayfanın diğer dildeki adresine gider. */
export default function DilSecici({ className = '' }: { className?: string }) {
  const dil = useDil();
  const t = useT();
  const { pathname, search, hash } = useLocation();
  const { yol: ic } = adrestenDil(pathname);

  return (
    <nav aria-label={t.ortak.dilSec} className={`flex items-center gap-1 ${className}`}>
      <Globe className="w-4 h-4 text-gray-500 mr-1" aria-hidden="true" />
      {DILLER.map((d) => (
        <Link
          key={d.kod}
          to={`${yol(ic, d.kod)}${search}${hash}`}
          hrefLang={d.hreflang}
          lang={d.hreflang}
          title={d.ad}
          aria-current={d.kod === dil ? 'true' : undefined}
          className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
            d.kod === dil ? 'bg-green-500/15 text-green-400' : 'text-gray-500 hover:text-white'
          }`}
        >
          {d.kisa}
        </Link>
      ))}
    </nav>
  );
}

/** EN/AZ sürümünde yalnızca Türkçe olan sayfaların başında gösterilir. */
export function YalnizTurkceNotu() {
  const t = useT();
  if (!t.ortak.yalnizTurkce) return null;
  return (
    <div className="mb-6 rounded-xl border border-blue-500/25 bg-blue-500/5 px-4 py-3 text-sm text-blue-200">
      {t.ortak.yalnizTurkce}
    </div>
  );
}
