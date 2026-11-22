import { Navigation, Search, SlidersHorizontal } from 'lucide-react';
import { useT } from '../i18n';

const ICONS = [Search, SlidersHorizontal, Navigation];


export default function HowItWorks() {
  const t = useT();
  const steps = t.nasil.adimlar.map((a, i) => ({ icon: ICONS[i], title: a.baslik, text: a.metin }));
  return (
    <section id="nasil-calisir" className="bg-black py-24 border-t border-gray-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">{t.nasil.ust}</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3">{t.nasil.baslik}</h2>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative p-8 bg-gray-900 border border-gray-800 rounded-2xl">
              <span className="absolute top-6 right-6 text-5xl font-black text-green-500/15">{i + 1}</span>
              <div className="w-12 h-12 mb-5 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Icon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
