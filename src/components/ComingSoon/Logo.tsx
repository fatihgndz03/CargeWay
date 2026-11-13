import { Zap } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 blur-2xl scale-150" />
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 shadow-lg shadow-green-500/30">
          <Zap className="w-10 h-10 text-black fill-black" strokeWidth={2.5} />
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-widest text-white uppercase">
          Carge<span className="text-green-400">Way</span>
        </h1>
        <p className="text-xs tracking-[0.3em] text-zinc-500 uppercase mt-1">Elektrikli Araç Şarj Haritası</p>
      </div>
    </div>
  );
}
