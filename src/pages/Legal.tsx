import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

/**
 * TASLAK hukuki metinler. Yayından önce bir hukukçu tarafından kontrol edilmeli
 * ve köşeli parantez içindeki alanlar ([...]) doldurulmalıdır.
 */
const SON_GUNCELLEME = '11 Kasım 2026';

function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => {
    document.title = `${title} — CargeWay`;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="bg-black min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-gray-300">
        <p className="mb-6 inline-block rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-400">
          Taslak metin — hukuki kontrol sonrası kesinleşecektir.
        </p>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-10">Son güncelleme: {SON_GUNCELLEME}</p>
        <div className="space-y-6 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:pt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-green-400 [&_a:hover]:underline">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

const VERI_SORUMLUSU = '[Veri sorumlusunun adı/unvanı ve adresi]';
const ILETISIM = '[iletişim e-posta adresi]';

export function KvkkPage() {
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
          <strong>E-posta adresi:</strong> Bülten / lansman bildirimi formunu doldurmanız halinde, size CargeWay hakkında
          duyuru göndermek amacıyla.
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
        E-posta adresiniz açık rızanıza (KVKK m. 5/1) dayanılarak; teknik kayıtlar ise veri sorumlusunun meşru menfaati
        (KVKK m. 5/2-f) ve hukuki yükümlülükler (KVKK m. 5/2-ç) kapsamında işlenir.
      </p>
      <h2>4. Aktarım</h2>
      <p>
        Hizmetin sunulması için şu hizmet sağlayıcılardan yararlanılmaktadır: veritabanı (Supabase), barındırma (Netlify),
        harita altlığı (CARTO / OpenStreetMap) ve adres arama (OpenStreetMap Nominatim). Bu sağlayıcıların sunucuları yurt
        dışında bulunabilir; yurt dışına aktarım KVKK m. 9 hükümlerine uygun olarak yapılır. [Hukuki kontrol: aktarım
        dayanağı netleştirilmeli.]
      </p>
      <h2>5. Saklama süresi</h2>
      <p>
        E-posta adresiniz, abonelikten çıkana veya silinmesini talep edene kadar saklanır. [Diğer süreler netleştirilmeli.]
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
  return (
    <LegalLayout title="Gizlilik Politikası">
      <p>
        CargeWay, Türkiye'deki elektrikli araç şarj istasyonlarını tek haritada gösteren bağımsız bir bilgi platformudur.
        CargeWay bir şarj operatörü değildir; sitede ödeme alınmaz ve kullanıcı hesabı oluşturulmaz.
      </p>
      <h2>Topladığımız bilgiler</h2>
      <ul>
        <li>Bülten formuna kendi isteğinizle yazdığınız e-posta adresi.</li>
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
  return (
    <LegalLayout title="Çerez Bilgilendirmesi">
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
