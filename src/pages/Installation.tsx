import { useState } from 'react';
import { Link } from '../components/DilLink';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Factory,
  Home,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Wrench,
  FileText,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSeo } from '../lib/seo';
import { supabase } from '../lib/supabase';
import { ILLER } from '../data/iller';
import { AZ_SEHERLER } from '../data/azSeherler';
import { bicim, useDil, useT } from '../i18n';
import { Alan, Secenekler, inputCls } from '../components/FormParcalari';

/** Onay metni değişirse bu sürümü güncelleyin; talep kaydında saklanır. */
export const ONAY_METNI_SURUMU = '2026-11-19';

type MekanTipi = 'ev' | 'apartman-site' | 'isyeri-otopark';
type Ulke = 'TR' | 'AZ';
type Durum = 'form' | 'gonderiliyor' | 'basarili' | 'hata' | 'kapali';

export default function InstallationPage() {
  const t = useT();
  const dil = useDil();
  const k = t.kurulum;
  useSeo(k.seoBaslik, k.seoAciklama);

  const MEKANLAR: { id: MekanTipi; baslik: string; aciklama: string; icon: typeof Home }[] = [
    { id: 'ev', ...k.mekanlar.ev, icon: Home },
    { id: 'apartman-site', ...k.mekanlar.site, icon: Building2 },
    { id: 'isyeri-otopark', ...k.mekanlar.isyeri, icon: Factory },
  ];
  const OTOPARK = [
    { id: 'kapali', ad: k.otopark.kapali },
    { id: 'acik', ad: k.otopark.acik },
    { id: 'mustakil-garaj', ad: k.otopark.garaj },
    { id: 'bilinmiyor', ad: k.otopark.bilinmiyor },
  ];
  const MESAFE = [
    { id: '0-10', ad: k.mesafe.az10 },
    { id: '10-25', ad: k.mesafe.m10_25 },
    { id: '25-50', ad: k.mesafe.m25_50 },
    { id: '50+', ad: k.mesafe.fazla50 },
    { id: 'bilinmiyor', ad: k.mesafe.bilinmiyor },
  ];

  // Ülke varsayılanı dile göre: AZ sürümü Azerbaycan, diğerleri Türkiye
  const [ulke, setUlke] = useState<Ulke>(dil === 'az' ? 'AZ' : 'TR');
  const sehirler: readonly string[] = ulke === 'AZ' ? AZ_SEHERLER : ILLER;

  const [adim, setAdim] = useState(1);
  const [durum, setDurum] = useState<Durum>(supabase ? 'form' : 'kapali');

  const [mekan, setMekan] = useState<MekanTipi | ''>('');
  const [otopark, setOtopark] = useState<string>('');
  const [mesafe, setMesafe] = useState<string>('');
  const [unite, setUnite] = useState('');
  const [arac, setArac] = useState('');
  const [il, setIl] = useState('');
  const [ilce, setIlce] = useState('');
  const [ad, setAd] = useState('');
  const [telefon, setTelefon] = useState('');
  const [eposta, setEposta] = useState('');
  const [not, setNot] = useState('');
  const [yukYonetimi, setYukYonetimi] = useState(false);
  const [kvkk, setKvkk] = useState(false);
  const [paylasim, setPaylasim] = useState(false);
  const [hataMesaji, setHataMesaji] = useState('');

  const telefonGecerli = /^[0-9 +()-]{10,20}$/.test(telefon.trim());
  const epostaGecerli = !eposta.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(eposta.trim());
  const adim1Tamam = mekan !== '';
  const adim2Tamam = il !== '';
  const adim3Tamam = ad.trim().length >= 2 && telefonGecerli && epostaGecerli && kvkk && paylasim;

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adim3Tamam || !supabase || !mekan) return;
    setDurum('gonderiliyor');
    setHataMesaji('');
    const uniteSayi = parseInt(unite, 10);
    const { error } = await supabase.from('kurulum_talepleri').insert({
      mekan_tipi: mekan,
      otopark_tipi: otopark || null,
      tahmini_mesafe: mesafe || null,
      unite_sayisi: Number.isFinite(uniteSayi) && uniteSayi > 0 ? Math.min(uniteSayi, 200) : null,
      arac_modeli: arac.trim().slice(0, 80) || null,
      ulke,
      dil,
      il,
      ilce: ilce.trim().slice(0, 60) || null,
      ad: ad.trim().slice(0, 80),
      telefon: telefon.trim(),
      eposta: eposta.trim() || null,
      not_metni: not.trim().slice(0, 1000) || null,
      yuk_yonetimi_ilgi: yukYonetimi,
      kvkk_onay: kvkk,
      paylasim_onay: paylasim,
      onay_metni_surumu: ONAY_METNI_SURUMU,
    });
    if (error) {
      console.error('Talep gönderilemedi:', error.message);
      setDurum('hata');
      setHataMesaji(k.gonderHata);
      return;
    }
    setDurum('basarili');
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_minmax(0,32rem)] gap-x-12 gap-y-8 items-start">
          {/* Sol üst: başlık (mobilde formdan önce) */}
          <div className="lg:col-start-1 lg:row-start-1">
            <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">{k.ust}</span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mt-2 leading-tight">
              {k.baslik1}
              <br />
              <span className="text-green-500">{k.vurgu}</span> {k.baslik2}
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-xl">
              {k.giris}
            </p>
          </div>

          {/* Sol alt: açıklama maddeleri (mobilde formdan sonra) */}
          <div className="lg:col-start-1 lg:row-start-2 order-3 lg:order-none">
            <ul className="space-y-4">
              {[FileText, Wrench, ShieldCheck].map((Icon, i) => ({ Icon, b: k.maddeler[i].baslik, d: k.maddeler[i].metin })).map(({ Icon, b, d }) => (
                <li key={b} className="flex gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{b}</p>
                    <p className="text-sm text-gray-400">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xs text-gray-500 max-w-xl">
              {k.not}
            </p>
            <p className="mt-3 text-xs text-gray-500 max-w-xl">
              {k.firmaMi}{' '}
              <Link to="/is-ortagi-ol" className="text-green-400 hover:underline">
                {k.isOrtagi}
              </Link>
              .
            </p>
          </div>

          {/* Sağ: form */}
          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 order-2 lg:order-none bg-gray-950 border border-gray-800 rounded-2xl p-5 sm:p-7">
            {durum === 'kapali' ? (
              <div className="text-center py-10">
                <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                <p className="text-white font-semibold">{k.kapaliBaslik}</p>
                <p className="text-sm text-gray-400 mt-2">{k.kapaliMetin}</p>
              </div>
            ) : durum === 'basarili' ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-xl font-bold text-white">{k.basariBaslik}</p>
                <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                  {k.basariMetin}
                </p>
                <Link to="/sarj-haritasi" className="inline-block mt-6 text-green-400 hover:text-green-300 font-semibold text-sm">
                  {k.haritayaDon}
                </Link>
              </div>
            ) : (
              <form onSubmit={gonder} noValidate>
                {/* İlerleme */}
                <div className="flex items-center gap-2 mb-6" aria-label={bicim(k.adim, { n: adim })}>
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= adim ? 'bg-green-500' : 'bg-gray-800'}`} />
                  ))}
                </div>

                {adim === 1 && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-lg font-bold text-white mb-3">{k.soru1}</p>
                      <div className="space-y-2.5">
                        {MEKANLAR.map(({ id, baslik, aciklama, icon: Icon }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setMekan(id)}
                            aria-pressed={mekan === id}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-colors ${
                              mekan === id ? 'border-green-500 bg-green-500/10' : 'border-gray-800 bg-gray-900 hover:border-green-500/40'
                            }`}
                          >
                            <Icon className={`w-6 h-6 shrink-0 ${mekan === id ? 'text-green-400' : 'text-gray-500'}`} />
                            <span>
                              <span className="block font-semibold text-white">{baslik}</span>
                              <span className="block text-xs text-gray-400">{aciklama}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {mekan && (
                      <>
                        <Alan etiket={k.otoparkTipi}>
                          <Secenekler secenekler={OTOPARK} deger={otopark} onSec={setOtopark} />
                        </Alan>
                        <Alan etiket={k.mesafeEtiket}>
                          <Secenekler secenekler={MESAFE} deger={mesafe} onSec={setMesafe} />
                        </Alan>
                        <label className="flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 cursor-pointer hover:border-green-500/40">
                          <input
                            type="checkbox"
                            checked={yukYonetimi}
                            onChange={(e) => setYukYonetimi(e.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-green-500"
                          />
                          <span className="text-sm">
                            <span className="block font-semibold text-white">{k.yukBaslik}</span>
                            <span className="block text-xs text-gray-400 mt-0.5">
                              {k.yukMetin}
                            </span>
                          </span>
                        </label>
                        {mekan !== 'ev' && (
                          <Alan etiket={k.uniteEtiket} ipucu={k.uniteIpucu}>
                            <input
                              type="number"
                              min={1}
                              max={200}
                              inputMode="numeric"
                              value={unite}
                              onChange={(e) => setUnite(e.target.value)}
                              className={inputCls}
                              placeholder={k.uniteYer}
                            />
                          </Alan>
                        )}
                        <Alan etiket={k.aracEtiket}>
                          <input
                            value={arac}
                            onChange={(e) => setArac(e.target.value)}
                            maxLength={80}
                            className={inputCls}
                            placeholder={k.aracYer}
                          />
                        </Alan>
                      </>
                    )}
                  </div>
                )}

                {adim === 2 && (
                  <div className="space-y-5">
                    <p className="text-lg font-bold text-white">{k.soru2}</p>
                    <Alan etiket={k.ulke}>
                      <Secenekler
                        secenekler={(['TR', 'AZ'] as const).map((u) => ({ id: u, ad: k.ulkeler[u] }))}
                        deger={ulke}
                        onSec={(u) => {
                          setUlke(u);
                          setIl('');
                        }}
                      />
                    </Alan>
                    <Alan etiket={k.il}>
                      <select value={il} onChange={(e) => setIl(e.target.value)} className={inputCls}>
                        <option value="">{k.ilSec}</option>
                        {sehirler.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                    </Alan>
                    <Alan etiket={k.ilce}>
                      <input value={ilce} onChange={(e) => setIlce(e.target.value)} maxLength={60} className={inputCls} placeholder={ulke === 'AZ' ? 'Nəsimi' : 'Kadıköy'} />
                    </Alan>
                  </div>
                )}

                {adim === 3 && (
                  <div className="space-y-5">
                    <p className="text-lg font-bold text-white">{k.soru3}</p>
                    <Alan etiket={k.ad}>
                      <input value={ad} onChange={(e) => setAd(e.target.value)} maxLength={80} autoComplete="name" className={inputCls} />
                    </Alan>
                    <Alan etiket={k.telefon}>
                      <input
                        type="tel"
                        value={telefon}
                        onChange={(e) => setTelefon(e.target.value)}
                        autoComplete="tel"
                        inputMode="tel"
                        className={inputCls}
                        placeholder={ulke === 'AZ' ? k.telefonYerAZ : k.telefonYerTR}
                      />
                      {telefon && !telefonGecerli && <span className="block text-xs text-red-400 mt-1">{k.telefonHata}</span>}
                    </Alan>
                    <Alan etiket={k.eposta}>
                      <input
                        type="email"
                        value={eposta}
                        onChange={(e) => setEposta(e.target.value)}
                        autoComplete="email"
                        className={inputCls}
                      />
                      {!epostaGecerli && <span className="block text-xs text-red-400 mt-1">{k.epostaHata}</span>}
                    </Alan>
                    <Alan etiket={k.notEtiket}>
                      <textarea
                        value={not}
                        onChange={(e) => setNot(e.target.value)}
                        maxLength={1000}
                        rows={3}
                        className={inputCls}
                        placeholder={k.notYer}
                      />
                    </Alan>
                    <div className="space-y-3 pt-1">
                      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-gray-400 cursor-pointer">
                        <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-green-500" />
                        <span>
                          <Link to="/kvkk" target="_blank" className="text-gray-200 underline hover:text-green-400">
                            {k.onay1Link}
                          </Link>
                          {k.onay1Metin}
                        </span>
                      </label>
                      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-gray-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paylasim}
                          onChange={(e) => setPaylasim(e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-green-500"
                        />
                        <span>
                          {k.onay2}
                        </span>
                      </label>
                    </div>
                    {durum === 'hata' && (
                      <p className="flex items-center gap-2 text-sm text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {hataMesaji}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 mt-8">
                  {adim > 1 ? (
                    <button
                      type="button"
                      onClick={() => setAdim(adim - 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white"
                    >
                      <ArrowLeft className="w-4 h-4" /> {t.ortak.geri}
                    </button>
                  ) : (
                    <span />
                  )}
                  {adim < 3 ? (
                    <button
                      type="button"
                      disabled={(adim === 1 && !adim1Tamam) || (adim === 2 && !adim2Tamam)}
                      onClick={() => setAdim(adim + 1)}
                      className="inline-flex items-center gap-1.5 px-6 py-3 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl"
                    >
                      {t.ortak.devam} <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!adim3Tamam || durum === 'gonderiliyor'}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl"
                    >
                      {durum === 'gonderiliyor' && <Loader2 className="w-4 h-4 animate-spin" />}
                      {k.gonder}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
