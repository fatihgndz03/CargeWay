import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import News from './components/News';
import Vehicles from './components/Vehicles';
import WhyCargeWay from './components/WhyCargeWay';
import MapTeaser from './components/MapTeaser';
import Footer from './components/Footer';
import ComingSoon from './components/ComingSoon';
import MapPage from './pages/Map';
import HowItWorks from './components/HowItWorks';
import { CookiesPage, KvkkPage, PrivacyPage } from './pages/Legal';
import { SHOW_COMING_SOON } from './lib/config';

function Home() {
  const { hash } = useLocation();
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
  return (
    <>
      <Header />
      <MapPage />
    </>
  );
}

function App() {
  if (SHOW_COMING_SOON) {
    return <ComingSoon />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sarj-haritasi" element={<MapRoute />} />
      <Route path="/kvkk" element={<KvkkPage />} />
      <Route path="/gizlilik" element={<PrivacyPage />} />
      <Route path="/cerezler" element={<CookiesPage />} />
      {/* Eski yazım hatalı adres */}
      <Route path="/sarcj-haritasi" element={<Navigate to="/sarj-haritasi" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
