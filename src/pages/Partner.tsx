import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Handshake,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Alan, Secenekler, inputCls } from '../components/FormParcalari';
import { useSeo } from '../lib/seo';
import { supabase } from '../lib/supabase';
import { ILLER } from '../data/iller';

/** Aydınlatma metni değişirse bu sürümü güncelleyin; başvuru kaydında saklanır. */
export const ORTAK_ONAY_METNI_SURUMU = '2026-11-21';

type Durum = 'form' | 'gonderiliyor' | 'basarili' | 'hata' | 'kapali';
type HizmetTuru = 'ev' | 'apartman-site' | 'isyeri-otopark';
type Belge = 'smm' | 'tesisat-yetki' | 'uretici-yetkili' | 'diger';

const BELGELER: { id: Belge; ad: string }[] = [
  { id: 'smm', ad: 'EMO Serbest Müşavir Mühendislik (SMM) belgesi' },
  { id: 'tesisat-yetki', ad: 'Elektrik tesisatı yetki belgesi (yetkili elektrikçi)' },
  { id: 'uretici-yetkili', ad: 'Şarj ünitesi üreticisi / distribütörü yetkili kurulum belgesi' },
  { id: 'diger', ad: 'Diğer (açıklayın)' },
];

const HIZMETLER: { id: HizmetTuru; ad: string }[] = [
  { id: 'ev', ad: 'Müstakil ev / villa' },
  { id: 'apartman-site', ad: 'Apartman / site' },
  { id: 'isyeri-otopark', ad: 'İşyeri / otopark / otel' },
];

const KURULUM_SAYISI = [
  { id: '0-10', ad: '10\'dan az' },
  { id: '10-50', ad: '10–50' },
  { id: '50-200', ad: '50–200' },
  { id: '200+', ad: '200\'den fazla' },
  { id: 'belirtilmedi', ad: 'Belirtmek istemiyorum' },
];

function CokluSecim<T extends string>({
  secenekler,
  secili,
  onDegis,
}: {
  secenekler: { id: T; ad: string }[];
  secili: T[];
  onDegis: (v: T[]) => void;
}) {
  return (
    <div className="space-y-2">
      {secenekler.map((s) => {
        const acik = secili.includes(s.id);
        return (
          <label
            key={s.id}
            className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer text-sm transition-colors ${
              acik ? 'border-green-500 bg-green-500/10 text-white' : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-green-500/40'
            }`}
          >
            <input
              type="checkbox"
              checked={acik}
              onChange={() => onDegis(acik ? secili.filter((x) => x !== s.id) : [...secili, s.id])}
              className="mt-0.5 h-4 w-4 shrink-0 accent-green-500"
            />
            <span>{s.ad}</span>
          </label>
        );
      })}
    </div>
  );
}

export default function PartnerPage() {
  useSeo(
    'İş Ortağımız Olun — Şarj Ünitesi Kurulum Firmaları | CargeWay',
    'Elektrikli araç şarj ünitesi (wallbox) kurulumu yapan firmalar, CargeWay üzerinden gelen kurulum taleplerini almak için başvurabilir.',
  );

  const [adim, setAdim] = useState(1);
  const [durum, setDurum] = useState<Durum>(supabase ? 'form' : 'kapali');
  const [hataMesaji, setHataMesaji] = useState('');

  const [firma, setFirma] = useState('');
  const [web, setWeb] = useState('');
  const [belgeler, setBelgeler] = useState<Belge[]>([]);
  const [belgeAciklama, setBelgeAciklama] = useState('');

  const [hizmetler, setHizmetler] = useState<HizmetTuru[]>([]);
  const [iller, setIller] = useState<string[]>([]);
  const [ilAra, setIlAra] = useState('');
  const [kurulumSayisi, setKurulumSayisi] = useState('');

  const [yetkili, setYetkili] = useState('');
  const [telefon, setTelefon] = useState('');
  const [eposta, setEposta] = useState('');
  const [not, setNot] = useState('');
  const [kvkk, setKvkk] = useState(false);

  const webGecerli = !web.trim() || /^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(web.trim());
  const telefonGecerli = /^[0-9 +()-]{10,20}$/.test(telefon.trim());
  const epostaGecerli = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(eposta.trim());

  const adim1Tamam =
    firma.trim().length >= 2 && webGecerli && belgeler.length > 0 && (!belgeler.includes('diger') || belgeAciklama.trim().length >= 2);
  const adim2Tamam = hizmetler.length > 0 && iller.length > 0;
  const adim3Tamam = yetkili.trim().length >= 2 && telefonGecerli && epostaGecerli && kvkk;

  const filtreliIller = useMemo(() => {
    const q = ilAra.trim().toLocaleLowerCase('tr');
    return q ? ILLER.filter((x) => x.toLocaleLowerCase('tr').includes(q)) : ILLER;
  }, [ilAra]);

  const ilDegistir = (il: string) =>
    setIller((onceki) => (onceki.includes(il) ? onceki.filter((x) => x !== il) : [...onceki, il]));

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adim3Tamam || !adim1Tamam || !adim2Tamam || !supabase) return;
    setDurum('gonderiliyor');
    setHataMesaji('');
    const { error } = await supabase.from('is_ortagi_basvurulari').insert({
      firma_adi: firma.trim().slice(0, 120),
      web_sitesi: web.trim().slice(0, 200) || null,
      yetki_belgeleri: belgeler,
      yetki_aciklama: belgeAciklama.trim().slice(0, 300) || null,
      hizmet_illeri: ILLER.filter((x) => iller.includes(x)),
      hizmet_turleri: hizmetler,
      yillik_kurulum: kurulumSayisi || null,
      yetkili_ad: yetkili.trim().slice(0, 80),
      telefon: telefon.trim(),
      eposta: eposta.trim().slice(0, 120),
      not_metni: not.trim().slice(0, 1000) || null,
      kvkk_onay: kvkk,
      onay_metni_surumu: ORTAK_ONAY_METNI_SURUMU,
    });
    if (error) {
      console.error('Başvuru gönderilemedi:', error.message);
      setDurum('hata');
      setHataMesaji('Başvurunuz şu an gönderilemedi. Lütfen biraz sonra tekrar deneyin.');
      return;
    }
    setDurum('basarili');
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_minmax(0,32rem)] gap-x-12 gap-y-8 items-start">
          <div className="lg:col-start-1 lg:row-start-1">
            <span className="text-green-500 text-sm font-semibold tracking-widest uppercase">Kurulum firmaları için</span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mt-2 leading-tight">
              CargeWay'in
              <br />
              <span className="text-green-500">iş ortağı</span> olun
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-xl">
              Elektrikli araç şarj ünitesi kurulumu yapıyorsanız başvurun. Anlaşma yaptığımız firmalara, hizmet verdikleri
              illerden gelen ve paylaşıma onay verilmiş kurulum taleplerini iletiyoruz.
            </p>
          </div>

          <div className="lg:col-start-1 lg:row-start-2 order-3 lg:order-none">
            <ol className="space-y-4">
              {[
                { icon: Handshake, t: '1. Başvuru', d: 'Firma, belge ve hizmet bölgesi bilgilerinizi gönderin.' },
                {
                  icon: ShieldCheck,
                  t: '2. Görüşme ve yazılı anlaşma',
                  d: 'Çalışma koşulları ve kişisel verilerin korunmasına ilişkin hükümler yazılı olarak belirlenir. Belgelerinizin kopyaları istenebilir.',
                },
                {
                  icon: MapPin,
                  t: '3. Talep iletimi',
                  d: 'Anlaşma sonrasında, bölgenizdeki ve hizmet türünüze uyan talepler size iletilir.',
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
            </ol>
            <p className="mt-8 text-xs text-gray-500 max-w-xl">
              Başvuru, iş ortaklığı kurulacağı anlamına gelmez; her başvuru ayrı değerlendirilir. Talep sayısı bölgeye ve
              döneme göre değişir, belirli bir talep sayısı taahhüt edilmez. Ev veya işyerinize kurulum mu
              istiyorsunuz?{' '}
              <Link to="/sarj-unitesi-kurulumu" className="text-green-400 hover:underline">
                Teklif formuna gidin
              </Link>
              .
            </p>
          </div>

          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 order-2 lg:order-none bg-gray-950 border border-gray-800 rounded-2xl p-5 sm:p-7">
            {durum === 'kapali' ? (
              <div className="text-center py-10">
                <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                <p className="text-white font-semibold">Başvurular şu an alınamıyor</p>
                <p className="text-sm text-gray-400 mt-2">Form kısa süre içinde açılacak. Lütfen daha sonra tekrar deneyin.</p>
              </div>
            ) : durum === 'basarili' ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-xl font-bold text-white">Başvurunuz alındı</p>
                <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                  Başvurunuzu inceledikten sonra verdiğiniz telefon veya e-posta üzerinden sizinle iletişime geçeceğiz.
                </p>
                <Link to="/" className="inline-block mt-6 text-green-400 hover:text-green-300 font-semibold text-sm">
                  Ana sayfaya dön →
                </Link>
              </div>
            ) : (
              <form onSubmit={gonder} noValidate>
                <div className="flex items-center gap-2 mb-6" aria-label={`Adım ${adim} / 3`}>
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= adim ? 'bg-green-500' : 'bg-gray-800'}`} />
                  ))}
                </div>

                {adim === 1 && (
                  <div className="space-y-5">
                    <p className="text-lg font-bold text-white">Firma bilgileri</p>
                    <Alan etiket="Firma adı / unvanı">
                      <input value={firma} onChange={(e) => setFirma(e.target.value)} maxLength={120} autoComplete="organization" className={inputCls} />
                    </Alan>
                    <Alan etiket="Web sitesi (isteğe bağlı)">
                      <input
                        value={web}
                        onChange={(e) => setWeb(e.target.value)}
                        maxLength={200}
                        inputMode="url"
                        className={inputCls}
                        placeholder="ornekfirma.com.tr"
                      />
                      {!webGecerli && <span className="block text-xs text-red-400 mt-1">Geçerli bir web adresi girin.</span>}
                    </Alan>
                    <div>
                      <span className="block text-sm font-semibold text-gray-200 mb-1.5">Sahip olduğunuz yetki belgeleri</span>
                      <CokluSecim secenekler={BELGELER} secili={belgeler} onDegis={setBelgeler} />
                    </div>
                    {belgeler.includes('diger') && (
                      <Alan etiket="Diğer belge(ler)">
                        <input
                          value={belgeAciklama}
                          onChange={(e) => setBelgeAciklama(e.target.value)}
                          maxLength={300}
                          className={inputCls}
                          placeholder="Belge adı"
                        />
                      </Alan>
                    )}
                  </div>
                )}

                {adim === 2 && (
                  <div className="space-y-5">
                    <p className="text-lg font-bold text-white">Hizmet verdiğiniz alanlar</p>
                    <div>
                      <span className="block text-sm font-semibold text-gray-200 mb-1.5">Kurulum türleri</span>
                      <CokluSecim secenekler={HIZMETLER} secili={hizmetler} onDegis={setHizmetler} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-gray-200">
                          Hizmet verdiğiniz iller <span className="text-gray-500 font-normal">({iller.length} seçili)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIller(iller.length === ILLER.length ? [] : [...ILLER])}
                          className="text-xs font-semibold text-green-400 hover:text-green-300"
                        >
                          {iller.length === ILLER.length ? 'Temizle' : 'Tüm Türkiye'}
                        </button>
                      </div>
                      <div className="relative mb-2">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          value={ilAra}
                          onChange={(e) => setIlAra(e.target.value)}
                          className={`${inputCls} pl-10`}
                          placeholder="İl ara"
                          aria-label="İl ara"
                        />
                      </div>
                      <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-800 bg-gray-900 p-2 grid grid-cols-2 gap-1">
                        {filtreliIller.map((il) => (
                          <label
                            key={il}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer min-w-0"
                          >
                            <input
                              type="checkbox"
                              checked={iller.includes(il)}
                              onChange={() => ilDegistir(il)}
                              className="h-4 w-4 shrink-0 accent-green-500"
                            />
                            <span className="truncate">{il}</span>
                          </label>
                        ))}
                        {filtreliIller.length === 0 && <p className="col-span-2 text-xs text-gray-500 p-2">Eşleşen il yok.</p>}
                      </div>
                    </div>
                    <Alan etiket="Yıllık yaklaşık kurulum sayınız (isteğe bağlı)">
                      <Secenekler secenekler={KURULUM_SAYISI} deger={kurulumSayisi} onSec={setKurulumSayisi} />
                    </Alan>
                  </div>
                )}

                {adim === 3 && (
                  <div className="space-y-5">
                    <p className="text-lg font-bold text-white">İletişim</p>
                    <Alan etiket="Yetkili kişi ad soyad">
                      <input value={yetkili} onChange={(e) => setYetkili(e.target.value)} maxLength={80} autoComplete="name" className={inputCls} />
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
                    <Alan etiket="E-posta">
                      <input
                        type="email"
                        value={eposta}
                        onChange={(e) => setEposta(e.target.value)}
                        maxLength={120}
                        autoComplete="email"
                        className={inputCls}
                      />
                      {eposta && !epostaGecerli && <span className="block text-xs text-red-400 mt-1">Geçerli bir e-posta girin.</span>}
                    </Alan>
                    <Alan etiket="Not (isteğe bağlı)">
                      <textarea
                        value={not}
                        onChange={(e) => setNot(e.target.value)}
                        maxLength={1000}
                        rows={3}
                        className={inputCls}
                        placeholder="Örn. ekip büyüklüğü, çalıştığınız markalar, DC kurulum deneyimi…"
                      />
                    </Alan>
                    <label className="flex items-start gap-2.5 text-xs leading-relaxed text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-green-500" />
                      <span>
                        <Link to="/kvkk#is-ortagi" target="_blank" className="text-gray-200 underline hover:text-green-400">
                          KVKK Aydınlatma Metni
                        </Link>
                        'nin iş ortaklığı başvurularına ilişkin bölümünü okudum; verdiğim bilgilerin doğru olduğunu beyan
                        ederim.
                      </span>
                    </label>
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
                      Başvur
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
