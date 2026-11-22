import { createContext, useContext } from 'react';
import { MESAJLAR, type Mesajlar } from './messages';

/**
 * Çok dil desteği: Türkçe (varsayılan, önek yok), İngilizce (/en) ve Azerbaycan Türkçesi (/az).
 * Sayfa adresleri (slug'lar) tüm dillerde aynıdır; yalnızca dil öneki değişir.
 */
export type Dil = 'tr' | 'en' | 'az';
export const DILLER: { kod: Dil; kisa: string; ad: string; hreflang: string }[] = [
  { kod: 'tr', kisa: 'TR', ad: 'Türkçe', hreflang: 'tr' },
  { kod: 'en', kisa: 'EN', ad: 'English', hreflang: 'en' },
  { kod: 'az', kisa: 'AZ', ad: 'Azərbaycanca', hreflang: 'az' },
];

export const DilContext = createContext<Dil>('tr');

export const useDil = () => useContext(DilContext);

/** Geçerli dilin metinleri. */
export function useT(): Mesajlar {
  return MESAJLAR[useContext(DilContext)];
}

/** Bir dil için yol üretir: yol('/araclar', 'en') → '/en/araclar', yol('/', 'az') → '/az'. */
export function yol(path: string, dil: Dil): string {
  if (dil === 'tr') return path;
  if (path === '/' || path === '') return `/${dil}`;
  if (path.startsWith('/#')) return `/${dil}${path.slice(1)}`;
  if (path.startsWith('/?')) return `/${dil}${path.slice(1)}`;
  return `/${dil}${path}`;
}

/** Geçerli dile göre yol üreten fonksiyon döndürür. */
export function useYol() {
  const dil = useDil();
  return (path: string) => yol(path, dil);
}

/** Adresten dil önekini ayırır: '/en/araclar' → { dil: 'en', yol: '/araclar' }. */
export function adrestenDil(pathname: string): { dil: Dil; yol: string } {
  const m = pathname.match(/^\/(en|az)(?=\/|$)(.*)$/);
  if (!m) return { dil: 'tr', yol: pathname || '/' };
  return { dil: m[1] as Dil, yol: m[2] || '/' };
}

/** "{n} model" gibi kalıplardaki {anahtar} alanlarını doldurur. */
export function bicim(kalip: string, degerler: Record<string, string | number>): string {
  return kalip.replace(/\{(\w+)\}/g, (_, k: string) => String(degerler[k] ?? `{${k}}`));
}
