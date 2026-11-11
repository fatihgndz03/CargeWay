import { Clock, MessageSquare, Activity, Users } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Tüm Ağlar Tek Haritada',
    description: 'Farklı şarj operatörlerinin istasyonlarını tek bir haritada görün; soket tipi, güç ve konum bilgilerini karşılaştırın.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Kullanıcı Yorumları',
    description: 'Yakında: kullanıcılar istasyonlar hakkındaki deneyimlerini paylaşabilecek ve istasyonun çalışıp çalışmadığını bildirebilecek.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Activity,
    title: 'Şarj Takibi',
    description: 'Yakında: aracınıza göre şarj süresi ve maliyet hesaplayıcı ile yolculuğunuzu planlayın.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  {
    icon: Users,
    title: 'Topluluk',
    description: 'Yakında: diğer elektrikli araç sahipleriyle deneyim paylaşın ve en iyi şarj noktalarını birlikte keşfedin.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
];

export default function WhyCargeWay() {
  return (
    <section id="neden-cargeway" className="bg-black py-24 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">Avantajlar</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            Neden <span className="text-green-500">CargeWay?</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            CargeWay'i diğer platformlardan ayıran özellikler ve sunduğu avantajlar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group relative p-8 bg-gray-900 border ${feature.border} rounded-2xl hover:bg-gray-800/80 transition-all duration-300 overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${feature.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-8 translate-x-8`} />

                <div className={`w-14 h-14 ${feature.bg} border ${feature.border} rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`w-7 h-7 ${feature.color}`} />
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>

                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent ${feature.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
