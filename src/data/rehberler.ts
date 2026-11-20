/**
 * Rehber yazıları. Metinler kaynaklardan özetlenerek kendi cümlelerimizle yazılmıştır.
 * Rakamlar kaynakta belirtilen tarihe aittir; güncellerken tarih ve kaynağı da güncelleyin.
 */
export type Blok =
  | { tip: 'p'; metin: string }
  | { tip: 'h2'; metin: string }
  | { tip: 'liste'; maddeler: string[] }
  | { tip: 'not'; metin: string };

export interface Kaynak {
  ad: string;
  url: string;
}

export interface Rehber {
  slug: string;
  baslik: string;
  ozet: string;
  guncelleme: string;
  okumaDk: number;
  icerik: Blok[];
  kaynaklar: Kaynak[];
  hukukiNot?: boolean;
}

export const REHBERLER: Rehber[] = [
  {
    slug: 'evde-sarj-unitesi-wallbox-kurulumu',
    baslik: 'Evde şarj ünitesi (wallbox) kurulumu: adımlar ve maliyet kalemleri',
    ozet:
      'Müstakil evde wallbox kurulumunun adımları, 7,4 / 11 / 22 kW seçimi, maliyeti etkileyen kalemler ve 2026 elektrik tarifesindeki 4.000 kWh sınırının evde şarja etkisi.',
    guncelleme: '20 Kasım 2026',
    okumaDk: 6,
    icerik: [
      {
        tip: 'p',
        metin:
          'Elektrikli aracı evde, gece boyunca şarj etmek hem en ucuz hem en pratik yöntemdir. Bunun için duvara monte edilen bir şarj ünitesi (wallbox) kurulur. Normal prizden şarj mümkün olsa da yavaştır ve uzun süreli yüksek akım için tasarlanmamış prizlerde ısınma riski vardır.',
      },
      { tip: 'h2', metin: '1. Keşif: panonuz ve aboneliğiniz ne kaldırır?' },
      {
        tip: 'p',
        metin:
          'Kurulumdan önce yetkili bir elektrikçi ya da kurulum firması; elektrik panonuzu, sigorta kapasitesini, sözleşme gücünüzü ve evinizin tek faz mı üç faz mı beslendiğini kontrol eder. Sözleşme gücü düşük evlerde, yüksek güçte şarj ile diğer cihazlar aynı anda çalıştığında ana sigortanın atması sık görülen bir sorundur.',
      },
      { tip: 'h2', metin: '2. Doğru gücü seçin: 7,4 kW mı, 11 kW mı, 22 kW mı?' },
      {
        tip: 'liste',
        maddeler: [
          '7,4 kW (tek faz, 32 A): Daireler ve tek faz beslenen evler için tipik seçim. Saatte yaklaşık 35–40 km menzil ekler; gece şarjı için çoğu zaman yeterlidir.',
          '11 kW (üç faz): Üç faz (380 V) besleme gerektirir; müstakil ev ve villalarda yaygındır.',
          '22 kW (üç faz): Yalnızca aracınızın araç üstü şarj cihazı (OBC) 22 kW destekliyorsa fark yaratır. Birçok popüler modelin OBC\'si 11 kW olduğu için 22 kW ünite bu araçlarda daha hızlı şarj etmez.',
        ],
      },
      {
        tip: 'p',
        metin:
          'Kısacası ünite gücünü aracınızın OBC değerine ve evinizin beslemesine göre seçin; daha büyük ünite her zaman daha hızlı şarj anlamına gelmez.',
      },
      { tip: 'h2', metin: '3. Kurulum ve devreye alma' },
      {
        tip: 'liste',
        maddeler: [
          'Panodan şarj noktasına uygun kesitte, ayrı bir hat çekilir.',
          'Hatta kaçak akım koruması ve uygun sigorta eklenir.',
          'Ünite duvara monte edilir, test edilip teslim edilir. Altyapı hazırsa fiziksel montaj birkaç saat sürer; keşiften devreye almaya kadar toplam süre ise birkaç günden birkaç haftaya uzayabilir.',
          'Akıllı (Wi-Fi/Bluetooth, yük yönetimli) bir ünite seçerseniz şarjı ucuz saatlere kaydırabilir ve evin toplam tüketimine göre gücü otomatik ayarlayabilirsiniz.',
        ],
      },
      { tip: 'h2', metin: '4. Maliyeti neler belirler?' },
      {
        tip: 'p',
        metin:
          'Fiyat; ünitenin gücü ve markası, panodan şarj noktasına mesafe (kablo uzunluğu), gerekli koruma elemanları, gerekiyorsa proje ve güç artırımı işlemlerine göre değişir. Araclo\'nun 2026 tahminlerine göre 7,4 kW tek faz anahtar teslim kurulum 35.000 TL\'den başlıyor; 22 kW ünite 11 kW\'a göre 10.000–20.000 TL ek maliyet getirebiliyor; apartman ortak alanı, üç faza geçiş ve uzun kablo gibi karmaşık durumlarda toplam 100.000–150.000 TL\'ye çıkabiliyor. Bunlar tahmindir; kesin fiyat için yerinde keşif gerekir.',
      },
      { tip: 'h2', metin: '5. Elektrik faturası: 4.000 kWh sınırına dikkat' },
      {
        tip: 'p',
        metin:
          'EPDK, 1 Ocak 2026\'dan itibaren meskenler için düşük tarifeden yararlanma sınırını yıllık 5.000 kWh\'ten 4.000 kWh\'e (ayda ortalama yaklaşık 333 kWh) indirdi. Önceki yıl tüketimi bu sınırı aşan aboneler daha yüksek fiyatlı son kaynak tedarik tarifesine geçiyor. Evde düzenli şarj, hane tüketimini kolayca bu sınırın üzerine taşıyabilir. Bu yüzden şarj tüketiminizi ayrı izlemek ve mümkünse şarjı planlamak, faturayı kontrol altında tutmanın en etkili yoludur.',
      },
      {
        tip: 'not',
        metin:
          'Rakamlar kaynakların yayımlandığı tarihe aittir ve değişebilir. Kurulumu mutlaka yetkili bir elektrikçiye veya kurulum firmasına yaptırın.',
      },
    ],
    kaynaklar: [
      { ad: 'Araclo — Evde wallbox kurulumu: 2026 maliyet ve adımlar', url: 'https://www.araclo.com/blog/evde-sarj-icin-wallbox-kurulumu-2026-maliyet-ve-adim-adim-rehber' },
      { ad: 'Habertürk — Elektrik faturalarında yeni dönem (31.10.2025)', url: 'https://www.haberturk.com/elektrik-faturalarinda-yeni-donem-984-tl-nin-uzerinde-faturasi-olan-yararlanamayacak-3834110-ekonomi' },
      { ad: 'Ekonomim — Evde elektrikli araç şarjı 2026\'da daha pahalı olacak', url: 'https://www.ekonomim.com/ekonomi/evde-elektrikli-arac-sarji-2026da-daha-pahali-olacak-haberi-852308' },
    ],
  },
  {
    slug: 'apartman-ve-sitelerde-sarj-unitesi',
    baslik: 'Apartman ve sitelerde şarj ünitesi: yönetim kararı ve süreç',
    ozet:
      'Site ya da apartman otoparkına şarj ünitesi kurmak için kat malikleri kararı gerekir mi, hangi çoğunluk yeter, süreç nasıl işler? Bakanlık görüşü ve pratik adımlar.',
    guncelleme: '20 Kasım 2026',
    okumaDk: 5,
    hukukiNot: true,
    icerik: [
      {
        tip: 'p',
        metin:
          'Apartman ve sitelerde en sık sorulan soru, şarj ünitesi için bütün kat maliklerinin onayının gerekip gerekmediğidir. Çevre, Şehircilik ve İklim Değişikliği Bakanlığı\'nın Temmuz 2024\'te 81 il valiliğine gönderdiği ve basına yansıyan bilgilendirme yazısı bu konuda yol gösteriyor.',
      },
      { tip: 'h2', metin: 'Bakanlık görüşü ne diyor?' },
      {
        tip: 'liste',
        maddeler: [
          'Şarj üniteleri ruhsat gerektiren bir yapı niteliğinde değildir.',
          'Kurulum, Kat Mülkiyeti Kanunu\'nun 19. maddesi kapsamında değerlendirilmez; bu nedenle tüm kat maliklerinin beşte dördünün onayı aranmaz, salt çoğunluk yeterlidir.',
          'Size tahsisli bir otopark yeri varsa ve mevcut tesisata müdahale etmeden kurulum yapılıyorsa ayrıca yönetim kararı gerekmeyebilir.',
          'Tahsisli otopark yoksa ortak alan için salt çoğunluk kararı gerekir.',
          'Konutlarda ticari amaçla (ücret karşılığı) şarj hizmeti verilmesi bu kapsamın dışındadır; ayrı mevzuata tabidir.',
        ],
      },
      { tip: 'h2', metin: 'Süreç adım adım' },
      {
        tip: 'liste',
        maddeler: [
          'Site yönetimiyle görüşün: otopark yeriniz tahsisli mi, ortak elektrik tesisatı kullanılacak mı öğrenin.',
          'Gerekirse kat malikleri kurulunda salt çoğunluk kararı alın; kararı yazılı hale getirin.',
          'Keşif yaptırın: elektriğin kendi dairenizin sayacından mı, ortak sayaçtan mı yoksa ayrı bir sayaçtan mı alınacağı belirlenir. Ortak panoya müdahale, yeni kablo güzergâhı veya trafo kapasitesi gibi konular varsa teknik proje gerekebilir.',
          'Birden fazla kişi şarj ünitesi istiyorsa, binanın toplam gücünü aşmamak için yük yönetimli bir sistem planlamak, ileride yaşanacak sigorta ve kapasite sorunlarını önler.',
          'Kurulumu yetkili firmaya yaptırın, belgeleri ve test sonuçlarını saklayın.',
        ],
      },
      { tip: 'h2', metin: 'Yeni binalarda durum' },
      {
        tip: 'p',
        metin:
          'Otopark Yönetmeliği\'ndeki düzenlemeye göre zorunlu otopark sayısı 20 ve üzeri olan yeni konut binalarında en az bir şarj ünitesi bulunması ve otoparkın en az %5\'inin elektrikli araçlara uygun düzenlenmesi isteniyor. Yeni bir siteden daire alıyorsanız bu altyapıyı sorabilirsiniz.',
      },
      {
        tip: 'not',
        metin:
          'Bu yazı genel bilgilendirme amaçlıdır, hukuki tavsiye değildir. Binanızın yönetim planı ve somut durumunuz için bir avukata veya site yönetiminize danışın.',
      },
    ],
    kaynaklar: [
      { ad: 'LOG — Site ve apartmanlara şarj ünitesi kurulumu hakkında resmi bilgilendirme (26.07.2024)', url: 'https://www.log.com.tr/site-ve-apartmanlara-elektrikli-arac-sarj-unitesi-kurulumu-hakkinda-resmi-bir-bilgilendirme-gecildi/' },
      { ad: 'FFK Partner Hukuk — Siteye şarj istasyonu kurmak için oy birliği gerekir mi?', url: 'https://www.ffkpartnerhukuk.com.tr/siteye-sarj-istasyonu-kurmak-icin-oy-birligi-gerekir-mi-2026-guncel-hukuki-rehber/' },
      { ad: 'Para Dergi — Yeni binalarda araç şarj istasyonları zorunlu', url: 'https://www.paradergi.com.tr/sektorler/2023/11/13/yeni-binalarda-arac-sarj-istasyonlari-zorunlu' },
    ],
  },
];
