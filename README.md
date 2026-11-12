# CargeWay

Türkiye'deki elektrikli araç (EV) şarj ağlarını tek haritada gösteren bilgi ve harita platformu — <https://cargeway.com>

> CargeWay bir şarj operatörü değildir; şarj hizmeti, ödeme veya OCPP altyapısı sunmaz. Amaç, farklı operatörlerin istasyonlarını tek yerde, tarafsız biçimde göstermektir.

## Teknolojiler

- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router
- Leaflet / react-leaflet (harita)
- Supabase (veritabanı, ileride kimlik doğrulama)
- Netlify (barındırma)

## Kurulum

```bash
npm ci
cp .env.example .env   # değerleri doldurun
npm run dev            # http://localhost:5173
```

## Ortam değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase proje adresi |
| `VITE_SUPABASE_ANON_KEY` | Supabase "anon" (herkese açık) anahtarı |
| `VITE_SHOW_COMING_SOON` | `true` ise tüm site yerine "Çok Yakında" sayfası gösterilir. Gerçek siteyi açmak için `false` yapın veya silin. |

Netlify'da bu değişkenler **Site configuration → Environment variables** bölümünden tanımlanır. `.env` dosyası asla repoya eklenmez.

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi (`dist/`) |
| `npm run preview` | Derlemeyi yerelde önizleme |
| `npm run typecheck` | TypeScript kontrolü |
| `npm run lint` | ESLint kontrolü |
| `npm run istasyon:aktar -- …` | İstasyon verisini CSV / Open Charge Map'ten Supabase'e aktarır (aşağıya bakın) |

`npm run build`, derlemeden sonra `scripts/sitemap-olustur.mjs` ile `dist/sitemap.xml` üretir. Supabase değişkenleri tanımlıysa gerçek istasyonların `/istasyon/:slug` sayfaları da sitemap'e eklenir; Supabase'e ulaşılamazsa derleme bozulmaz.

## İstasyon verisi aktarma

Betik: `scripts/istasyon-aktar.mjs` (ayrıntılı açıklama dosyanın başında). CSV şablonu: `scripts/istasyon-sablonu.csv`.

```bash
# 1) Önce kuru çalıştırma: hiçbir şey yazmaz, özet + aktarim-onizleme.json üretir
npm run istasyon:aktar -- --csv istasyonlar.csv --kuru
npm run istasyon:aktar -- --ocm --env gizli.env --kuru     # gizli.env içinde OCM_API_KEY=...

# 2) Gerçek aktarım (yalnızca kendi bilgisayarınızda)
#    gizli.env: SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...
npm run istasyon:aktar -- --csv istasyonlar.csv --env gizli.env
```

- Betik veri silmez; aynı kaynaktan (`source` + `source_id`) gelen istasyonları günceller ve soketlerini yeniler. Mevcut istasyonların adresleri (slug) değişmez.
- `SUPABASE_SERVICE_ROLE_KEY` tam yetkili bir anahtardır: repoya, Netlify'a veya tarayıcı koduna asla eklemeyin.
- Open Charge Map verisi **CC BY 4.0** lisanslıdır; harita ve istasyon sayfalarında atıf otomatik gösterilir.

## Netlify

- Build komutu: `npm run build`
- Yayın klasörü: `dist`
- `public/_redirects` dosyası SPA yönlendirmesini ve eski `/sarcj-haritasi` adresinin `/sarj-haritasi`ya 301 yönlendirmesini yapar.

## Klasör yapısı

```
src/
  components/      Ana sayfa bölümleri ve ortak bileşenler
  components/ComingSoon/   "Çok Yakında" sayfası
  pages/           Sayfalar (şarj haritası, istasyon detayı /istasyon/:slug, yasal metinler)
  data/            Haberler ve örnek istasyon verisi
  lib/             Supabase istemcisi ve yapılandırma
supabase/migrations/       Veritabanı şeması (SQL)
scripts/           Veri aktarım ve sitemap betikleri
public/            Statik dosyalar (_redirects, robots.txt, favicon)
```

## Veritabanı (Supabase)

Şema `supabase/migrations/` altındadır:

| Tablo | İçerik |
| --- | --- |
| `operators` | Şarj ağları / operatörler |
| `stations` | İstasyonlar (konum, adres, operatör, veri kaynağı) |
| `connectors` | İstasyondaki soketler (tip, AC/DC, güç, adet) |

Tüm tablolarda RLS açıktır; herkes yalnızca **okuyabilir**. Yazma işlemleri yalnızca `service_role` anahtarıyla çalışan aktarım betikleriyle yapılır.

Migration'ları uygulamak için (proje sahibi):

```bash
supabase link --project-ref <proje-ref>
supabase db push
```

veya dosyaları Supabase panelindeki **SQL Editor**'de sırayla çalıştırın.

Harita (`/sarj-haritasi`) önce Supabase'deki `stations` tablosunu okur. Tablo yoksa, boşsa veya Supabase yapılandırılmamışsa açıkça etiketlenmiş örnek veriyi gösterir.

## Veri notu

Haritadaki örnek istasyonlar (kurgusal "Örnek Operatör A/B/C") ve ana sayfadaki haberler **örnek veridir** ve sitede bu şekilde etiketlenmiştir. Gerçek istasyon verisi Faz 1 kapsamında eklenecektir.
