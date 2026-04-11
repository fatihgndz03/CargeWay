import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import News from './components/News';
import Vehicles from './components/Vehicles';
import WhyCargeWay from './components/WhyCargeWay';
import MapTeaser from './components/MapTeaser';
import Footer from './components/Footer';
import MapPage from './pages/Map';

function Home() {
  return (
    <div className="bg-black min-h-screen">
      <Header />
      <Hero />
      <Stats />
      <News />
      <Vehicles />
      <WhyCargeWay />
      <MapTeaser />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sarcj-haritasi" element={<MapPage />} />
    </Routes>
  );
}

export default App;
