import { useEffect, useRef, useState } from 'react';
import { Zap, MapPin, Car, TrendingUp } from 'lucide-react';

const stats = [
  {
    icon: MapPin,
    value: 12000,
    suffix: '+',
    label: 'Şarj Noktası',
    description: 'Türkiye genelinde aktif şarj noktası',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  {
    icon: Zap,
    value: 81,
    suffix: '',
    label: 'İlde Hizmet',
    description: 'Türkiye\'nin 81 ilinde tam kapsama',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Car,
    value: 500,
    suffix: 'K+',
    label: 'Aktif Kullanıcı',
    description: 'Platforma kayıtlı EV kullanıcısı',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  {
    icon: TrendingUp,
    value: 2400,
    suffix: '+',
    label: 'Günlük Şarj',
    description: 'Platform üzerinden gerçekleşen günlük şarj',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  {
    icon: Car,
    value: 156,
    suffix: '+',
    label: 'EV Model Sayısı',
    description: 'Platformda kayıtlı elektrikli araç modeli',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
];

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);

  return count;
}

function StatCard({ stat, index, animate }: { stat: typeof stats[0]; index: number; animate: boolean }) {
  const count = useCountUp(stat.value, 2000 + index * 200, animate);
  const Icon = stat.icon;

  return (
    <div className={`relative p-8 bg-gray-900 border ${stat.border} rounded-2xl hover:bg-gray-800/80 transition-all duration-300 group overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-8 translate-x-8`} />

      <div className={`w-14 h-14 ${stat.bg} border ${stat.border} rounded-2xl flex items-center justify-center mb-6`}>
        <Icon className={`w-7 h-7 ${stat.color}`} />
      </div>

      <div className={`text-5xl font-black ${stat.color} mb-2`}>
        {count.toLocaleString('tr-TR')}{stat.suffix}
      </div>
      <div className="text-xl font-bold text-white mb-2">{stat.label}</div>
      <p className="text-sm text-gray-500 leading-relaxed">{stat.description}</p>
    </div>
  );
}

export default function Stats() {
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-black py-24 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">Rakamlarla CargeWay</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            Türkiye'nin En Büyük<br />EV Şarj Ekosistemi
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Binlerce kullanıcı ve şarj noktasıyla Türkiye'nin elektrikli mobilite dönüşümüne öncülük ediyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} animate={animate} />
          ))}
        </div>
      </div>
    </section>
  );
}
