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
  {
    slug: 'dogru-sarj-unitesi-secimi',
    baslik: 'Doğru şarj ünitesi seçimi: 7,4 / 11 / 22 kW, tek faz / üç faz',
    ozet:
      '7,4, 11 ve 22 kW üniteler arasındaki fark nedir, tek faz ile üç faz neyi değiştirir, aracınız ne kadar gücü kabul eder? Basit hesaplar ve kısa bir kontrol listesiyle doğru üniteyi seçin.',
    guncelleme: '21 Kasım 2026',
    okumaDk: 6,
    icerik: [
      {
        tip: 'p',
        metin:
          'Şarj ünitesi alırken ilk bakılan değer genellikle kW olur. Oysa en yüksek güçteki ünite her zaman en doğru seçim değildir: evinizin elektrik bağlantısı, sözleşme gücünüz ve aracınızın kabul edebildiği güç, ünitenin gerçekte ne kadar hızlı şarj edeceğini belirler.',
      },
      { tip: 'h2', metin: '7,4, 11 ve 22 kW nereden geliyor?' },
      {
        tip: 'p',
        metin:
          'AC şarj ünitesinin gücü, faz sayısı ile her fazdan çekilen akımın çarpımından gelir. Faz-nötr gerilimi yaklaşık 230 V olduğunda kaba hesaplar şöyledir:',
      },
      {
        tip: 'liste',
        maddeler: [
          'Tek faz, 32 A: 230 V × 32 A ≈ 7,4 kW',
          'Üç faz, 16 A: 3 × 230 V × 16 A ≈ 11 kW',
          'Üç faz, 32 A: 3 × 230 V × 32 A ≈ 22 kW',
        ],
      },
      {
        tip: 'p',
        metin:
          'Yani 22 kW bir ünite, üç fazlı ve her fazda 32 A taşıyabilen bir bağlantı ister. Evlerin çoğu tek faz beslendiği için üç faz bir ünite takmak çoğu zaman önce tesisat ve abonelik değişikliği gerektirir.',
      },
      { tip: 'h2', metin: 'Belirleyici olan çoğu zaman araçtır' },
      {
        tip: 'p',
        metin:
          'AC şarjda elektriği bataryaya uygun hale getiren, aracın içindeki araç üstü şarj cihazıdır (OBC). Ünite ne kadar güçlü olursa olsun araç kendi OBC sınırından fazlasını almaz. Aracınız en fazla 11 kW AC kabul ediyorsa 22 kW ünite şarjı hızlandırmaz. Benzer şekilde kullandığınız kablonun akım değeri de gücü sınırlayabilir.',
      },
      {
        tip: 'p',
        metin:
          'Bazı modeller tek fazda daha düşük akım çeker; bu durumda tek fazlı bir bağlantıda güç 7,4 kW\'ın altında kalır. Aracınızın AC şarj değerini (kW ve kaç fazla şarj olduğunu) kullanım kılavuzundan veya üreticinin sitesinden kontrol edin.',
      },
      { tip: 'h2', metin: 'Şarj süresini kabaca hesaplamak' },
      {
        tip: 'p',
        metin:
          'Yaklaşık süre = eklenecek enerji (kWh) ÷ şarj gücü (kW). Örneğin bataryaya 40 kWh eklemek için 7,4 kW ile yaklaşık 5,5 saat, 11 kW ile yaklaşık 3,5–4 saat, 22 kW ile (araç destekliyorsa) yaklaşık 2 saat gerekir. Kayıplar, batarya sıcaklığı ve doluluk arttıkça yavaşlayan şarj nedeniyle gerçek süre biraz daha uzun olur. Aracı gece boyunca şarj eden çoğu kullanıcı için 7,4 veya 11 kW yeterlidir.',
      },
      { tip: 'h2', metin: 'Hangi güç kime uygun?' },
      {
        tip: 'liste',
        maddeler: [
          '7,4 kW (tek faz): Tek faz beslenen daireler ve evler; günlük kullanımı orta düzeyde olan sürücüler.',
          '11 kW (üç faz): Üç faz bağlantısı olan müstakil ev ve villalar. Faz başına 16 A çektiği için altyapıyı 22 kW\'a göre daha az zorlar.',
          '22 kW (üç faz): Aracı 22 kW AC kabul eden kullanıcılar, kısa sürede birden fazla aracın şarj edildiği işyerleri ve filolar. Bağlantı ve sözleşme gücünün buna uygun olması gerekir.',
        ],
      },
      { tip: 'h2', metin: 'Güç dışında bakılacak özellikler' },
      {
        tip: 'liste',
        maddeler: [
          'Soket tipi: Türkiye ve Avrupa\'da AC şarj için yaygın standart Type 2\'dir. Kablolu ünite pratiktir; soketli ünite farklı kablolarla esneklik sağlar.',
          'Kaçak akım koruması: Ünitenin DC kaçak akımı algılayan bir koruması olup olmadığını sorun; yoksa panoda uygun tipte koruma gerekebilir. Bu seçimi kurulumcunuzla yapın.',
          'Dinamik yük yönetimi: Evdeki diğer cihazlar çok güç çektiğinde şarj gücünü otomatik düşürür; sözleşme gücü sınırlı evlerde sigorta atmasını önlemeye yardımcı olur.',
          'Zamanlama ve uygulama: Şarjı belirli saatlere kaydırmak ve tüketimi ayrı izlemek, faturayı kontrol etmeyi kolaylaştırır.',
          'Kart (RFID) ve OCPP desteği: Apartman, site ve işyerlerinde kullanıcıları ayırmak ve üniteyi bir yönetim yazılımına bağlamak için önemlidir.',
          'Dış mekân dayanımı: Açık otoparkta kullanılacaksa toz-su koruma sınıfına (IP) ve çalışma sıcaklığı aralığına bakın.',
        ],
      },
      { tip: 'h2', metin: 'Kısa kontrol listesi' },
      {
        tip: 'liste',
        maddeler: [
          'Aracımın AC şarj gücü kaç kW, kaç fazla şarj oluyor?',
          'Aboneliğim tek faz mı, üç faz mı; sözleşme gücüm ne kadar?',
          'Günde ortalama kaç km yol yapıyorum, araç gece kaç saat park halinde?',
          'Ünite kapalı mekâna mı, açık alana mı takılacak?',
          'İleride ikinci bir elektrikli araç düşünüyor muyum?',
        ],
      },
      {
        tip: 'not',
        metin:
          'Hesaplar yaklaşıktır. Ünite gücünü ve koruma elemanlarını, yerinde keşif yapan yetkili bir elektrikçi veya kurulum firmasıyla birlikte belirleyin.',
      },
    ],
    kaynaklar: [
      { ad: 'V2C — Şarj cihazı 7 kW mı 22 kW mı? Monofaze ve trifaze farkı (15.07.2025)', url: 'https://v2charge.com/tr/elektrikli-araclar-icin-tek-fazli-ve-uc-fazli-sarj-cihazlari-arasindaki-farklar/' },
      { ad: 'go-e — Wallbox 11 veya 22 kW: hangisine ihtiyacınız var? (14.06.2024)', url: 'https://go-e.com/tr/blog/wallbox-11-veya-22-kw' },
      { ad: 'Hyundai Türkiye — Evde şarj (erişim: 21.11.2026)', url: 'https://www.hyundai.com/tr/tr/elektrifikasyon/elektrikli-otomobil-sahibi-olmak/neden-elektrikli/sarj/evde-sarj.html' },
    ],
  },
  {
    slug: 'isyeri-ve-otoparklara-sarj-istasyonu',
    baslik: 'İşyeri ve otoparklara şarj istasyonu: seçenekler ve süreç',
    ozet:
      'Ofis, mağaza, otel veya ticari otoparkınıza şarj istasyonu kurarken AC mi DC mi seçmeli, ücretli hizmet vermek neyi değiştirir, hangi düzenlemelere bakmalı? Adım adım süreç ve maliyet kalemleri.',
    guncelleme: '21 Kasım 2026',
    okumaDk: 7,
    hukukiNot: true,
    icerik: [
      { tip: 'h2', metin: 'Önce amacı belirleyin' },
      {
        tip: 'p',
        metin:
          'İşyerlerinde şarj istasyonu genellikle üç ihtiyaçtan biri için kurulur: şirket araçlarının (filo) şarjı, çalışanların araçlarının mesai sırasında şarjı ya da müşteri ve misafirlere hizmet. Amaç; ünite sayısını, gücünü, ödeme yöntemini ve hangi düzenlemelerin geçerli olacağını belirler.',
      },
      { tip: 'h2', metin: 'AC mi, DC mi?' },
      {
        tip: 'p',
        metin: 'Seçimi belirleyen en önemli ölçüt, araçların otoparkınızda ne kadar beklediğidir:',
      },
      {
        tip: 'liste',
        maddeler: [
          'Uzun bekleme (ofis, otel, gece parkı): 11 veya 22 kW AC üniteler genellikle yeterlidir; altyapı maliyeti DC\'ye göre düşüktür.',
          'Kısa bekleme (mağaza, restoran, yol üstü tesis): Kısa sürede anlamlı şarj için DC hızlı şarj gerekir. DC üniteler çok daha yüksek bağlantı gücü ister; çoğu zaman trafo veya ayrı bir enerji bağlantısı gündeme gelir.',
          'Karma çözüm: Birkaç AC ünitenin yanında tek bir DC ünite, farklı kullanıcı tiplerine hizmet etmenin yaygın bir yoludur.',
        ],
      },
      { tip: 'h2', metin: 'Kendi kullanımınız mı, ücretli şarj hizmeti mi?' },
      {
        tip: 'p',
        metin:
          'Türkiye\'de şarj hizmeti, 2 Nisan 2022\'de Resmî Gazete\'de yayımlanan Şarj Hizmeti Yönetmeliği ile EPDK düzenlemesi altına alındı; şarj ağı işletmeciliği lisansa bağlandı. Yönetmelikte Mart 2026\'da da değişiklik yapıldığı ve şarj ağı işletmecilerinin yükümlülüklerinin genişletildiği haberlere yansıdı.',
      },
      {
        tip: 'p',
        metin:
          'Bu nedenle üçüncü kişilere ücret karşılığı şarj hizmeti vermeyi planlıyorsanız, istasyonunuzu lisanslı bir şarj ağı işletmecisinin ağına dahil etmek gibi modelleri ve gereken izinleri kurulumdan önce bir uzmana danışarak netleştirin. Yalnızca kendi araçlarınız veya çalışanlarınız için kurulan ünitelerde yükümlülükler farklılaşabilir.',
      },
      { tip: 'h2', metin: 'Yeni yapılarda ve büyük otoparklarda yükümlülükler' },
      {
        tip: 'p',
        metin:
          'Otopark Yönetmeliği\'nde yapılan değişikliklerle, belirli sayının üzerinde otopark yeri olan yeni yapılarda şarj ünitesi ve elektrikli araca uygun park yeri ayrılması; genel otoparklarda ve büyük alışveriş merkezlerinde ise daha yüksek oranlar istendiği aktarılıyor. Yeni bir yapı veya otopark projesindeyseniz güncel oranları proje müellifiniz ve belediyenizle doğrulayın.',
      },
      { tip: 'h2', metin: 'Süreç adım adım' },
      {
        tip: 'liste',
        maddeler: [
          'İhtiyaç analizi: Günde kaç aracın, ne kadar süre beklediğini ve ne kadar enerji gerektiğini tahmin edin.',
          'Altyapı incelemesi: Mevcut bağlantı gücü, ana pano, kablo güzergâhları ve gerekirse trafo kapasitesi incelenir.',
          'Ünite ve yazılım seçimi: Kullanıcı tanıma (kart/uygulama), raporlama, ödeme ve uzaktan yönetim (OCPP uyumu) ihtiyaçları belirlenir.',
          'Yük yönetimi: Tüm ünitelerin aynı anda tam güçte çalışmasını beklemek yerine gücü üniteler arasında paylaştıran bir sistem, gereken bağlantı gücünü ve maliyeti düşürebilir.',
          'Proje, izinler ve kurulum: Gerekli başvurular yapılır; tesisat yetkili firma tarafından kurulur ve test edilir.',
          'İşletme: Bakım, arıza müdahalesi ve kullanım kuralları (park süresi, ücretlendirme) belirlenir.',
        ],
      },
      { tip: 'h2', metin: 'Maliyeti etkileyen kalemler' },
      {
        tip: 'liste',
        maddeler: [
          'Ünite sayısı, türü (AC/DC) ve gücü.',
          'Bağlantı gücü artışı; gerekirse trafo ve orta gerilim işleri.',
          'Ana pano, kablo, kanal ve kazı işleri; ünite başına mesafe.',
          'Zemin işleri, ayaklı montaj, çarpma bariyerleri ve park yeri işaretlemesi.',
          'Yönetim yazılımı, kullanıcı kartları ve varsa abonelik ücretleri.',
          'Bakım ve servis sözleşmesi.',
        ],
      },
      {
        tip: 'p',
        metin:
          'İşyeri kurulumlarında fiyatlar projeye özgü olduğundan bu rehberde rakam vermiyoruz; keşif sonrası kalem kalem teklif almanızı öneririz.',
      },
      {
        tip: 'not',
        metin:
          'Bu yazı genel bilgilendirme amaçlıdır, hukuki tavsiye değildir. Ücretli şarj hizmeti, lisans ve imar yükümlülükleri için bir avukata veya uzmana danışın.',
      },
    ],
    kaynaklar: [
      { ad: 'Gönen Hukuk — Şarj Hizmeti Yönetmeliği yürürlüğe girdi (RG 02.04.2022)', url: 'https://gonen.com.tr/sarj-hizmeti-yonetmeligi-yururluge-girdi/?lang=tr' },
      { ad: 'Bloomberg HT — Şarj Hizmeti Yönetmeliğinde değişiklik (23.03.2026)', url: 'https://www.bloomberght.com/sarj-hizmeti-yonetmeliginde-degisiklik-3772453' },
      { ad: 'Para Dergi — Yeni binalarda araç şarj istasyonları zorunlu (13.11.2023)', url: 'https://www.paradergi.com.tr/sektorler/2023/11/13/yeni-binalarda-arac-sarj-istasyonlari-zorunlu' },
      { ad: 'Resmî Gazete — Otopark Yönetmeliğinde Değişiklik (25.03.2021)', url: 'https://www.resmigazete.gov.tr/eskiler/2021/03/20210325-12.htm' },
    ],
  },
];
