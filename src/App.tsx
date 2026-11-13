import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import News from './components/News';
import Vehicles from './components/Vehicles';
import WhyCargeWay from './components/WhyCargeWay';
import MapTeaser from './components/MapTeaser';
import Footer from './components/Footer';
import HowItWorks from './components/HowItWorks';
import { SHOW_COMING_SOON } from './lib/config';
import { applyCanonical, DEFAULT_DESCRIPTION, DEFAULT_TITLE, useSeo } from './lib/seo';

// Harita (Leaflet) ve alt sayfalar ayrı dosyalara bölünür; ana sayfa daha hızlı açılır.
const ComingSoon = lazy(() => import('./components/ComingSoon'));
const MapPage = lazy(() => import('./pages/Map'));
const StationDetailPage = lazy(() => import('./pages/StationDetail'));
const VehiclesPage = lazy(() => import('./pages/Vehicles'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));
const KvkkPage = lazy(() => import('./pages/Legal').then((m) => ({ default: m.KvkkPage })));
const PrivacyPage = lazy(() => import('./pages/Legal').then((m) => ({ default: m.PrivacyPage })));
const ContactPage = lazy(() => import('./pages/Legal').then((m) => ({ default: m.ContactPage })));
const CookiesPage = lazy(() => import('./pages/Legal').then((m) => ({ default: m.CookiesPage })));

/** Adres değişince canonical etiketini günceller ve (bölüm bağlantısı değilse) sayfanın başına döner. */
function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    applyCanonical(pathname);
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function PageLoading() {
  return (
    <div className="bg-black min-h-screen flex items-center justify-center" role="status" aria-live="polite">
      <div className="h-10 w-10 rounded-full border-2 border-gray-800 border-t-green-500 animate-spin" />
      <span className="sr-only">Yükleniyor…</span>
    </div>
  );
}

function Home() {
  const { hash } = useLocation();
  useSeo(DEFAULT_TITLE, DEFAULT_DESCRIPTION);
  // Başka bir sayfadan /#bolum bağlantısıyla gelindiğinde ilgili bölüme kaydır
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el) el.scrollIntoView();
  }, [hash]);

  return (
    <div className="bg-black min-h-screen">
      <Header />
      <Hero />
      <MapTeaser />
      <HowItWorks />
      <News />
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

function App() {
  if (SHOW_COMING_SOON) {
    // Bakım modunda da yasal sayfalara ve iletişim/künyeye erişilebilmeli.
    return (
      <Suspense fallback={<PageLoading />}>
        <RouteEffects />
        <Routes>
          <Route path="/kvkk" element={<KvkkPage />} />
          <Route path="/gizlilik" element={<PrivacyPage />} />
          <Route path="/cerezler" element={<CookiesPage />} />
          <Route path="/iletisim" element={<ContactPage />} />
          <Route path="*" element={<ComingSoon />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sarj-haritasi" element={<MapRoute />} />
        <Route path="/istasyon/:slug" element={<StationDetailPage />} />
        <Route path="/araclar" element={<VehiclesPage />} />
        <Route path="/kvkk" element={<KvkkPage />} />
        <Route path="/gizlilik" element={<PrivacyPage />} />
        <Route path="/cerezler" element={<CookiesPage />} />
        <Route path="/iletisim" element={<ContactPage />} />
        {/* Eski yazım hatalı adres */}
        <Route path="/sarcj-haritasi" element={<Navigate to="/sarj-haritasi" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
