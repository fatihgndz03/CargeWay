import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Box, Boxes, ChevronLeft, ChevronRight, DoorOpen, Info, LogOut, RotateCcw, X } from 'lucide-react';
import { Link } from '../components/DilLink';
import { KURULUM_YOLU } from '../components/InstallCta';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSeo } from '../lib/seo';
import { useDil, useT } from '../i18n';
import { PARCA_BILGILERI } from '../data/parcaBilgileri';
import type { Mod, ParcaAdi, Sahne } from '../arac3d/sahne';

/**
 * Lejant renkleri — src/arac3d/bilesenler.ts → PARCA_RENK ile aynı tutulmalı.
 * (Burada ayrıca yazılı: o dosya three.js içerir ve yalnızca sahne yüklenince indirilir.)
 */
const PARCA_SIRASI = [
  ['batarya', '#22c55e'],
  ['motor', '#f59e0b'],
  ['reduktor', '#94a3b8'],
  ['inverter', '#60a5fa'],
  ['obc', '#a78bfa'],
  ['soket', '#f472b6'],
  ['sogutma', '#22d3ee'],
  ['kablo', '#f97316'],
] as const;
const PARCA_RENGI = Object.fromEntries(PARCA_SIRASI) as Record<ParcaAdi, string>;
/** Bilgi kartında kurulum teklifi bağlantısı gösterilen parçalar (AC şarjla doğrudan ilgili). */
const TEKLIF_PARCALARI: ParcaAdi[] = ['obc', 'soket'];

/** three.js'i yüklemeden önce WebGL desteğini kontrol eder. */
function webglVarMi(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

type Durum = 'yukleniyor' | 'hazir' | 'webglYok' | 'hata';

/**
 * Deneme sayfası: /deneme/arac-3d — noindex, menüde ve sitemap'te yok.
 * Yol haritası: docs/arac-3d-plan.md. Site sahibi onaylayınca araç sayfalarına bağlanacak.
 */
export default function Arac3dDenemePage() {
  const t = useT();
  const m = t.arac3d;
  const dil = useDil();
  useSeo(m.seo, m.aciklama, { noindex: true });
  const kapRef = useRef<HTMLDivElement>(null);
  const sahneRef = useRef<Sahne | null>(null);
  const [durum, setDurum] = useState<Durum>('yukleniyor');
  const [mod, setMod] = useState<Mod>('dis');
  const [secili, setSecili] = useState<ParcaAdi | null>(null);

  useEffect(() => {
    const kap = kapRef.current;
    if (!kap) return;
    if (!webglVarMi()) {
      setDurum('webglYok');
      return;
    }
    let iptal = false;
    // three.js ayrı bir parça olarak yalnızca burada yüklenir
    import('../arac3d/sahne')
      .then(({ sahneKur }) => {
        if (iptal) return;
        sahneRef.current = sahneKur(kap, {
          hazir: () => setDurum('hazir'),
          modDegisti: setMod,
          parcaSecildi: setSecili,
        });
      })
      .catch(() => {
        if (!iptal) setDurum('hata');
      });
    return () => {
      iptal = true;
      sahneRef.current?.kapat();
      sahneRef.current = null;
    };
  }, []);

  // Esc ile araçtan çık / seçimi kaldır / aracı birleştir; patlatılmış görünümde ← → ile parçalar arasında gezin
  useEffect(() => {
    if (mod !== 'ic' && mod !== 'parca') return;
    const tus = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const hedef = e.target as HTMLElement | null;
      if (hedef && /^(INPUT|TEXTAREA|SELECT)$/.test(hedef.tagName)) return;
      const s = sahneRef.current;
      if (!s) return;
      if (e.key === 'Escape') {
        if (mod === 'ic') s.disariCik();
        else if (secili) s.parcaSec(null);
        else s.parcalar(false);
      } else if (mod === 'parca' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        s.parcaKaydir(e.key === 'ArrowRight' ? 1 : -1);
      }
    };
    window.addEventListener('keydown', tus);
    return () => window.removeEventListener('keydown', tus);
  }, [mod, secili]);

  const bilgi = secili ? PARCA_BILGILERI[dil][secili] : null;

  return (
    <div className="bg-black min-h-screen flex flex-col overflow-x-clip">
      <Header />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">{m.rozet}</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white mt-2">{m.baslik}</h1>
          <p className="mt-4 text-gray-400 max-w-2xl">{m.aciklama}</p>

          <div className="relative mt-8">
            <div className="relative rounded-2xl border border-gray-800 bg-black overflow-hidden aspect-[4/5] sm:aspect-[16/9]">
              <div
                ref={kapRef}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                role="img"
                aria-label={m.sahneEtiketi}
              />

              {/* Sürekli görünen uyarı etiketi (değişmez kural) */}
              <p className="pointer-events-none absolute left-3 top-3 right-14 sm:right-auto sm:max-w-[70%] rounded-lg bg-black/70 px-3 py-1.5 text-xs text-gray-300 border border-gray-700 backdrop-blur-sm">
                <span className="font-semibold text-green-400">{m.temsili}</span> — {m.temsiliAciklama}
              </p>

              {durum === 'hazir' && (mod === 'dis' || mod === 'parca') && (
                <button
                  type="button"
                  onClick={() => sahneRef.current?.sifirla()}
                  title={m.sifirla}
                  className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-black/70 px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold text-gray-200 hover:border-green-500 hover:text-green-400"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">{m.sifirla}</span>
                </button>
              )}

              {/* Parçaları göster / Aracı birleştir */}
              {durum === 'hazir' && (mod === 'dis' || mod === 'parca') && (
                <button
                  type="button"
                  onClick={() => sahneRef.current?.parcalar(mod === 'dis')}
                  aria-pressed={mod === 'parca'}
                  aria-keyshortcuts={mod === 'parca' ? 'Escape' : undefined}
                  className={`absolute bottom-16 sm:bottom-3 inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 ${
                    mod === 'parca'
                      ? 'right-3 bg-green-500 text-black hover:bg-green-400'
                      : 'left-3 sm:left-auto sm:right-36 border border-green-500/70 bg-black/70 text-green-400 hover:bg-green-500/10'
                  }`}
                >
                  <Boxes className="h-4 w-4" />
                  {mod === 'parca' ? m.birlestir : m.parcalariGoster}
                </button>
              )}

              {/* İçeri gir / Dışarı çık (klavye ve dokunmatik için de düğme) */}
              {durum === 'hazir' && (mod === 'dis' || mod === 'ic') && (
                <button
                  type="button"
                  onClick={() => (mod === 'ic' ? sahneRef.current?.disariCik() : sahneRef.current?.iceriGir())}
                  aria-keyshortcuts={mod === 'ic' ? 'Escape' : undefined}
                  className="absolute bottom-16 sm:bottom-3 right-3 inline-flex items-center gap-2 rounded-lg bg-green-500 px-3.5 py-2 text-sm font-bold text-black hover:bg-green-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                >
                  {mod === 'ic' ? <LogOut className="h-4 w-4" /> : <DoorOpen className="h-4 w-4" />}
                  {mod === 'ic' ? m.disariCik : m.iceriGir}
                </button>
              )}

              {durum === 'yukleniyor' && (
                <div className="absolute inset-0 flex items-center justify-center" role="status" aria-live="polite">
                  <div className="h-10 w-10 rounded-full border-2 border-gray-800 border-t-green-500 animate-spin" />
                  <span className="sr-only">{t.ortak.yukleniyor}</span>
                </div>
              )}

              {(durum === 'webglYok' || durum === 'hata') && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <Box className="h-12 w-12 text-gray-600" />
                  <p className="text-gray-300 max-w-sm">{durum === 'webglYok' ? m.webglYok : m.hata}</p>
                </div>
              )}

              {durum === 'hazir' && mod !== 'gecis' && (
                <p
                  className="pointer-events-none absolute bottom-3 left-3 sm:left-1/2 sm:-translate-x-1/2 right-3 sm:right-auto sm:w-max sm:max-w-[60%] text-center rounded-full bg-black/70 px-3 py-1 text-xs text-gray-400 border border-gray-800"
                  aria-live="polite"
                >
                  {mod === 'ic' ? m.ipucuIc : mod === 'parca' ? (secili ? m.ipucuParcaSecili : m.ipucuParca) : m.ipucu}
                </p>
              )}
            </div>

            {/* Parça bilgi kartı: masaüstünde sahnenin sağında, mobilde sahnenin altında */}
            {mod === 'parca' && secili && bilgi && (
              <section
                className="mt-4 sm:mt-0 sm:absolute sm:right-3 sm:top-14 sm:w-80 sm:max-h-[calc(100%-8rem)] overflow-y-auto rounded-2xl border border-gray-700 bg-gray-950/90 sm:backdrop-blur-sm p-4 shadow-xl"
                aria-live="polite"
                aria-labelledby="parca-karti-baslik"
              >
                <div className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: PARCA_RENGI[secili] }}
                    aria-hidden
                  />
                  <h2 id="parca-karti-baslik" className="flex-1 text-base font-bold text-white">
                    {m.parcaAdlari[secili]}
                  </h2>
                  <button
                    type="button"
                    onClick={() => sahneRef.current?.parcaSec(null)}
                    title={m.kartKapat}
                    aria-label={m.kartKapat}
                    className="-mr-1 -mt-1 rounded-md p-1.5 text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-200">{bilgi.ozet}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-gray-400 list-disc pl-5 marker:text-green-500">
                  {bilgi.maddeler.map((md) => (
                    <li key={md}>{md}</li>
                  ))}
                </ul>
                {TEKLIF_PARCALARI.includes(secili) && (
                  <Link
                    to={KURULUM_YOLU}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-green-400 hover:text-green-300 hover:underline"
                  >
                    {m.kartTeklif}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <p className="mt-3 text-xs text-gray-500">{m.kartNotu}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => sahneRef.current?.parcaKaydir(-1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-700 px-2.5 py-1.5 text-xs font-semibold text-gray-300 hover:border-green-500 hover:text-green-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    {m.oncekiParca}
                  </button>
                  <button
                    type="button"
                    onClick={() => sahneRef.current?.parcaKaydir(1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-700 px-2.5 py-1.5 text-xs font-semibold text-gray-300 hover:border-green-500 hover:text-green-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                  >
                    {m.sonrakiParca}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Patlatılmış görünüm lejantı (renkler sahnedeki vurgu renkleriyle aynı); her satır bir seçim düğmesi */}
          {mod === 'parca' && (
            <section className="mt-4 rounded-2xl border border-gray-800 bg-gray-950/60 p-4" aria-label={m.lejantBaslik}>
              <h2 className="text-sm font-semibold text-white">{m.lejantBaslik}</h2>
              <p className="mt-1 text-xs text-gray-500">{m.lejantIpucu}</p>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1">
                {PARCA_SIRASI.map(([ad, renk]) => (
                  <li key={ad}>
                    <button
                      type="button"
                      onClick={() => sahneRef.current?.parcaSec(secili === ad ? null : ad)}
                      aria-pressed={secili === ad}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 ${
                        secili === ad ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: renk }}
                        aria-hidden
                      />
                      {m.parcaAdlari[ad]}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-gray-500">{m.yerlesimNotu}</p>
            </section>
          )}

          <p className="mt-4 flex gap-2 text-sm text-gray-500 max-w-3xl">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            {m.denemeNotu}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
