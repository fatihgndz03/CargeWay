import { BookOpen, ChevronRight } from 'lucide-react';
import { Link } from './DilLink';
import { useDil, useT } from '../i18n';
import { REHBERLER } from '../data/rehberler';

/**
 * Sayfa içi "ilgili rehberler" bağlantıları (SEO iç bağlantı + teklif hunisi).
 * Rehberler yalnızca Türkçe olduğu için EN/AZ'de gösterilmez.
 */
export default function IlgiliRehberler({
  sluglar,
  className = '',
}: {
  sluglar: string[];
  className?: string;
}) {
  const dil = useDil();
  const t = useT();
  if (dil !== 'tr') return null;
  const liste = sluglar
    .map((s) => REHBERLER.find((r) => r.slug === s))
    .filter((r): r is (typeof REHBERLER)[number] => Boolean(r));
  if (liste.length === 0) return null;

  return (
    <nav aria-label={t.cta.ilgiliRehberler} className={`rounded-xl border border-gray-800 bg-gray-950 p-4 ${className}`}>
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-green-400">
        <BookOpen className="h-4 w-4" /> {t.cta.ilgiliRehberler}
      </p>
      <ul className="space-y-1">
        {liste.map((r) => (
          <li key={r.slug}>
            <Link
              to={`/rehber/${r.slug}`}
              className="group flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-900 hover:text-white"
            >
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-green-500 transition-transform group-hover:translate-x-0.5" />
              <span className="min-w-0 break-words">{r.baslik}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/rehber" className="mt-2 inline-block px-2 text-xs text-green-400 hover:underline">
        {t.cta.tumRehberler} →
      </Link>
    </nav>
  );
}
