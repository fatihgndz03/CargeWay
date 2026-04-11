import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'duplicate';

export default function EmailForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');

    const { error } = await supabase
      .from('email_subscribers')
      .insert({ email: email.trim().toLowerCase() });

    if (!error) {
      setStatus('success');
      setEmail('');
    } else if (error.code === '23505') {
      setStatus('duplicate');
    } else {
      setStatus('error');
    }

    if (error?.code !== '23505') {
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className="w-full max-w-md">
      <p className="text-center text-zinc-400 text-sm mb-4 tracking-wide">
        Lansman haberi almak için kayıt ol
      </p>

      {status === 'success' ? (
        <div className="flex items-center gap-3 justify-center bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-4 text-green-400">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Harika! Seni bilgilendireceğiz.</span>
        </div>
      ) : status === 'duplicate' ? (
        <div className="flex items-center gap-3 justify-center bg-zinc-800/60 border border-zinc-700 rounded-xl px-6 py-4 text-zinc-400">
          <CheckCircle className="w-5 h-5 shrink-0 text-green-500" />
          <span className="text-sm font-medium">Bu e-posta zaten kayıtlı.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@email.com"
            required
            disabled={status === 'loading'}
            className="w-full bg-zinc-900/80 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-5 py-4 pr-14 text-sm focus:outline-none focus:border-green-500/70 focus:ring-1 focus:ring-green-500/30 transition-all duration-200 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === 'loading' || !email.trim()}
            className="absolute right-2 flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-green-500/20 active:scale-95"
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 text-black animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-black" />
            )}
          </button>
        </form>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 mt-3 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Bir hata oluştu. Lütfen tekrar dene.</span>
        </div>
      )}
    </div>
  );
}
