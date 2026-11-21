/**
 * Ürün rehberi (/urunler). Şimdilik markasız ürün TÜRLERİ ve seçim kriterleri gösterilir.
 *
 * Satış ortaklığı (affiliate) bağlantıları:
 * - Yalnızca kullanıcı veriler/ klasörüne gerçek bağlantıları koyduğunda `baglanti` alanı doldurulur.
 * - `baglanti` doluysa kartta "Satıcıda incele" düğmesi rel="sponsored nofollow noopener" ile çıkar
 *   ve sayfanın üstünde komisyon açıklaması otomatik gösterilir.
 * - Fiyat YAZILMAZ (fiyatlar satıcı sitesinde değişir); uydurma ürün/marka/fiyat eklemeyin.
 */
export type KategoriSlug = 'wallbox' | 'kablo' | 'adaptor';

export interface Kategori {
  slug: KategoriSlug;
  ad: string;
  aciklama: string;
  /** Kategori geneli seçim kriterleri */
  kriterler: string[];
}

export interface Urun {
  id: string;
  kategori: KategoriSlug;
  ad: string;
  ozet: string;
  kimeUygun: string;
  dikkat: string[];
  /** İlgili rehber (slug) */
  rehber?: string;
  /** Satış ortaklığı bağlantısı — yalnızca kullanıcı verdiğinde doldurulur */
  baglanti?: { url: string; satici: string };
}

export const KATEGORILER: Kategori[] = [
  {
    slug: 'wallbox',
    ad: 'Şarj ünitesi (wallbox)',
    aciklama: 'Evde, sitede veya işyerinde aracı güvenli ve hızlı şarj etmek için duvara ya da ayağa monte edilen AC şarj ünitesi.',
    kriterler: [
      'Gücü aracınızın AC şarj sınırına (OBC) ve elektrik bağlantınıza (tek faz / üç faz) göre seçin.',
      'Sözleşme gücünüz sınırlıysa dinamik yük yönetimi olan modelleri tercih edin.',
      'Kaçak akım korumasının (DC kaçak algılama) ünitede mi panoda mı olacağını kurulumcuya sorun.',
      'Açık alanda kullanılacaksa toz-su koruma sınıfına (IP) bakın.',
      'Apartman, site ve işyerinde kart (RFID) ve OCPP desteği kullanıcıları ayırmayı kolaylaştırır.',
      'Kurulumu mutlaka yetkili elektrikçi veya kurulum firması yapmalı.',
    ],
  },
  {
    slug: 'kablo',
    ad: 'Şarj kablosu',
    aciklama: 'Soketli şarj ünitelerinde ve halka açık AC istasyonlarda aracı üniteye bağlayan kablo; ya da prizden şarj için kontrol kutulu taşınabilir kablo.',
    kriterler: [
      'Aracınızın şarj girişini kontrol edin: güncel modellerin çoğu Type 2, bazı eski modeller Type 1 kullanır.',
      'Faz sayısı ve akım değeri (ör. üç faz 32 A) aracınızın ve ünitenin gücüne uygun olmalı; düşük değerli kablo şarjı yavaşlatır.',
      'Uzunluk: kısa kablo park ederken zorlar, çok uzun kablo ağır ve hantaldır.',
      'Kablonun ilgili standartlara uygunluk işaretlerini ve garanti koşullarını kontrol edin.',
    ],
  },
  {
    slug: 'adaptor',
    ad: 'Adaptör',
    aciklama: 'Farklı soket tipleri arasında geçiş sağlayan ara parçalar. Yanlış adaptör ısınmaya ve güvenlik riskine yol açabilir.',
    kriterler: [
      'Yalnızca aracınızın ve şarj ekipmanınızın üreticisinin uygun bulduğu adaptörleri kullanın.',
      'Adaptörün akım değeri, bağlandığı kablo ve üniteden düşük olmamalı.',
      'Adaptör zincirleri (adaptöre adaptör takmak) ve uzatma kablosu kullanmayın.',
      'DC hızlı şarj adaptörleri özel ekipmandır; aracınızla uyumluluğunu üreticiden doğrulayın.',
    ],
  },
];

export const URUNLER: Urun[] = [
  {
    id: 'wallbox-7-4-tek-faz',
    kategori: 'wallbox',
    ad: '7,4 kW tek faz wallbox',
    ozet: 'Tek faz, 32 A. Daire ve tek faz beslenen evler için en yaygın seçim; gece şarjında çoğu kullanıcıya yeter.',
    kimeUygun: 'Tek faz aboneliği olan evler, günlük orta düzey kullanım',
    dikkat: ['Sözleşme gücünüzün yeterli olduğunu keşifte doğrulatın.', 'Bazı araçlar tek fazda daha düşük akım çeker.'],
    rehber: 'dogru-sarj-unitesi-secimi',
  },
  {
    id: 'wallbox-11-uc-faz',
    kategori: 'wallbox',
    ad: '11 kW üç faz wallbox',
    ozet: 'Üç faz, faz başına 16 A. Üç faz bağlantılı müstakil evlerde yaygın; altyapıyı 22 kW\'a göre daha az zorlar.',
    kimeUygun: 'Üç faz bağlantısı olan müstakil ev ve villalar',
    dikkat: ['Aracınızın üç fazla şarj olabildiğini kontrol edin.'],
    rehber: 'dogru-sarj-unitesi-secimi',
  },
  {
    id: 'wallbox-22-uc-faz',
    kategori: 'wallbox',
    ad: '22 kW üç faz wallbox',
    ozet: 'Üç faz, faz başına 32 A. Yalnızca aracınız 22 kW AC kabul ediyorsa ya da birden fazla araç şarj edilecekse fark yaratır.',
    kimeUygun: 'İşyerleri, filolar, 22 kW AC destekli araçlar',
    dikkat: ['Aracın OBC sınırı 11 kW ise şarj hızlanmaz.', 'Bağlantı ve sözleşme gücü buna uygun olmalı.'],
    rehber: 'isyeri-ve-otoparklara-sarj-istasyonu',
  },
  {
    id: 'wallbox-yuk-yonetimli',
    kategori: 'wallbox',
    ad: 'Akıllı, yük yönetimli wallbox',
    ozet: 'Uygulama ile zamanlama ve tüketim takibi; evin toplam tüketimine göre şarj gücünü otomatik ayarlar.',
    kimeUygun: 'Sözleşme gücü sınırlı evler, apartman ve siteler',
    dikkat: ['Yük yönetimi için genellikle panoya ek bir ölçüm cihazı gerekir.'],
    rehber: 'apartman-ve-sitelerde-sarj-unitesi',
  },
  {
    id: 'kablo-type2-uc-faz',
    kategori: 'kablo',
    ad: 'Type 2 – Type 2 şarj kablosu (üç faz, 32 A)',
    ozet: 'Soketli ünitelerde ve halka açık AC istasyonlarda kullanılır. Üç faz 32 A kablo, tek faz araçlarla da çalışır.',
    kimeUygun: 'Type 2 girişli araçlar, soketli ünite kullananlar',
    dikkat: ['Kalın ve ağırdır; sık taşınacaksa uzunluğu buna göre seçin.'],
  },
  {
    id: 'kablo-type1-type2',
    kategori: 'kablo',
    ad: 'Type 1 – Type 2 şarj kablosu',
    ozet: 'Type 1 girişli (çoğunlukla eski) araçları Type 2 soketli ünite ve istasyonlara bağlar.',
    kimeUygun: 'Type 1 girişli araç sahipleri',
    dikkat: ['Type 1 tek faz çalışır; şarj gücü buna göre sınırlıdır.'],
  },
  {
    id: 'kablo-tasinabilir',
    kategori: 'kablo',
    ad: 'Taşınabilir şarj cihazı (kontrol kutulu kablo)',
    ozet: 'Ev prizine veya sanayi prizine takılarak yedek / acil şarj sağlar. Kalıcı ev şarjı için wallbox önerilir.',
    kimeUygun: 'Yolculukta yedek şarj, geçici çözüm',
    dikkat: [
      'Ev prizleri uzun süreli yüksek akım için tasarlanmamıştır; ısınma riskine karşı düşük akımda kullanın.',
      'Uzatma kablosu ve çoklu priz kullanmayın.',
    ],
    rehber: 'evde-sarj-unitesi-wallbox-kurulumu',
  },
  {
    id: 'adaptor-tip-gecis',
    kategori: 'adaptor',
    ad: 'Soket tipi geçiş adaptörü',
    ozet: 'Farklı soket tipleri arasında geçiş için. Çoğu durumda doğru kabloyu almak, adaptörden daha güvenli bir çözümdür.',
    kimeUygun: 'Farklı standartlarda istasyon kullanmak zorunda kalanlar',
    dikkat: ['Üreticinin onayladığı ürünleri kullanın.', 'Adaptör zinciri kurmayın.'],
  },
];

export const urunVarMi = (k: KategoriSlug) => URUNLER.some((u) => u.kategori === k);
export const SATIS_ORTAKLIGI_VAR = URUNLER.some((u) => u.baglanti);
