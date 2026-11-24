import { useEffect, useRef, useState } from 'react';
import { Box, Info, RotateCcw } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSeo } from '../lib/seo';
import { useT } from '../i18n';
import type { Sahne } from '../arac3d/sahne';

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
  useSeo(m.seo, m.aciklama, { noindex: true });
  const kapRef = useRef<HTMLDivElement>(null);
  const sahneRef = useRef<Sahne | null>(null);
  const [durum, setDurum] = useState<Durum>('yukleniyor');

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
        sahneRef.current = sahneKur(kap, { hazir: () => setDurum('hazir') });
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

  return (
    <div className="bg-black min-h-screen flex flex-col overflow-x-clip">
      <Header />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">{m.rozet}</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white mt-2">{m.baslik}</h1>
          <p className="mt-4 text-gray-400 max-w-2xl">{m.aciklama}</p>

          <div className="relative mt-8 rounded-2xl border border-gray-800 bg-black overflow-hidden aspect-[4/5] sm:aspect-[16/9]">
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

            {durum === 'hazir' && (
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

            {durum === 'hazir' && (
              <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 w-max max-w-[90%] text-center rounded-full bg-black/70 px-3 py-1 text-xs text-gray-400 border border-gray-800">
                {m.ipucu}
              </p>
            )}
          </div>

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
