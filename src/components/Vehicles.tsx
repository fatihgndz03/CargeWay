import { Battery, Gauge, Zap } from 'lucide-react';

const vehicles = [
  {
    name: 'TOGG T10X',
    brand: 'TOGG',
    range: '523 km',
    power: '476 HP',
    charge: '28 dk (0-80%)',
    image: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Yerli',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  {
    name: 'Model Y Long Range',
    brand: 'Tesla',
    range: '600 km',
    power: '514 HP',
    charge: '25 dk (0-80%)',
    image: 'https://images.pexels.com/photos/13861/IMG_3496bfevenson.jpg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Popüler',
    badgeColor: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  {
    name: 'ID.4 Pro',
    brand: 'Volkswagen',
    range: '520 km',
    power: '282 HP',
    charge: '35 dk (0-80%)',
    image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Yeni',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
];

export default function Vehicles() {
  return (
    <section id="araclar" className="bg-black py-24 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">Araçlar</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
              Popüler Elektrikli<br />Araçları Keşfedin
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.name}
              className="group cursor-pointer bg-gray-900 border border-gray-800 hover:border-green-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${vehicle.badgeColor}`}>
                  {vehicle.badge}
                </span>
              </div>

              <div className="p-6">
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{vehicle.brand}</div>
                <h3 className="text-xl font-bold text-white mb-5 group-hover:text-green-400 transition-colors">{vehicle.name}</h3>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: Battery, value: vehicle.range, label: 'Menzil' },
                    { icon: Gauge, value: vehicle.power, label: 'Güç' },
                    { icon: Zap, value: vehicle.charge, label: 'Şarj' },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="bg-black/40 rounded-xl p-3 text-center">
                      <Icon className="w-4 h-4 text-green-400 mx-auto mb-1" />
                      <div className="text-xs font-bold text-white leading-tight">{value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 bg-green-500/10 hover:bg-green-500 border border-green-500/20 hover:border-green-500 text-green-400 hover:text-black font-semibold rounded-xl transition-all duration-200 text-sm">
                  Detayları Gör
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
