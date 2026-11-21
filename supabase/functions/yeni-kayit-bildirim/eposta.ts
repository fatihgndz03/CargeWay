// Webhook kaydını e-postaya çeviren saf fonksiyonlar (Deno'ya bağımlı değil, Node'da test edilebilir).
//
// Desteklenen tablolar:
//   kurulum_talepleri      → "Yeni kurulum talebi" e-postası
//   is_ortagi_basvurulari  → "Yeni iş ortaklığı başvurusu" e-postası

export type Kayit = Record<string, unknown>;
export type Eposta = { konu: string; html: string; metin: string };

export const DESTEKLENEN_TABLOLAR = ['kurulum_talepleri', 'is_ortagi_basvurulari'] as const;
export type Tablo = (typeof DESTEKLENEN_TABLOLAR)[number];

const MEKAN: Record<string, string> = {
  ev: 'Müstakil ev / villa',
  'apartman-site': 'Apartman / site',
  'isyeri-otopark': 'İşyeri / otopark / otel',
};

const OTOPARK: Record<string, string> = {
  kapali: 'Kapalı otopark',
  acik: 'Açık otopark',
  'mustakil-garaj': 'Müstakil garaj',
  bilinmiyor: 'Emin değil',
};

const MESAFE: Record<string, string> = {
  '0-10': "10 m'den az",
  '10-25': '10–25 m',
  '25-50': '25–50 m',
  '50+': "50 m'den fazla",
  bilinmiyor: 'Bilmiyor',
};

const BELGE: Record<string, string> = {
  smm: 'EMO SMM belgesi',
  'tesisat-yetki': 'Elektrik tesisatı yetki belgesi',
  'uretici-yetkili': 'Üretici / distribütör yetkili kurulum belgesi',
  diger: 'Diğer',
};

const KURULUM_SAYISI: Record<string, string> = {
  '0-10': "10'dan az",
  '10-50': '10–50',
  '50-200': '50–200',
  '200+': "200'den fazla",
  belirtilmedi: 'Belirtilmedi',
};

function kacis(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Konu satırında başlık enjeksiyonunu önlemek için satır sonlarını temizler ve kısaltır. */
function tekSatir(v: unknown, enFazla = 80): string {
  const s = String(v ?? '').replace(/[\r\n\t]+/g, ' ').trim();
  return s.length > enFazla ? `${s.slice(0, enFazla - 1)}…` : s;
}

function etiket(sozluk: Record<string, string>, v: unknown): string {
  if (v === null || v === undefined || v === '') return '';
  return sozluk[String(v)] ?? String(v);
}

function liste(sozluk: Record<string, string> | null, v: unknown): string {
  if (!Array.isArray(v)) return '';
  return v.map((x) => (sozluk ? etiket(sozluk, x) : String(x))).join(', ');
}

function bos(d: unknown): boolean {
  return d === null || d === undefined || d === '';
}

function olustur(giris: string, alanlar: [string, unknown][], dipnot: string, konu: string): Eposta {
  const satirlar = alanlar
    .filter(([, d]) => !bos(d))
    .map(
      ([e, d]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#555;vertical-align:top">${kacis(e)}</td><td style="padding:4px 0"><strong>${kacis(d).replace(/\n/g, '<br>')}</strong></td></tr>`,
    )
    .join('');
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px">
<p>${kacis(giris)}</p>
<table>${satirlar}</table>
<p style="color:#777;font-size:12px">${kacis(dipnot)}</p></div>`;
  const metin = [
    giris,
    '',
    ...alanlar.filter(([, d]) => !bos(d)).map(([e, d]) => `${e}: ${d}`),
    '',
    dipnot,
  ].join('\n');
  return { konu, html, metin };
}

export function kurulumTalebiEpostasi(k: Kayit): Eposta {
  const mekan = etiket(MEKAN, k.mekan_tipi);
  const konum = [k.il, k.ilce].filter((x) => !bos(x)).join(' / ');
  return olustur(
    "CargeWay'e yeni bir şarj ünitesi kurulum talebi geldi.",
    [
      ['Ad soyad', k.ad],
      ['Telefon', k.telefon],
      ['E-posta', k.eposta],
      ['Konum', konum],
      ['Mekân tipi', mekan],
      ['Otopark', etiket(OTOPARK, k.otopark_tipi)],
      ['Pano–park yeri mesafesi', etiket(MESAFE, k.tahmini_mesafe)],
      ['Ünite sayısı', k.unite_sayisi],
      ['Araç', k.arac_modeli],
      ['Yük yönetimi / enerji takibi ilgisi', k.yuk_yonetimi_ilgi === true ? 'Evet' : ''],
      ['Not', k.not_metni],
      ['Paylaşım açık rızası', k.paylasim_onay === true ? 'Var' : 'YOK'],
      ['Onay metni sürümü', k.onay_metni_surumu],
      ['Tarih', k.created_at],
    ],
    'Bu veriler KVKK kapsamında kişisel veridir. Yalnızca teklif hazırlanması amacıyla, kişinin açık rızası doğrultusunda anlaşmalı kurulum firmalarıyla paylaşın.',
    tekSatir(`Yeni kurulum talebi: ${mekan} — ${konum}`, 120),
  );
}

export function isOrtagiBasvurusuEpostasi(k: Kayit): Eposta {
  const iller = Array.isArray(k.hizmet_illeri) ? k.hizmet_illeri : [];
  const ilOzeti = iller.length >= 81 ? 'Tüm Türkiye (81 il)' : liste(null, iller);
  return olustur(
    "CargeWay'e yeni bir kurulum firması (iş ortaklığı) başvurusu geldi.",
    [
      ['Firma', k.firma_adi],
      ['Web sitesi', k.web_sitesi],
      ['Yetkili', k.yetkili_ad],
      ['Telefon', k.telefon],
      ['E-posta', k.eposta],
      ['Yetki belgeleri', liste(BELGE, k.yetki_belgeleri)],
      ['Belge açıklaması', k.yetki_aciklama],
      ['Kurulum türleri', liste(MEKAN, k.hizmet_turleri)],
      [`Hizmet verilen iller (${iller.length})`, ilOzeti],
      ['Yıllık kurulum sayısı', etiket(KURULUM_SAYISI, k.yillik_kurulum)],
      ['Not', k.not_metni],
      ['Onay metni sürümü', k.onay_metni_surumu],
      ['Tarih', k.created_at],
    ],
    'Başvuru bir iş ortaklığı anlamına gelmez. Belgeleri doğrulamadan firmaya talep yönlendirmeyin. Bu veriler kişisel veri içerir; üçüncü kişilerle paylaşmayın.',
    tekSatir(`Yeni iş ortaklığı başvurusu: ${tekSatir(k.firma_adi, 60)}`, 120),
  );
}

export function epostaHazirla(tablo: string, kayit: Kayit): Eposta | null {
  if (tablo === 'kurulum_talepleri') return kurulumTalebiEpostasi(kayit);
  if (tablo === 'is_ortagi_basvurulari') return isOrtagiBasvurusuEpostasi(kayit);
  return null;
}
