import { useState } from 'react';
import { Link } from '../components/DilLink';
import { ArrowRight, BookOpen, Cable, CheckCircle2, ExternalLink, Info, PlugZap, Plug } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import InstallCta, { KURULUM_YOLU } from '../components/InstallCta';
import { useSeo } from '../lib/seo';
import { KATEGORILER, SATIS_ORTAKLIGI_VAR, URUNLER, type KategoriSlug } from '../data/urunler';
import { REHBERLER } from '../data/rehberler';
import { YalnizTurkceNotu } from '../components/DilSecici';

const IKON: Record<KategoriSlug, typeof PlugZap> = { wallbox: PlugZap, kablo: Cable, adaptor: Plug };

export default function ProductsPage() {
  useSeo(
    'Şarj ünitesi, kablo ve adaptör seçimi | CargeWay',
    'Wallbox (7,4 / 11 / 22 kW), şarj kablosu ve adaptör seçerken nelere bakmalı? Ürün türleri ve seçim kriterleri.',
  );
  const [secili, setSecili] = useState<KategoriSlug | 'tumu'>('tumu');
  const kategoriler = KATEGORILER.filter((k) => secili === 'tumu' || k.slug === secili);

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <YalnizTurkceNotu />
          <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">Ürün rehberi</span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-2">Şarj ünitesi, kablo ve adaptör</h1>
          <p className="mt-4 text-gray-400 max-w-2xl">
            Hangi ürünün size uygun olduğunu seçim kriterleriyle anlatıyoruz. Wallbox için kurulum dahil teklif almak
            isterseniz formu doldurun; bölgenizdeki kurulum firmaları size dönsün.
          </p>

          {SATIS_ORTAKLIGI_VAR && (
            <p className="mt-6 flex gap-2 rounded-xl border border-yellow-500/25 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-200/90 max-w-3xl">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              Bu sayfadaki bazı bağlantılar satış ortaklığı bağlantısıdır. Bu bağlantılardan alışveriş yaparsanız
              CargeWay komisyon alabilir; ödediğiniz fiyat değişmez.
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Kategori">
            {[{ slug: 'tumu' as const, ad: 'Tümü' }, ...KATEGORILER].map((k) => (
              <button
                key={k.slug}
                type="button"
                role="tab"
                aria-selected={secili === k.slug}
                onClick={() => setSecili(k.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  secili === k.slug
                    ? 'bg-green-500 text-black border-green-500'
                    : 'border-gray-700 text-gray-300 hover:border-green-500/50'
                }`}
              >
                {k.ad}
              </button>
            ))}
          </div>

          {kategoriler.map((k) => {
            const Ikon = IKON[k.slug];
            const urunler = URUNLER.filter((u) => u.kategori === k.slug);
            return (
              <section key={k.slug} id={k.slug} className="mt-12 scroll-mt-28">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                  <Ikon className="w-6 h-6 text-green-400" /> {k.ad}
                </h2>
                <p className="mt-2 text-gray-400 max-w-3xl">{k.aciklama}</p>

                <div className="mt-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Seçerken nelere bakmalı?</h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-gray-300">
                    {k.kriterler.map((m) => (
                      <li key={m} className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-400" /> {m}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {urunler.map((u) => {
                    const rehber = u.rehber ? REHBERLER.find((r) => r.slug === u.rehber) : undefined;
                    return (
                      <article key={u.id} className="flex flex-col rounded-2xl border border-gray-800 bg-gray-900 p-5">
                        <h3 className="text-lg font-bold text-white">{u.ad}</h3>
                        <p className="mt-2 text-sm text-gray-400">{u.ozet}</p>
                        <p className="mt-3 text-xs text-gray-500">
                          <span className="font-semibold text-gray-400">Kime uygun:</span> {u.kimeUygun}
                        </p>
                        <ul className="mt-3 space-y-1 text-xs text-gray-400 list-disc pl-4">
                          {u.dikkat.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                        <div className="mt-auto pt-4 flex flex-wrap gap-2">
                          {u.kategori === 'wallbox' && (
                            <Link
                              to={KURULUM_YOLU}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black text-sm font-bold"
                            >
                              Kurulum teklifi al <ArrowRight className="w-4 h-4" />
                            </Link>
                          )}
                          {u.baglanti && (
                            <a
                              href={u.baglanti.url}
                              target="_blank"
                              rel="sponsored nofollow noopener"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-green-500/40 text-green-400 hover:bg-green-500/10 text-sm font-semibold"
                            >
                              Satıcıda incele ({u.baglanti.satici}) <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {rehber && (
                            <Link
                              to={`/rehber/${rehber.slug}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-green-400"
                            >
                              <BookOpen className="w-4 h-4" /> Rehberi oku
                            </Link>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <p className="mt-10 text-xs text-gray-500 max-w-3xl">
            Ürün türleri genel bilgilendirme amaçlıdır; belirli bir marka veya modeli önermiyoruz. Uyumluluğu aracınızın
            kullanım kılavuzundan ve üreticiden doğrulayın.
          </p>
        </div>
        <InstallCta />
      </main>
      <Footer />
    </div>
  );
}
