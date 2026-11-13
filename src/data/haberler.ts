/**
 * Ana sayfadaki haberler.
 *
 * Güncellemek için bu listeye yeni bir kayıt ekleyin (en yenisi en üstte).
 * - `ozet`: kaynaktan kopyalamayın; haberi kendi cümlelerinizle 1–2 cümlede özetleyin.
 * - `kaynakUrl`: "Kaynağa git" bağlantısı buraya gider.
 * - Görsel kullanılmaz; kategoriye göre ikon ve renk otomatik seçilir.
 */
export type HaberKategori = 'Altyapı' | 'Pazar' | 'Mevzuat';

export interface Haber {
  id: string;
  kategori: HaberKategori;
  baslik: string;
  ozet: string;
  /** ISO tarih (YYYY-MM-DD) — haberin kaynakta yayımlandığı gün */
  tarih: string;
  kaynakAdi: string;
  kaynakUrl: string;
}

export const HABERLER: Haber[] = [
  {
    id: 'sarj-agi-lisanslari-2026-11',
    kategori: 'Mevzuat',
    baslik: 'EPDK iki yeni şirkete şarj ağı işletmeci lisansı verdi',
    ozet:
      'EPDK, Mil Dijital (OrkoŞarj markası) ve Euroline Enerji\'ye 49 yıllık şarj ağı işletmeci lisansı verdi. Habere göre yürürlükteki şarj ağı işletmeci lisansı sayısı 179 oldu.',
    tarih: '2026-11-10',
    kaynakAdi: 'Enerji Günlüğü',
    kaynakUrl: 'https://www.enerjigunlugu.net/mil-dijitale-sarj-agi-isletmeci-lisansi-70513h.htm',
  },
  {
    id: 'yerli-ev-payi-2026-10',
    kategori: 'Pazar',
    baslik: 'Elektrikli otomobil satışlarında yerli modellerin payı yükseliyor',
    ozet:
      'Ocak–Ekim 2026 döneminde satılan 135.142 elektrikli otomobilin yaklaşık üçte biri yerli üretim oldu. Togg, ekimde elektrikli otomobil pazarının yaklaşık %47\'sini aldı.',
    tarih: '2026-11-09',
    kaynakAdi: 'Sabah (Ufuk Sandık)',
    kaynakUrl: 'https://www.sabah.com.tr/yazarlar/sandik/2026/11/09/elektrikli-otoda-yerlilerin-payi-artiyor',
  },
  {
    id: 'ekim-ev-pazar-payi-2026',
    kategori: 'Pazar',
    baslik: 'Elektrikli otomobillerin ekim ayındaki pazar payı %22,1 oldu',
    ozet:
      'ODMD verilerine göre toplam pazar ekimde belirgin biçimde daralırken elektrikli otomobil satışları yaklaşık 14.400 adetle geçen yılın aynı ayına yakın kaldı; bu da elektriklilerin payını %22,1\'e çıkardı.',
    tarih: '2026-11-05',
    kaynakAdi: 'Yeşil Haber',
    kaynakUrl: 'https://yesilhaber.net/elektrikli-otomobil-ekim-2026-pazar-payi/',
  },
  {
    id: 'ev-sayisi-eylul-2026',
    kategori: 'Pazar',
    baslik: 'Türkiye\'deki elektrikli araç sayısı 490 bini aştı',
    ozet:
      'EPDK\'nın eylül verilerine göre Türkiye\'de 491.492 elektrikli araç bulunuyor. 2025 sonunda bu sayı 373.733 idi.',
    tarih: '2026-10-17',
    kaynakAdi: 'LOG',
    kaynakUrl: 'https://www.log.com.tr/turkiyedeki-guncel-elektrikli-arac-ve-sarj-noktasi-sayisi-aciklandi-eylul',
  },
  {
    id: 'sarj-noktasi-eylul-2026',
    kategori: 'Altyapı',
    baslik: 'Şarj noktası sayısı 49 bine yaklaştı',
    ozet:
      'EPDK\'nın Eylül 2026 şarj hizmeti istatistiklerine göre Türkiye\'deki şarj noktası sayısı 48.971\'e ulaştı. Bunların 27.664\'ü AC, 21.307\'si DC.',
    tarih: '2026-10-16',
    kaynakAdi: 'Enerji Ekonomisi',
    kaynakUrl: 'https://www.enerjiekonomisi.com/turkiyede-sarj-istasyonu-sayisi-50-bine-yaklasti/44403',
  },
];

export function formatTarih(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
