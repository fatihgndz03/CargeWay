import { ArrowRight, Clock, Tag } from 'lucide-react';

const newsItems = [
  {
    id: 1,
    category: 'Altyapı',
    title: 'Türkiye\'de Hızlı Şarj Ağı 2025\'te İki Katına Çıkacak',
    excerpt: 'Enerji Bakanlığı\'nın yeni yatırım planı kapsamında Türkiye genelinde 6.000 yeni hızlı şarj noktası kurulacak. Proje, otoyollar ve şehir merkezlerini kapsıyor.',
    date: '8 Nisan 2025',
    readTime: '4 dk',
    image: 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: true,
  },
  {
    id: 2,
    category: 'Araçlar',
    title: 'TOGG T10X Avrupa Satışları Başlıyor',
    excerpt: 'Türkiye\'nin yerli elektrikli otomobil TOGG, T10X modeliyle Almanya ve Fransa\'da satışa sunuluyor. Avrupa versiyonunda 600 km menzil sunuluyor.',
    date: '6 Nisan 2025',
    readTime: '3 dk',
    image: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: false,
  },
  {
    id: 3,
    category: 'Teknoloji',
    title: 'V2G Teknolojisi: Araçlar Artık Şebekeye Enerji Verecek',
    excerpt: 'Araçtan Şebekeye (V2G) teknolojisi pilot projelerle Türkiye\'de hayata geçiyor. EV sahipleri fazla enerjiyi şebekeye satarak gelir elde edebilecek.',
    date: '4 Nisan 2025',
    readTime: '5 dk',
    image: 'https://images.pexels.com/photos/9800007/pexels-photo-9800007.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: false,
  },
  {
    id: 4,
    category: 'Teşvik',
    title: 'EV Alımlarında ÖTV Muafiyeti Uzatıldı',
    excerpt: '2025 yılı sonuna kadar geçerli olan ÖTV muafiyeti, elektrikli araç satışlarını ciddi ölçüde artırdı. Hükümet teşvik süresini uzatma kararı aldı.',
    date: '2 Nisan 2025',
    readTime: '3 dk',
    image: 'https://images.pexels.com/photos/7413915/pexels-photo-7413915.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: false,
  },
];

const categoryColors: Record<string, string> = {
  'Altyapı': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Araçlar': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Teknoloji': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Teşvik': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

export default function News() {
  const featured = newsItems[0];
  const rest = newsItems.slice(1);

  return (
    <section id="haberler" className="bg-black py-24 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">Son Haberler</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">EV Dünyasından<br />Güncel Gelişmeler</h2>
          </div>
          <a
            href="#"
            className="hidden sm:inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold transition-colors group"
          >
            Tüm Haberler
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 group cursor-pointer">
            <div className="relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 hover:border-green-500/30 transition-all duration-300 h-full">
              <div className="relative h-72 sm:h-80 overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${categoryColors[featured.category]}`}>
                    <Tag className="w-3 h-3" />
                    {featured.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors leading-snug">
                  {featured.title}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-5 text-sm sm:text-base">{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {featured.date}
                    </span>
                    <span>{featured.readTime} okuma</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-green-500 text-sm font-semibold group-hover:gap-2 transition-all">
                    Devamını Oku <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {rest.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer flex gap-4 p-4 bg-gray-900 border border-gray-800 hover:border-green-500/30 rounded-2xl transition-all duration-300"
              >
                <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col justify-between min-w-0">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${categoryColors[item.category]} mb-2`}>
                      {item.category}
                    </span>
                    <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-green-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.date}
                    </span>
                    <span>{item.readTime} okuma</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 sm:hidden text-center">
          <a href="#" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold transition-colors">
            Tüm Haberler <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
