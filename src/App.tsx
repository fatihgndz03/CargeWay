import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import News from './components/News';
import Vehicles from './components/Vehicles';
import WhyCargeWay from './components/WhyCargeWay';
import MapTeaser from './components/MapTeaser';
import Footer from './components/Footer';
import ComingSoon from './components/ComingSoon';
import MapPage from './pages/Map';
import { SHOW_COMING_SOON } from './lib/config';

function Home() {
  return (
    <div className="bg-black min-h-screen">
      <Header />
      <Hero />
      <News />
      <Vehicles />
      <WhyCargeWay />
      <MapTeaser />
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
      {/* Eski yazım hatalı adres */}
      <Route path="/sarcj-haritasi" element={<Navigate to="/sarj-haritasi" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
