import { useParams } from 'react-router-dom';
import { Link } from '../components/DilLink';
import { ArrowLeft, BookOpen, Clock, ExternalLink, Info } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import InstallCta from '../components/InstallCta';
import NotFoundPage from './NotFound';
import { useSeo } from '../lib/seo';
import { REHBERLER, type Blok } from '../data/rehberler';
import { YalnizTurkceNotu } from '../components/DilSecici';

export function GuidesIndexPage() {
  useSeo(
    'Rehberler — Evde ve sitede şarj | CargeWay',
    'Evde wallbox kurulumu, apartman ve sitelerde şarj ünitesi süreci ve elektrikli araç şarjı hakkında kaynaklı rehberler.',
  );
  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <YalnizTurkceNotu />
          <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">Rehberler</span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-2">Evde ve sitede şarj</h1>
          <p className="mt-4 text-gray-400 max-w-2xl">Kurulum, maliyet ve süreç hakkında kaynaklı, sade rehberler.</p>
          <div className="mt-10 grid gap-4">
            {REHBERLER.map((r) => (
              <Link
                key={r.slug}
                to={`/rehber/${r.slug}`}
                className="group block p-6 rounded-2xl border border-gray-800 bg-gray-900 hover:border-green-500/40"
              >
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <BookOpen className="w-4 h-4 text-green-400" /> {r.okumaDk} dk okuma · Güncelleme: {r.guncelleme}
                </div>
                <h2 className="text-xl font-bold text-white group-hover:text-green-400">{r.baslik}</h2>
                <p className="mt-2 text-sm text-gray-400">{r.ozet}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function BlokGoster({ b }: { b: Blok }) {
  switch (b.tip) {
    case 'h2':
      return <h2 className="text-2xl font-bold text-white pt-4">{b.metin}</h2>;
    case 'liste':
      return (
        <ul className="list-disc pl-6 space-y-2">
          {b.maddeler.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      );
    case 'not':
      return (
        <p className="flex gap-2 rounded-xl border border-yellow-500/25 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-200/90">
          <Info className="w-4 h-4 shrink-0 mt-0.5" /> {b.metin}
        </p>
      );
    default:
      return <p>{b.metin}</p>;
  }
}

export function GuidePage() {
  const { slug } = useParams();
  const r = REHBERLER.find((x) => x.slug === slug);
  useSeo(r ? `${r.baslik} | CargeWay` : 'Rehber bulunamadı | CargeWay', r?.ozet, r ? undefined : { noindex: true });
  if (!r) return <NotFoundPage />;

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-28 pb-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          <YalnizTurkceNotu />
          <Link to="/rehber" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400">
            <ArrowLeft className="w-4 h-4" /> Tüm rehberler
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-4 leading-tight">{r.baslik}</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" /> {r.okumaDk} dk okuma · Güncelleme: {r.guncelleme}
          </p>
          <div className="mt-8 space-y-5 text-gray-300 leading-relaxed">
            {r.icerik.map((b, i) => (
              <BlokGoster key={i} b={b} />
            ))}
          </div>

          <div className="mt-10">
            <InstallCta variant="compact" />
          </div>

          <section className="mt-10 border-t border-gray-800 pt-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Kaynaklar</h2>
            <ul className="space-y-2 text-sm">
              {r.kaynaklar.map((k) => (
                <li key={k.url}>
                  <a href={k.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-gray-400 hover:text-green-400">
                    <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {k.ad}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
