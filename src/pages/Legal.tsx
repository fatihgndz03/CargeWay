import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from '../components/DilLink';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSeo } from '../lib/seo';
import { KUNYE, KUNYE_TAMAM } from '../data/kunye';
import { useDil, useT, type Dil } from '../i18n';
import { YalnizTurkceNotu } from '../components/DilSecici';

/**
 * TASLAK hukuki metinler. Yayından önce bir hukukçu tarafından kontrol edilmeli
 * ve köşeli parantez içindeki alanlar ([...]) doldurulmalıdır.
 */
const SON_GUNCELLEME = '21 Kasım 2026';

const ETIKET: Record<Dil, { taslak: string; guncelleme: string; tarih: string; aciklama: string }> = {
  tr: {
    taslak: 'Taslak metin — hukuki kontrol sonrası kesinleşecektir.',
    guncelleme: 'Son güncelleme',
    tarih: SON_GUNCELLEME,
    aciklama: 'kişisel verilerin işlenmesi, haklarınız ve iletişim bilgileri.',
  },
  en: {
    taslak: 'Draft — to be finalised after legal review.',
    guncelleme: 'Last updated',
    tarih: '22 November 2026',
    aciklama: 'how personal data is processed, your rights and contact details.',
  },
  az: {
    taslak: 'Layihə mətni — hüquqi yoxlamadan sonra yekunlaşdırılacaq.',
    guncelleme: 'Son yenilənmə',
    tarih: '22 noyabr 2026',
    aciklama: 'fərdi məlumatların işlənməsi, hüquqlarınız və əlaqə məlumatları.',
  },
};

function LegalLayout({ title, children, yalnizTurkce = false }: { title: string; children: ReactNode; yalnizTurkce?: boolean }) {
  const e = ETIKET[useDil()];
  useSeo(`${title} — CargeWay`, `CargeWay ${title}: ${e.aciklama}`);
  const { hash } = useLocation();
  // Formlardaki "/kvkk#bolum" bağlantıları ilgili bölüme gitsin
  useEffect(() => {
    if (!hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [hash]);

  return (
    <div className="bg-black min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-gray-300">
        {!KUNYE_TAMAM && (
          <p className="mb-6 inline-block rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-400">
            {e.taslak}
          </p>
        )}
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-10">
          {e.guncelleme}: {yalnizTurkce ? SON_GUNCELLEME : e.tarih}
        </p>
        {yalnizTurkce && <YalnizTurkceNotu />}
        <div className="space-y-6 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:pt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-green-400 [&_a:hover]:underline">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

const VERI_SORUMLUSU = `${KUNYE.siteSahibi}, ${KUNYE.adres}`;
const ILETISIM = KUNYE.eposta;

export function KvkkPage() {
  const dil = useDil();
  if (dil !== 'tr') return <PrivacyNoticeIntl dil={dil} />;
  return (
    <LegalLayout title="KVKK Aydınlatma Metni">
      <p>
        Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, cargeway.com ("CargeWay") internet
        sitesini kullanan kişilere, kişisel verilerinin nasıl işlendiği hakkında bilgi vermek amacıyla hazırlanmıştır.
      </p>
      <h2>1. Veri sorumlusu</h2>
      <p>{VERI_SORUMLUSU}. İletişim: {ILETISIM}.</p>
      <h2>2. İşlenen kişisel veriler ve amaçları</h2>
      <ul>
        <li>
          <strong>E-posta adresi:</strong> Lansman bildirimi formunu doldurup onay kutusunu işaretlemeniz halinde, size
          CargeWay hakkında duyuru göndermek amacıyla. Bu onay, 6563 sayılı Kanun kapsamında elektronik ileti onayı
          niteliğindedir; her e-postadaki bağlantıdan veya {ILETISIM} adresine yazarak dilediğiniz an geri alabilirsiniz.
        </li>
        <li>
          <strong>Şarj ünitesi kurulum talebi:</strong> "Teklif al" formunu doldurmanız halinde ad soyad, telefon,
          (isteğe bağlı) e-posta, il/ilçe, mekan ve otopark bilgileri, araç modeli ve notunuz; kurulum teklifi
          hazırlanması ve sizinle iletişime geçilmesi amacıyla.
        </li>
        <li id="is-ortagi" className="scroll-mt-28">
          <strong>İş ortaklığı başvurusu (kurulum firmaları):</strong> "İş Ortağımız Olun" formunu doldurmanız halinde
          firma adı, web sitesi, yetki belgesi türleri, hizmet verilen iller ve kurulum türleri ile yetkili kişinin ad
          soyadı, telefonu, e-postası ve notu; başvurunun değerlendirilmesi, sizinle iletişime geçilmesi ve iş ortaklığı
          sözleşmesinin kurulması amacıyla.
        </li>
        <li>
          <strong>Konum bilgisi:</strong> "Konumumu kullan" özelliğini kullandığınızda tarayıcınızın paylaştığı konum, yalnızca
          haritayı bulunduğunuz yere götürmek için cihazınızda kullanılır; sunucularımıza gönderilmez ve saklanmaz.
        </li>
        <li>
          <strong>Arama metni:</strong> Harita sayfasında yazdığınız yer adı, konuma çevrilmesi için OpenStreetMap
          Nominatim hizmetine gönderilir.
        </li>
        <li>
          <strong>Teknik kayıtlar:</strong> IP adresi, tarayıcı bilgisi ve erişim zamanı gibi kayıtlar, sitenin güvenli
          biçimde sunulması amacıyla barındırma sağlayıcısı tarafından tutulabilir.
        </li>
      </ul>
      <h2>3. Hukuki sebepler</h2>
      <p>
        E-posta adresiniz ve kurulum talebi bilgileriniz açık rızanıza (KVKK m. 5/1) dayanılarak; teknik kayıtlar ise veri sorumlusunun meşru menfaati
        (KVKK m. 5/2-f) ve hukuki yükümlülükler (KVKK m. 5/2-ç) kapsamında işlenir. İş ortaklığı başvurularındaki
        bilgiler, bir sözleşmenin kurulmasıyla doğrudan ilgili olması (KVKK m. 5/2-c) ve veri sorumlusunun meşru
        menfaati (KVKK m. 5/2-f) hukuki sebeplerine dayanılarak işlenir; bu başvurular için ayrıca açık rıza
        alınmaz. [Hukuki kontrol: hukuki sebepler netleştirilmeli.]
      </p>
      <h2>4. Aktarım</h2>
      <p>
        <strong>Kurulum talepleri:</strong> Formda ayrıca açık rıza vermeniz halinde talep bilgileriniz, teklif
        hazırlamaları ve sizinle iletişime geçmeleri amacıyla CargeWay'in anlaşmalı olduğu, bölgenizde hizmet veren
        şarj ünitesi kurulum firmalarına (yurt içi) aktarılır. Bilgileriniz bu firmalara başka bir amaçla kullanılmak
        üzere verilmez. Rızanızı dilediğiniz zaman geri alabilirsiniz; geri alma, önceki aktarımları etkilemez.
      </p>
      <p>
        Hizmetin sunulması için şu hizmet sağlayıcılardan yararlanılmaktadır: veritabanı (Supabase), barındırma (Vercel),
        harita altlığı (CARTO / OpenStreetMap) ve adres arama (OpenStreetMap Nominatim). Bu sağlayıcıların sunucuları yurt
        dışında bulunabilir; yurt dışına aktarım KVKK m. 9 hükümlerine uygun olarak yapılır. [Hukuki kontrol: aktarım
        dayanağı netleştirilmeli.]
      </p>
      <h2>5. Saklama süresi</h2>
      <p>
        E-posta adresiniz, abonelikten çıkana veya silinmesini talep edene kadar saklanır. Kurulum talebi bilgileriniz,
        talebin oluşturulmasından itibaren en fazla 2 yıl saklanır ve bu sürenin sonunda silinir veya anonim hale
        getirilir. İş ortaklığı başvuruları, anlaşma yapılmazsa başvuru tarihinden itibaren en fazla 2 yıl saklanır;
        anlaşma yapılırsa sözleşme süresince ve ilgili mevzuattaki saklama süreleri boyunca tutulur. İş ortaklığı
        başvuru bilgileri üçüncü kişilere aktarılmaz; yalnızca yukarıda sayılan hizmet sağlayıcıların sunucularında
        saklanır. [Hukuki kontrol: saklama süreleri netleştirilmeli.]
      </p>
      <h2>6. Haklarınız</h2>
      <p>
        KVKK m. 11 uyarınca; verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini
        isteme, işlemeye itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz. Başvurularınızı {ILETISIM}{' '}
        adresine iletebilirsiniz.
      </p>
      <p>
        Ayrıca bkz. <Link to="/gizlilik">Gizlilik Politikası</Link> ve <Link to="/cerezler">Çerez Bilgilendirmesi</Link>.
      </p>
    </LegalLayout>
  );
}

export function PrivacyPage() {
  const t = useT();
  return (
    <LegalLayout title={t.alt.gizlilik} yalnizTurkce={useDil() !== 'tr'}>
      <p>
        CargeWay, Türkiye'deki elektrikli araç şarj istasyonlarını tek haritada gösteren bağımsız bir bilgi platformudur.
        CargeWay bir şarj operatörü değildir; sitede ödeme alınmaz ve kullanıcı hesabı oluşturulmaz.
      </p>
      <h2>Topladığımız bilgiler</h2>
      <ul>
        <li>Bülten formuna kendi isteğinizle yazdığınız e-posta adresi.</li>
        <li>
          "Teklif al" formuna yazdığınız iletişim, konum ve kurulum bilgileri (onayınızla anlaşmalı kurulum firmalarına
          iletilir).
        </li>
        <li>Kurulum firmalarının "İş Ortağımız Olun" formuna yazdığı firma ve iletişim bilgileri.</li>
        <li>Barındırma sağlayıcısının tuttuğu standart erişim kayıtları.</li>
      </ul>
      <h2>Toplamadığımız bilgiler</h2>
      <ul>
        <li>Konumunuz sunucularımıza gönderilmez; yalnızca tarayıcınızda haritayı ortalamak için kullanılır.</li>
        <li>Şu anda reklam veya analiz amaçlı izleme araçları kullanılmamaktadır.</li>
      </ul>
      <h2>Üçüncü taraf bağlantılar</h2>
      <p>
        Haberler ve "Yol tarifi" bağlantıları sizi üçüncü taraf sitelere (haber kaynakları, Google Haritalar vb.) götürür. Bu
        sitelerin gizlilik uygulamalarından CargeWay sorumlu değildir.
      </p>
      <h2>İstasyon bilgileri</h2>
      <p>
        Haritadaki istasyon bilgileri bilgilendirme amaçlıdır; doğruluğu ve güncelliği garanti edilmez. Yola çıkmadan önce
        operatörün kendi uygulamasından kontrol etmenizi öneririz.
      </p>
      <h2>İletişim</h2>
      <p>
        Sorularınız için: {ILETISIM}. Kişisel verilerinize ilişkin ayrıntılar için{' '}
        <Link to="/kvkk">KVKK Aydınlatma Metni</Link>'ni inceleyin.
      </p>
    </LegalLayout>
  );
}

export function CookiesPage() {
  const t = useT();
  return (
    <LegalLayout title={t.alt.cerezler} yalnizTurkce={useDil() !== 'tr'}>
      <p>
        CargeWay şu anda reklam, pazarlama veya analiz amaçlı çerez kullanmamaktadır. Bu nedenle sitede çerez onay
        penceresi gösterilmemektedir.
      </p>
      <h2>Zorunlu teknik depolama</h2>
      <p>
        Sitenin çalışması için tarayıcınızın yerel depolama alanı (localStorage) sınırlı ölçüde kullanılabilir (ör. ileride
        eklenecek oturum bilgisi). Bu veriler cihazınızda kalır.
      </p>
      <h2>Üçüncü taraf içerikler</h2>
      <p>
        Harita görselleri CARTO sunucularından yüklenir; bu sırada IP adresiniz ve tarayıcı bilgileriniz bu sağlayıcıya
        iletilir.
      </p>
      <h2>Değişiklikler</h2>
      <p>
        İleride analiz veya benzeri çerezler eklenirse, bu sayfa güncellenecek ve gerekli durumlarda açık rızanız
        istenecektir.
      </p>
    </LegalLayout>
  );
}

export function ContactPage() {
  const dil = useDil();
  if (dil !== 'tr') return <ContactIntl dil={dil} />;
  return (
    <LegalLayout title="İletişim ve Künye">
      <p>
        CargeWay, Türkiye'deki elektrikli araç şarj istasyonlarını tek haritada gösteren bağımsız bir bilgi platformudur.
        Bir şarj operatörü değildir; sitede ödeme alınmaz.
      </p>
      <h2>Tanıtıcı bilgiler</h2>
      <ul>
        <li>
          <strong>Site sahibi / içerik sağlayıcı:</strong> {KUNYE.siteSahibi}
        </li>
        <li>
          <strong>Adres:</strong> {KUNYE.adres}
        </li>
        <li>
          <strong>E-posta:</strong>{' '}
          {KUNYE.eposta.includes('[') ? KUNYE.eposta : <a href={`mailto:${KUNYE.eposta}`}>{KUNYE.eposta}</a>}
        </li>
        {KUNYE.sicil && (
          <li>
            <strong>Sicil / vergi no:</strong> {KUNYE.sicil}
          </li>
        )}
        <li>
          <strong>Yer sağlayıcı:</strong> {KUNYE.yerSaglayici}
        </li>
      </ul>
      <h2>İstasyon bilgileri hakkında</h2>
      <p>
        Haritadaki istasyon, soket, güç ve erişim bilgileri bilgilendirme amaçlıdır; doğruluğu, güncelliği ve istasyonun
        çalışır durumda olduğu garanti edilmez. Yola çıkmadan önce operatörün kendi uygulamasından kontrol edin. Hatalı bir
        bilgi görürseniz yukarıdaki e-posta adresinden bize bildirebilirsiniz.
      </p>
      <p>
        Kişisel verilerinize ilişkin bilgi için <Link to="/kvkk">KVKK Aydınlatma Metni</Link>'ni inceleyin.
      </p>
    </LegalLayout>
  );
}

/* ------------------------------------------------------------------ */
/* İngilizce ve Azerbaycanca sürümler (TASLAK — hukuki kontrol gerekli) */
/* ------------------------------------------------------------------ */

const eposta = () =>
  KUNYE.eposta.includes('[') ? KUNYE.eposta : <a href={`mailto:${KUNYE.eposta}`}>{KUNYE.eposta}</a>;

function PrivacyNoticeIntl({ dil }: { dil: 'en' | 'az' }) {
  if (dil === 'az') {
    return (
      <LegalLayout title="Məxfilik bildirişi">
        <p>
          Bu bildiriş cargeway.com ("CargeWay") saytından istifadə edən şəxslərə fərdi məlumatlarının necə işləndiyini
          izah edir. Türkiyədəki istifadəçilər üçün Türkiyə Respublikasının 6698 saylı Fərdi Məlumatların Qorunması
          Qanunu (KVKK), Azərbaycandakı istifadəçilər üçün isə "Fərdi məlumatlar haqqında" Azərbaycan Respublikasının
          Qanunu tətbiq olunur.
        </p>
        <h2>1. Məlumatlara cavabdeh şəxs</h2>
        <p>
          {VERI_SORUMLUSU}. Əlaqə: {eposta()}.
        </p>
        <h2>2. Hansı məlumatları və nə üçün işləyirik</h2>
        <ul>
          <li>
            <strong>E-poçt ünvanı:</strong> açılış barədə bildiriş formasını doldurub razılıq qutusunu işarələsəniz, sizə
            CargeWay haqqında elan göndərmək üçün. Razılığınızı istənilən vaxt geri götürə bilərsiniz.
          </li>
          <li>
            <strong>Şarj qurğusu üçün təklif sorğusu:</strong> ad və soyad, telefon, (istəyə bağlı) e-poçt, ölkə,
            şəhər/rayon, məkan və dayanacaq məlumatları, avtomobil modeli və qeydiniz; təklif hazırlanması və sizinlə
            əlaqə saxlanılması üçün.
          </li>
          <li>
            <strong>Məkan:</strong> "Məkanımdan istifadə et" funksiyasında brauzerinizin paylaşdığı məkan yalnız cihazınızda
            xəritəni mərkəzləşdirmək üçün istifadə olunur; serverlərimizə göndərilmir.
          </li>
          <li>
            <strong>Texniki qeydlər:</strong> IP ünvanı, brauzer məlumatı və giriş vaxtı saytın təhlükəsiz təqdim olunması
            üçün hostinq provayderi tərəfindən saxlanıla bilər.
          </li>
        </ul>
        <h2>3. Hüquqi əsas</h2>
        <p>E-poçt ünvanınız və təklif sorğusu məlumatlarınız açıq razılığınız əsasında işlənir.</p>
        <h2>4. Ötürülmə</h2>
        <p>
          Formada ayrıca razılıq verdiyiniz halda sorğu məlumatlarınız təklif hazırlamaq və sizinlə əlaqə saxlamaq üçün
          ölkənizdə və bölgənizdə xidmət göstərən tərəfdaş quraşdırıcılara ötürülür. Xidmətin təqdimatı üçün verilənlər
          bazası (Supabase), hostinq (Vercel) və xəritə (CARTO / OpenStreetMap) provayderlərindən istifadə olunur; onların
          serverləri xaricdə yerləşə bilər.
        </p>
        <h2>5. Saxlama müddəti</h2>
        <p>
          E-poçt ünvanınız abunəlikdən çıxana və ya silinməsini istəyənə qədər, təklif sorğusu məlumatlarınız isə ən çox 2
          il saxlanılır.
        </p>
        <h2>6. Hüquqlarınız</h2>
        <p>
          Məlumatlarınızın işlənib-işlənmədiyini öyrənmək, onlara çıxış, düzəliş və ya silinmə tələb etmək, işlənməyə etiraz
          etmək və razılığınızı geri götürmək hüququnuz var. Müraciətlərinizi {eposta()} ünvanına göndərə bilərsiniz.
        </p>
        <p>
          Türk dilində tam mətn: <Link to="/kvkk">KVKK Aydınlatma Metni</Link> (Türkiyə versiyası).
        </p>
      </LegalLayout>
    );
  }
  return (
    <LegalLayout title="Privacy Notice">
      <p>
        This notice explains how personal data of people using cargeway.com ("CargeWay") is processed. For users in
        Türkiye the Turkish Personal Data Protection Law No. 6698 (KVKK) applies; for users in Azerbaijan the Law of the
        Republic of Azerbaijan on Personal Data applies.
      </p>
      <h2>1. Data controller</h2>
      <p>
        {VERI_SORUMLUSU}. Contact: {eposta()}.
      </p>
      <h2>2. What we process and why</h2>
      <ul>
        <li>
          <strong>Email address:</strong> if you fill in the launch notification form and tick the consent box, to send you
          announcements about CargeWay. You can withdraw your consent at any time.
        </li>
        <li>
          <strong>Charger installation quote request:</strong> full name, phone, (optional) email, country, city/district,
          property and parking details, car model and your note; to prepare a quote and contact you.
        </li>
        <li>
          <strong>Location:</strong> when you use "Use my location", the location shared by your browser is used only on your
          device to centre the map; it is not sent to our servers.
        </li>
        <li>
          <strong>Technical logs:</strong> IP address, browser information and access time may be kept by the hosting
          provider to serve the site securely.
        </li>
      </ul>
      <h2>3. Legal basis</h2>
      <p>Your email address and quote request details are processed on the basis of your explicit consent.</p>
      <h2>4. Transfers</h2>
      <p>
        If you give separate consent in the form, your request details are passed to partner installers serving your
        country and area so they can prepare a quote and contact you. We use providers for the database (Supabase),
        hosting (Vercel) and maps (CARTO / OpenStreetMap), whose servers may be located abroad.
      </p>
      <h2>5. Retention</h2>
      <p>
        Your email address is kept until you unsubscribe or ask us to delete it; quote request details are kept for at most
        2 years.
      </p>
      <h2>6. Your rights</h2>
      <p>
        You have the right to learn whether your data is processed, to access, correct or delete it, to object to
        processing and to withdraw consent. Send requests to {eposta()}.
      </p>
      <p>
        Full Turkish text: <Link to="/kvkk">KVKK Aydınlatma Metni</Link> (Türkiye version).
      </p>
    </LegalLayout>
  );
}

function ContactIntl({ dil }: { dil: 'en' | 'az' }) {
  const az = dil === 'az';
  return (
    <LegalLayout title={az ? 'Əlaqə və rekvizitlər' : 'Contact & Imprint'}>
      <p>
        {az
          ? 'CargeWay elektromobil şarj stansiyalarını bir xəritədə göstərən və evdə şarj qurğusu üçün quraşdırıcılarla əlaqə yaradan müstəqil məlumat platformasıdır. Şarj operatoru deyil; saytda ödəniş qəbul edilmir.'
          : 'CargeWay is an independent information platform that shows EV charging stations on one map and connects people with installers for home chargers. It is not a charging operator and takes no payments on the site.'}
      </p>
      <ul>
        <li>
          <strong>{az ? 'Sayt sahibi:' : 'Site owner:'}</strong> {KUNYE.siteSahibi}
        </li>
        <li>
          <strong>{az ? 'Ünvan:' : 'Address:'}</strong> {KUNYE.adres}
        </li>
        <li>
          <strong>{az ? 'E-poçt:' : 'Email:'}</strong> {eposta()}
        </li>
        <li>
          <strong>{az ? 'Hostinq provayderi:' : 'Hosting provider:'}</strong> {KUNYE.yerSaglayici}
        </li>
      </ul>
      <p>
        {az ? 'Fərdi məlumatlar barədə: ' : 'About personal data: '}
        <Link to="/kvkk">{az ? 'Məxfilik bildirişi' : 'Privacy Notice'}</Link>.
      </p>
    </LegalLayout>
  );
}
