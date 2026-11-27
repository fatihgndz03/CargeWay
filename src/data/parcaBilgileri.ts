/**
 * 3D araç incelemesi (/deneme/arac-3d) — parça bilgi kartları.
 * Yalnızca genel çalışma prensibi; araca özel rakam yok (docs/arac-3d-plan.md kuralları).
 * Bu dosya yalnızca deneme sayfasının tembel yüklenen parçasına girer; ana paket büyümez.
 * AZ metinleri yayından önce ana dili AZ olan biri gözden geçirmeli.
 */
import type { Dil } from '../i18n';

export type ParcaAdi = 'batarya' | 'motor' | 'reduktor' | 'inverter' | 'obc' | 'soket' | 'sogutma' | 'kablo';
export type ParcaBilgisi = { ozet: string; maddeler: string[] };

export const PARCA_BILGILERI: Record<Dil, Record<ParcaAdi, ParcaBilgisi>> = {
  tr: {
    batarya: {
      ozet: 'Aracın enerjisini doğru akım (DC) olarak depolar. Çok sayıda lityum iyon hücre modüllere, modüller de tek bir pakete toplanır.',
      maddeler: [
        'Batarya yönetim sistemi (BMS) hücrelerin gerilimini ve sıcaklığını sürekli izler, şarj ve deşarjı güvenli sınırlarda tutar.',
        'Kapasite kWh ile ifade edilir ve menzili belirleyen başlıca etkenlerden biridir.',
        'Birçok elektrikli araçta paket, tabanın altına yerleştirilir; bu da ağırlık merkezini alçaltır.',
      ],
    },
    motor: {
      ozet: 'Elektrik enerjisini tekerlekleri döndüren harekete çevirir. Sabit duran statorun sargılarında oluşan döner manyetik alan, içindeki rotoru döndürür.',
      maddeler: [
        'Yavaşlarken ya da frenlerken jeneratör gibi çalışıp enerjiyi bataryaya geri kazandırabilir (rejeneratif frenleme).',
        'Elektrikli araçlarda yaygın türler kalıcı mıknatıslı senkron motor ve asenkron (indüksiyon) motordur.',
        'Tam torku çok düşük devirden itibaren verebildiği için kalkış hızlı ve sarsıntısızdır.',
      ],
    },
    reduktor: {
      ozet: 'Motorun yüksek devrini tekerleğe uygun devre düşürür, bu sırada torku artırır.',
      maddeler: [
        'Çoğu elektrikli araçta tek oranlıdır; vites değiştirmez.',
        'Genellikle diferansiyeli de içerir; virajda iç ve dış tekerleğin farklı hızda dönmesini sağlar.',
      ],
    },
    inverter: {
      ozet: 'Bataryadaki doğru akımı (DC), motorun ihtiyaç duyduğu alternatif akıma (AC) çevirir.',
      maddeler: [
        'Akımın frekansını ve büyüklüğünü ayarlayarak motorun hızını ve torkunu kontrol eder.',
        'Rejeneratif frenlemede tersini yapar: motorun ürettiği AC’yi bataryaya yüklenebilecek DC’ye çevirir.',
        'Yüksek akımla çalıştığı için genellikle sıvı soğutma hattına bağlıdır.',
      ],
    },
    obc: {
      ozet: 'Evdeki şarj ünitesinden (wallbox) ya da prizden gelen alternatif akımı (AC), bataryanın depolayabileceği doğru akıma (DC) çevirir.',
      maddeler: [
        'AC şarj gücünü bu cihazın kapasitesi sınırlar: wallbox daha güçlü olsa bile araç en fazla OBC’nin izin verdiği gücü çeker.',
        'Bu yüzden wallbox seçerken aracın AC şarj gücüne ve evin elektrik altyapısına (tek faz / üç faz) birlikte bakmak gerekir.',
        'DC hızlı şarjda devre dışı kalır; dönüştürme istasyonun içinde yapılır ve akım doğrudan bataryaya gider.',
      ],
    },
    soket: {
      ozet: 'Şarj kablosunun takıldığı giriştir. Hem AC hem DC şarj buradan yapılır.',
      maddeler: [
        'Türkiye’de ve Avrupa’da AC şarj için Tip 2, DC hızlı şarj için CCS2 (Tip 2’nin altına iki DC pimi eklenmiş hâli) yaygındır.',
        'Kablo takılınca araç ile şarj cihazı haberleşir; şarj başlamadan önce kablo kilitlenir.',
        'Sahnedeki soket genel bir çizimdir; belirli bir standardın pim dizilimini birebir göstermez.',
      ],
    },
    sogutma: {
      ozet: 'Batarya, motor ve güç elektroniğini verimli ve güvenli çalıştıkları sıcaklık aralığında tutar. Sıvı, pompa ile hat boyunca dolaşır, ısıyı radyatöre taşır.',
      maddeler: [
        'Soğuk havada bataryayı ısıtmak için de kullanılabilir; birçok araçta ısı pompası bu sisteme bağlıdır.',
        'Batarya sıcaklığı DC hızlı şarjda ulaşılabilen şarj gücünü doğrudan etkiler.',
      ],
    },
    kablo: {
      ozet: 'Batarya, inverter, motor, OBC ve şarj soketi arasında yüksek gerilimli enerjiyi taşır.',
      maddeler: [
        'Yüksek gerilim hatları uluslararası uygulamada turuncu renkle işaretlenir; kolayca ayırt edilebilsin diye.',
        'Batarya gerilimi araca göre yüzlerce volt düzeyindedir; bu hatlara yalnızca eğitimli ve yetkili servis personeli müdahale etmelidir.',
      ],
    },
  },
  en: {
    batarya: {
      ozet: 'Stores the car’s energy as direct current (DC). Many lithium-ion cells are grouped into modules, and the modules into a single pack.',
      maddeler: [
        'The battery management system (BMS) continuously monitors cell voltage and temperature and keeps charging and discharging within safe limits.',
        'Capacity is expressed in kWh and is one of the main factors that determine range.',
        'In many electric cars the pack sits under the floor, which lowers the centre of gravity.',
      ],
    },
    motor: {
      ozet: 'Turns electrical energy into the motion that drives the wheels. A rotating magnetic field created in the windings of the stationary stator spins the rotor inside it.',
      maddeler: [
        'When slowing down or braking it can work as a generator and recover energy into the battery (regenerative braking).',
        'Common types in electric cars are permanent-magnet synchronous motors and asynchronous (induction) motors.',
        'Because it delivers full torque from very low speeds, pulling away is quick and smooth.',
      ],
    },
    reduktor: {
      ozet: 'Reduces the motor’s high speed to a speed suitable for the wheels, increasing torque in the process.',
      maddeler: [
        'In most electric cars it has a single ratio and does not shift gears.',
        'It usually includes the differential, which lets the inner and outer wheels turn at different speeds in corners.',
      ],
    },
    inverter: {
      ozet: 'Converts the battery’s direct current (DC) into the alternating current (AC) the motor needs.',
      maddeler: [
        'It controls the motor’s speed and torque by adjusting the frequency and magnitude of the current.',
        'During regenerative braking it works in reverse, converting the AC produced by the motor into DC that can be stored in the battery.',
        'Because it handles high currents, it is usually connected to the liquid coolant circuit.',
      ],
    },
    obc: {
      ozet: 'Converts alternating current (AC) from a home charger (wallbox) or a socket into direct current (DC) that the battery can store.',
      maddeler: [
        'Its capacity limits AC charging power: even with a more powerful wallbox, the car draws no more than the OBC allows.',
        'That is why a wallbox should be chosen with both the car’s AC charging power and the home’s electrical supply (single-phase / three-phase) in mind.',
        'It is bypassed during DC fast charging: the conversion happens inside the charging station and current flows straight to the battery.',
      ],
    },
    soket: {
      ozet: 'The inlet where the charging cable is plugged in. Both AC and DC charging go through it.',
      maddeler: [
        'In Türkiye and Europe, Type 2 is common for AC charging and CCS2 (Type 2 with two DC pins added below) for DC fast charging.',
        'Once the cable is plugged in, the car and the charger communicate, and the cable is locked before charging starts.',
        'The inlet in the scene is a generic drawing and does not reproduce the pin layout of a specific standard.',
      ],
    },
    sogutma: {
      ozet: 'Keeps the battery, motor and power electronics within the temperature range where they work efficiently and safely. A pump circulates coolant through the circuit, carrying heat to the radiator.',
      maddeler: [
        'It can also be used to warm the battery in cold weather; in many cars a heat pump is connected to this system.',
        'Battery temperature directly affects the charging power that can be reached during DC fast charging.',
      ],
    },
    kablo: {
      ozet: 'Carry high-voltage energy between the battery, inverter, motor, OBC and charging inlet.',
      maddeler: [
        'By international practice, high-voltage lines are marked in orange so they are easy to tell apart.',
        'Battery voltage is in the hundreds of volts depending on the car; only trained, authorised service staff should work on these lines.',
      ],
    },
  },
  az: {
    batarya: {
      ozet: 'Avtomobilin enerjisini sabit cərəyan (DC) kimi saxlayır. Çoxlu litium-ion hüceyrə modullarda, modullar isə vahid blokda birləşdirilir.',
      maddeler: [
        'Batareya idarəetmə sistemi (BMS) hüceyrələrin gərginliyini və temperaturunu daim izləyir, şarj və boşalmanı təhlükəsiz hədlərdə saxlayır.',
        'Tutum kWh ilə ifadə olunur və yürüş məsafəsini müəyyən edən əsas amillərdən biridir.',
        'Bir çox elektromobildə blok döşəmənin altında yerləşir; bu, ağırlıq mərkəzini aşağı salır.',
      ],
    },
    motor: {
      ozet: 'Elektrik enerjisini təkərləri fırladan hərəkətə çevirir. Sabit statorun dolaqlarında yaranan fırlanan maqnit sahəsi içindəki rotoru fırladır.',
      maddeler: [
        'Yavaşlayanda və ya əyləc veriləndə generator kimi işləyib enerjini batareyaya qaytara bilər (rekuperativ əyləc).',
        'Elektromobillərdə geniş yayılmış növlər daimi maqnitli sinxron və asinxron (induksiya) mühərriklərdir.',
        'Tam fırlanma momentini çox aşağı dövrlərdən verə bildiyi üçün tərpənmə sürətli və rəvandır.',
      ],
    },
    reduktor: {
      ozet: 'Mühərrikin yüksək dövrlərini təkər üçün uyğun dövrə endirir və bu zaman fırlanma momentini artırır.',
      maddeler: [
        'Əksər elektromobillərdə tək ötürmə nisbətlidir; sürət dəyişmir.',
        'Adətən diferensialı da özündə birləşdirir; döngədə daxili və xarici təkərin fərqli sürətlə fırlanmasını təmin edir.',
      ],
    },
    inverter: {
      ozet: 'Batareyadakı sabit cərəyanı (DC) mühərrikin ehtiyac duyduğu dəyişən cərəyana (AC) çevirir.',
      maddeler: [
        'Cərəyanın tezliyini və böyüklüyünü tənzimləyərək mühərrikin sürətini və fırlanma momentini idarə edir.',
        'Rekuperativ əyləcdə əksini edir: mühərrikin yaratdığı AC-ni batareyaya yüklənə bilən DC-yə çevirir.',
        'Yüksək cərəyanla işlədiyi üçün adətən maye soyutma xəttinə qoşulur.',
      ],
    },
    obc: {
      ozet: 'Evdəki şarj qurğusundan (wallbox) və ya rozetkadan gələn dəyişən cərəyanı (AC) batareyanın saxlaya biləcəyi sabit cərəyana (DC) çevirir.',
      maddeler: [
        'AC şarj gücünü bu cihazın tutumu məhdudlaşdırır: wallbox daha güclü olsa belə, avtomobil OBC-nin icazə verdiyindən çox güc çəkmir.',
        'Buna görə wallbox seçərkən avtomobilin AC şarj gücünə və evin elektrik şəbəkəsinə (bir faza / üç faza) birlikdə baxmaq lazımdır.',
        'DC sürətli şarjda istifadə olunmur: çevrilmə stansiyanın içində aparılır və cərəyan birbaşa batareyaya gedir.',
      ],
    },
    soket: {
      ozet: 'Şarj kabelinin taxıldığı girişdir. Həm AC, həm də DC şarj buradan aparılır.',
      maddeler: [
        'Türkiyədə və Avropada AC şarj üçün Tip 2, DC sürətli şarj üçün CCS2 (Tip 2-nin altına iki DC pini əlavə olunmuş variantı) geniş yayılıb.',
        'Kabel taxılanda avtomobil və şarj cihazı əlaqə qurur; şarj başlamazdan əvvəl kabel kilidlənir.',
        'Səhnədəki yuva ümumi təsvirdir; konkret standartın pin düzülüşünü olduğu kimi göstərmir.',
      ],
    },
    sogutma: {
      ozet: 'Batareyanı, mühərriki və güc elektronikasını səmərəli və təhlükəsiz işlədikləri temperatur aralığında saxlayır. Maye nasosla xətt boyunca dövr edir və istiliyi radiatora daşıyır.',
      maddeler: [
        'Soyuq havada batareyanı qızdırmaq üçün də istifadə oluna bilər; bir çox avtomobildə istilik nasosu bu sistemə qoşulur.',
        'Batareyanın temperaturu DC sürətli şarjda əldə edilə bilən şarj gücünə birbaşa təsir edir.',
      ],
    },
    kablo: {
      ozet: 'Batareya, invertor, mühərrik, OBC və şarj yuvası arasında yüksək gərginlikli enerjini daşıyır.',
      maddeler: [
        'Beynəlxalq təcrübədə yüksək gərginlik xətləri asan seçilsin deyə narıncı rənglə işarələnir.',
        'Batareyanın gərginliyi avtomobildən asılı olaraq yüzlərlə volt səviyyəsindədir; bu xətlərə yalnız təlim keçmiş, səlahiyyətli servis işçiləri müdaxilə etməlidir.',
      ],
    },
  },
};
