import Logo from './Logo';
import EmailForm from './EmailForm';
import { Link } from '../DilLink';
import DilSecici from '../DilSecici';
import { useT } from '../../i18n';

export default function ComingSoon() {
  const t = useT();
  const y = t.yakinda;
  return (
    <div className="relative min-h-screen bg-[#080808] flex flex-col items-center justify-center overflow-hidden px-6 py-12">
      <GridBackground />
      <GlowOrbs />

      <DilSecici className="absolute top-5 right-5 z-20" />

      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-xl text-center">
        <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
          <Logo />
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-green-400 text-xs font-medium tracking-widest uppercase">{y.rozet}</span>
          </div>

          <h2 className="text-6xl sm:text-7xl font-black text-white tracking-tight leading-none">
            {y.baslik1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">{y.baslik2}</span>
          </h2>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-sm">
            {y.satir1a} <span className="text-white font-semibold">{y.satir1b}</span> {y.satir1c}
            <br />
            <span className="text-zinc-500 text-sm">{y.satir2}</span>
          </p>
        </div>

        <div className="w-full border-t border-zinc-800/60" />

        <div className="animate-fade-in w-full flex flex-col items-center gap-8" style={{ animationDelay: '450ms' }}>
          <EmailForm />
        </div>
      </div>

      <footer className="relative z-10 mt-14 text-center">
        <nav className="mb-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-500">
          <Link to="/iletisim" className="hover:text-green-400">{t.alt.iletisim}</Link>
          <Link to="/kvkk" className="hover:text-green-400">{t.alt.kvkk}</Link>
          <Link to="/gizlilik" className="hover:text-green-400">{t.alt.gizlilik}</Link>
          <Link to="/cerezler" className="hover:text-green-400">{t.alt.cerezler}</Link>
        </nav>
        <p className="text-zinc-700 text-xs tracking-wide">
          © 2026 CargeWay. {t.ortak.telif}
        </p>
      </footer>
    </div>
  );
}

function GridBackground() {
  return (
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(34, 197, 94, 1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 197, 94, 1) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  );
}

function GlowOrbs() {
  return (
    <>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-green-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-green-600/8 blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-56 h-56 rounded-full bg-green-400/5 blur-[80px] pointer-events-none" />
    </>
  );
}
