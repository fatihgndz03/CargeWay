import { Link } from '../components/DilLink';
import { Home, MapPin } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSeo } from '../lib/seo';
import { useT } from '../i18n';

export default function NotFoundPage() {
  const t = useT();
  const b = t.bulunamadi;
  useSeo(b.seo, undefined, { noindex: true });

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 pt-32 pb-24">
        <div className="max-w-md text-center">
          <p className="text-6xl font-black text-green-500 mb-4">404</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{b.baslik}</h1>
          <p className="text-gray-400 mb-8">
            {b.metin}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/sarj-haritasi"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-black hover:bg-green-400"
            >
              <MapPin className="h-4 w-4" /> {b.harita}
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 px-5 py-3 text-sm font-semibold text-gray-200 hover:border-green-500 hover:text-green-400"
            >
              <Home className="h-4 w-4" /> {b.ana}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
