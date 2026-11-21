import type { ReactNode } from 'react';

/** Teklif ve başvuru formlarında ortak kullanılan alan bileşenleri. */
export const inputCls =
  'w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500/70 focus:ring-1 focus:ring-green-500/30';

export function Alan({ etiket, ipucu, children }: { etiket: string; ipucu?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-200 mb-1.5">{etiket}</span>
      {children}
      {ipucu && <span className="block text-xs text-gray-500 mt-1">{ipucu}</span>}
    </label>
  );
}

export function Secenekler<T extends string>({
  secenekler,
  deger,
  onSec,
}: {
  secenekler: { id: T; ad: string }[];
  deger: T | '';
  onSec: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {secenekler.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSec(s.id)}
          aria-pressed={deger === s.id}
          className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors ${
            deger === s.id
              ? 'bg-green-500 text-black border-green-500'
              : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-green-500/50'
          }`}
        >
          {s.ad}
        </button>
      ))}
    </div>
  );
}
