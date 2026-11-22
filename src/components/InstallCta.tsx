import { Link } from './DilLink';
import { ArrowRight, PlugZap } from 'lucide-react';
import { useT } from '../i18n';

export const KURULUM_YOLU = '/sarj-unitesi-kurulumu';

/** "Evine / sitene şarj ünitesi kurdur — Teklif al" çağrısı. */
export default function InstallCta({ variant = 'banner' }: { variant?: 'banner' | 'compact' }) {
  const t = useT();
  if (variant === 'compact') {
    return (
      <Link
        to={KURULUM_YOLU}
        className="group flex items-center gap-3 rounded-xl border border-green-500/25 bg-green-500/5 px-4 py-3 hover:border-green-500/50"
      >
        <PlugZap className="h-5 w-5 shrink-0 text-green-400" />
        <span className="flex-1 text-sm">
          <span className="block font-semibold text-white">{t.cta.kisaBaslik}</span>
          <span className="block text-xs text-gray-400">{t.ortak.ucretsizTeklif}</span>
        </span>
        <ArrowRight className="h-4 w-4 text-green-400 transition-transform group-hover:translate-x-0.5" />
      </Link>
    );
  }

  return (
    <section className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-green-500/25 bg-gradient-to-br from-green-500/15 via-green-500/5 to-transparent p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 text-green-400 text-sm font-semibold tracking-widest uppercase">
              <PlugZap className="h-4 w-4" /> {t.cta.ust}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">{t.cta.baslik}</h2>
            <p className="mt-3 text-gray-300 max-w-xl">
              {t.cta.metin}
            </p>
          </div>
          <Link
            to={KURULUM_YOLU}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl shadow-xl shadow-green-500/25 text-lg shrink-0"
          >
            {t.ortak.teklifAl} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
