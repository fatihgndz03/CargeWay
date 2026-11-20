import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
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

/** Onay metni değişirse bu sürümü güncelleyin; talep kaydında saklanır. */
export const ONAY_METNI_SURUMU = '2026-11-19';

type MekanTipi = 'ev' | 'apartman-site' | 'isyeri-otopark';
type Durum = 'form' | 'gonderiliyor' | 'basarili' | 'hata' | 'kapali';

const MEKANLAR: { id: MekanTipi; baslik: string; aciklama: string; icon: typeof Home }[] = [
  { id: 'ev', baslik: 'Müstakil ev / villa', aciklama: 'Kendi garajınız veya otoparkınız', icon: Home },
  { id: 'apartman-site', baslik: 'Apartman / site', aciklama: 'Ortak otopark, yönetim kararı gerekebilir', icon: Building2 },
  { id: 'isyeri-otopark', baslik: 'İşyeri / otopark / otel', aciklama: 'Çalışan, müşteri veya filo için', icon: Factory },
];

const OTOPARK = [
  { id: 'kapali', ad: 'Kapalı otopark' },
  { id: 'acik', ad: 'Açık otopark' },
  { id: 'mustakil-garaj', ad: 'Müstakil garaj' },
  { id: 'bilinmiyor', ad: 'Emin değilim' },
];

const MESAFE = [
  { id: '0-10', ad: '10 m\'den az' },
  { id: '10-25', ad: '10–25 m' },
  { id: '25-50', ad: '25–50 m' },
  { id: '50+', ad: '50 m\'den fazla' },
  { id: 'bilinmiyor', ad: 'Bilmiyorum' },
];

const inputCls =
  'w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500/70 focus:ring-1 focus:ring-green-500/30';

function Alan({ etiket, ipucu, children }: { etiket: string; ipucu?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-200 mb-1.5">{etiket}</span>
      {children}
      {ipucu && <span className="block text-xs text-gray-500 mt-1">{ipucu}</span>}
    </label>
  );
}

function Secenekler<T extends string>({
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

export default function InstallationPage() {
  useSeo(
    'Şarj Ünitesi Kurulumu — Ücretsiz Teklif Al | CargeWay',
    'Evinize, sitenize veya işyerinize elektrikli araç şarj ünitesi (wallbox) kurdurmak için ücretsiz teklif talebi oluşturun.',
  );

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
      setHataMesaji('Talebiniz şu an gönderilemedi. Lütfen biraz sonra tekrar deneyin.');
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
            <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">Şarj ünitesi kurulumu</span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mt-2 leading-tight">
              Evinize ya da sitenize
              <br />
              <span className="text-green-500">şarj ünitesi</span> kurdurun
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-xl">
              Birkaç soruyu yanıtlayın; talebinizi bölgenizde hizmet veren anlaşmalı kurulum firmalarına iletelim, size
              teklifle dönsünler. Talep oluşturmak ücretsizdir ve sizi bağlamaz.
            </p>
          </div>

          {/* Sol alt: açıklama maddeleri (mobilde formdan sonra) */}
          <div className="lg:col-start-1 lg:row-start-2 order-3 lg:order-none">
            <ul className="space-y-4">
              {[
                { icon: FileText, t: 'Keşif ve teklif', d: 'Firma, mesafe ve elektrik altyapınıza göre fiyat verir.' },
                { icon: Wrench, t: 'Kurulum', d: 'Wallbox montajı, kablolama ve koruma elemanları yetkili ekiplerce yapılır.' },
                {
                  icon: ShieldCheck,
                  t: 'Bilgileriniz korunur',
                  d: 'Yalnızca teklif hazırlamak için, onay verdiğiniz firmalarla paylaşılır.',
                },
              ].map(({ icon: Icon, t, d }) => (
                <li key={t} className="flex gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t}</p>
                    <p className="text-sm text-gray-400">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xs text-gray-500 max-w-xl">
              CargeWay kurulum yapmaz; talepleri kurulum firmalarına ileten bir bilgi platformudur. Fiyat, süre ve garanti
              koşulları teklifi veren firmaya aittir.
            </p>
          </div>

          {/* Sağ: form */}
          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 order-2 lg:order-none bg-gray-950 border border-gray-800 rounded-2xl p-5 sm:p-7">
            {durum === 'kapali' ? (
              <div className="text-center py-10">
                <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                <p className="text-white font-semibold">Talepler şu an alınamıyor</p>
                <p className="text-sm text-gray-400 mt-2">Form kısa süre içinde açılacak. Lütfen daha sonra tekrar deneyin.</p>
              </div>
            ) : durum === 'basarili' ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-xl font-bold text-white">Talebiniz alındı</p>
                <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                  Bilgilerinizi bölgenizde hizmet veren kurulum firmalarına ileteceğiz. Firmalar genellikle telefonla
                  sizinle iletişime geçer.
                </p>
                <Link to="/sarj-haritasi" className="inline-block mt-6 text-green-400 hover:text-green-300 font-semibold text-sm">
                  Şarj haritasına dön →
                </Link>
              </div>
            ) : (
              <form onSubmit={gonder} noValidate>
                {/* İlerleme */}
                <div className="flex items-center gap-2 mb-6" aria-label={`Adım ${adim} / 3`}>
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= adim ? 'bg-green-500' : 'bg-gray-800'}`} />
                  ))}
                </div>

                {adim === 1 && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-lg font-bold text-white mb-3">Nereye kurulum istiyorsunuz?</p>
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
                        <Alan etiket="Otopark tipi">
                          <Secenekler secenekler={OTOPARK} deger={otopark} onSec={setOtopark} />
                        </Alan>
                        <Alan etiket="Elektrik panosu ile park yeri arası mesafe (tahmini)">
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
                            <span className="block font-semibold text-white">Akıllı yük yönetimi ilgimi çekiyor</span>
                            <span className="block text-xs text-gray-400 mt-0.5">
                              Evin toplam tüketimine göre şarj gücünü otomatik ayarlayan ve hangi cihazın ne kadar
                              harcadığını telefondan gösteren sistem. (İsteğe bağlı)
                            </span>
                          </span>
                        </label>
                        {mekan !== 'ev' && (
                          <Alan etiket="Kaç şarj ünitesi düşünüyorsunuz?" ipucu="Bilmiyorsanız boş bırakın.">
                            <input
                              type="number"
                              min={1}
                              max={200}
                              inputMode="numeric"
                              value={unite}
                              onChange={(e) => setUnite(e.target.value)}
                              className={inputCls}
                              placeholder="Örn. 4"
                            />
                          </Alan>
                        )}
                        <Alan etiket="Aracınız (isteğe bağlı)">
                          <input
                            value={arac}
                            onChange={(e) => setArac(e.target.value)}
                            maxLength={80}
                            className={inputCls}
                            placeholder="Örn. Togg T10X"
                          />
                        </Alan>
                      </>
                    )}
                  </div>
                )}

                {adim === 2 && (
                  <div className="space-y-5">
                    <p className="text-lg font-bold text-white">Kurulum nerede yapılacak?</p>
                    <Alan etiket="İl">
                      <select value={il} onChange={(e) => setIl(e.target.value)} className={inputCls}>
                        <option value="">İl seçin</option>
                        {ILLER.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                    </Alan>
                    <Alan etiket="İlçe (isteğe bağlı)">
                      <input value={ilce} onChange={(e) => setIlce(e.target.value)} maxLength={60} className={inputCls} placeholder="Örn. Kadıköy" />
                    </Alan>
                  </div>
                )}

                {adim === 3 && (
                  <div className="space-y-5">
                    <p className="text-lg font-bold text-white">Size nasıl ulaşalım?</p>
                    <Alan etiket="Ad soyad">
                      <input value={ad} onChange={(e) => setAd(e.target.value)} maxLength={80} autoComplete="name" className={inputCls} />
                    </Alan>
                    <Alan etiket="Telefon">
                      <input
                        type="tel"
                        value={telefon}
                        onChange={(e) => setTelefon(e.target.value)}
                        autoComplete="tel"
                        inputMode="tel"
                        className={inputCls}
                        placeholder="05xx xxx xx xx"
                      />
                      {telefon && !telefonGecerli && <span className="block text-xs text-red-400 mt-1">Geçerli bir telefon numarası girin.</span>}
                    </Alan>
                    <Alan etiket="E-posta (isteğe bağlı)">
                      <input
                        type="email"
                        value={eposta}
                        onChange={(e) => setEposta(e.target.value)}
                        autoComplete="email"
                        className={inputCls}
                      />
                      {!epostaGecerli && <span className="block text-xs text-red-400 mt-1">Geçerli bir e-posta girin.</span>}
                    </Alan>
                    <Alan etiket="Not (isteğe bağlı)">
                      <textarea
                        value={not}
                        onChange={(e) => setNot(e.target.value)}
                        maxLength={1000}
                        rows={3}
                        className={inputCls}
                        placeholder="Örn. site yönetimi onay verdi, otoparkta 3 faz var…"
                      />
                    </Alan>
                    <div className="space-y-3 pt-1">
                      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-gray-400 cursor-pointer">
                        <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-green-500" />
                        <span>
                          <Link to="/kvkk" target="_blank" className="text-gray-200 underline hover:text-green-400">
                            KVKK Aydınlatma Metni
                          </Link>
                          'ni okudum; bilgilerimin teklif talebimin karşılanması amacıyla işlenmesine açık rıza veriyorum.
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
                          Ad, telefon, e-posta, konum ve kurulum bilgilerimin teklif hazırlanması amacıyla CargeWay'in
                          anlaşmalı kurulum firmalarıyla paylaşılmasına ve bu firmaların benimle iletişime geçmesine açık
                          rıza veriyorum.
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
                      <ArrowLeft className="w-4 h-4" /> Geri
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
                      Devam <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!adim3Tamam || durum === 'gonderiliyor'}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl"
                    >
                      {durum === 'gonderiliyor' && <Loader2 className="w-4 h-4 animate-spin" />}
                      Teklif iste
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
