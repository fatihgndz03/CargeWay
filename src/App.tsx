import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import News from './components/News';
import Vehicles from './components/Vehicles';
import WhyCargeWay from './components/WhyCargeWay';
import MapTeaser from './components/MapTeaser';
import Footer from './components/Footer';
import InstallCta from './components/InstallCta';
import HowItWorks from './components/HowItWorks';
import { SHOW_COMING_SOON } from './lib/config';
import { DILLER, adrestenDil, useDil, useT, useYol, yol, type Dil } from './i18n';
import DilSaglayici from './i18n/DilSaglayici';
import { applyCanonical, applyAlternates, useSeo } from './lib/seo';

// Harita (Leaflet) ve alt sayfalar ayrı dosyalara bölünür; ana sayfa daha hızlı açılır.
const ComingSoon = lazy(() => import('./components/ComingSoon'));
const MapPage = lazy(() => import('./pages/Map'));
const StationDetailPage = lazy(() => import('./pages/StationDetail'));
const GuidesIndexPage = lazy(() => import('./pages/Guides').then((m) => ({ default: m.GuidesIndexPage })));
const GuidePage = lazy(() => import('./pages/Guides').then((m) => ({ default: m.GuidePage })));
const ProductsPage = lazy(() => import('./pages/Products'));
const InstallationPage = lazy(() => import('./pages/Installation'));
const PartnerPage = lazy(() => import('./pages/Partner'));
const VehiclesPage = lazy(() => import('./pages/Vehicles'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));
// Deneme: temsili 3D araç (three.js yalnızca bu sayfada yüklenir; noindex, menüde/sitemap'te yok)
const Arac3dDenemePage = lazy(() => import('./pages/Arac3dDeneme'));
const KvkkPage = lazy(() => import('./pages/Legal').then((m) => ({ default: m.KvkkPage })));
const PrivacyPage = lazy(() => import('./pages/Legal').then((m) => ({ default: m.PrivacyPage })));
const ContactPage = lazy(() => import('./pages/Legal').then((m) => ({ default: m.ContactPage })));
const CookiesPage = lazy(() => import('./pages/Legal').then((m) => ({ default: m.CookiesPage })));

/** Adres değişince canonical etiketini günceller ve (bölüm bağlantısı değilse) sayfanın başına döner. */
function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const { dil, yol: ic } = adrestenDil(pathname);
    document.documentElement.lang = dil;
    applyCanonical(pathname);
    applyAlternates(DILLER.map((d) => ({ hreflang: d.hreflang, path: yol(ic, d.kod) })), yol(ic, 'tr'));
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function PageLoading() {
  const t = useT();
  return (
    <div className="bg-black min-h-screen flex items-center justify-center" role="status" aria-live="polite">
      <div className="h-10 w-10 rounded-full border-2 border-gray-800 border-t-green-500 animate-spin" />
      <span className="sr-only">{t.ortak.yukleniyor}</span>
    </div>
  );
}

function Home() {
  const { hash } = useLocation();
  const t = useT();
  const dil = useDil();
  useSeo(t.seo.anaBaslik, t.seo.anaAciklama);
  // Başka bir sayfadan /#bolum bağlantısıyla gelindiğinde ilgili bölüme kaydır
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el) el.scrollIntoView();
  }, [hash]);

  return (
    // overflow-x-clip: dekoratif bulanık daireler mobilde yatay kaydırma yaratmasın
    <div className="bg-black min-h-screen overflow-x-clip">
      <Header />
      <Hero />
      <MapTeaser />
      <HowItWorks />
      <InstallCta />
      {/* Haberler Türkiye kaynaklı ve Türkçe; EN/AZ sürümünde gösterilmez */}
      {dil === 'tr' && <News />}
      <Vehicles />
      <WhyCargeWay />
      <Footer />
    </div>
  );
}

function MapRoute() {
  useSeo(
    'Şarj Haritası — Türkiye EV şarj istasyonları | CargeWay',
    "Türkiye'deki elektrikli araç şarj istasyonlarını haritada bulun; AC/DC, güç, soket tipi ve operatöre göre filtreleyin."
  );
  return (
    <>
      <Header />
      <MapPage />
    </>
  );
}

/** Bir dilin tüm sayfaları. Türkçe önek olmadan, İngilizce /en, Azerbaycanca /az altında sunulur. */
function DilSayfalari({ dil }: { dil: Dil }) {
  return (
    <DilSaglayici dil={dil}>
      <Suspense fallback={<PageLoading />}>
        <RouteEffects />
        {SHOW_COMING_SOON ? (
          // Bakım modunda da yasal sayfalara ve iletişim/künyeye erişilebilmeli.
          <Routes>
            <Route path="kvkk" element={<KvkkPage />} />
            <Route path="gizlilik" element={<PrivacyPage />} />
            <Route path="cerezler" element={<CookiesPage />} />
            <Route path="iletisim" element={<ContactPage />} />
            <Route path="*" element={<ComingSoon />} />
          </Routes>
        ) : (
          <Routes>
            <Route index element={<Home />} />
            <Route path="sarj-haritasi" element={<MapRoute />} />
            <Route path="istasyon/:slug" element={<StationDetailPage />} />
            <Route path="araclar" element={<VehiclesPage />} />
            <Route path="sarj-unitesi-kurulumu" element={<InstallationPage />} />
            <Route path="is-ortagi-ol" element={<PartnerPage />} />
            <Route path="rehber" element={<GuidesIndexPage />} />
            <Route path="rehber/:slug" element={<GuidePage />} />
            <Route path="urunler" element={<ProductsPage />} />
            <Route path="kvkk" element={<KvkkPage />} />
            <Route path="gizlilik" element={<PrivacyPage />} />
            <Route path="cerezler" element={<CookiesPage />} />
            <Route path="iletisim" element={<ContactPage />} />
            <Route path="deneme/arac-3d" element={<Arac3dDenemePage />} />
            {/* Eski yazım hatalı adres */}
            <Route path="sarcj-haritasi" element={<EskiHaritaYonlendir />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        )}
      </Suspense>
    </DilSaglayici>
  );
}

function EskiHaritaYonlendir() {
  const lp = useYol();
  return <Navigate to={lp('/sarj-haritasi')} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/en/*" element={<DilSayfalari dil="en" />} />
      <Route path="/az/*" element={<DilSayfalari dil="az" />} />
      <Route path="/*" element={<DilSayfalari dil="tr" />} />
    </Routes>
  );
}

export default App;
