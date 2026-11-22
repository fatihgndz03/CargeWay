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

## Şarj ünitesi kurulum talepleri (Teklif al)

`/sarj-unitesi-kurulumu` sayfasındaki form, talepleri Supabase'deki `kurulum_talepleri` tablosuna yazar.

1. Supabase panelinde **SQL Editor**'ü açın ve `supabase/migrations/20261119120000_create_kurulum_talepleri.sql` dosyasının içeriğini çalıştırın.
2. Talepleri **Table Editor → kurulum_talepleri** bölümünden görün. `durum` sütununu (`yeni → iletildi → teklif_verildi → kazanildi/kaybedildi`) ve `yonlendirilen_firma` alanını takip için kullanın.
3. Ziyaretçiler yalnızca talep ekleyebilir; okuma/silme yetkileri yoktur.
4. Supabase ortam değişkenleri tanımlı değilse form "Talepler şu an alınamıyor" mesajı gösterir.

Onay metni değişirse `src/pages/Installation.tsx` içindeki `ONAY_METNI_SURUMU` değerini güncelleyin.

## Kurulum firması (iş ortağı) başvuruları

`/is-ortagi-ol` sayfasındaki form, başvuruları `is_ortagi_basvurulari` tablosuna yazar (`supabase/migrations/20261121120000_create_is_ortagi_basvurulari.sql`). Ziyaretçiler yalnızca başvuru ekleyebilir. Durum: `yeni → inceleniyor → gorusuldu → anlasildi / reddedildi`. **`anlasildi` durumunu yalnızca yazılı anlaşma yapıldıktan sonra verin**; yönetim görünümleri "anlaşmalı firma" olarak bunu sayar.

## Yönetim görünümleri

`supabase/migrations/20261121180000_create_yonetim_gorunumleri.sql` iki salt okunur görünüm ekler (yalnızca Supabase paneli / service_role; ziyaretçiler okuyamaz):

| Görünüm | İçerik |
| --- | --- |
| `yonetim_il_ozeti` | İl bazında toplam / yeni / açık talep, son talep tarihi, anlaşmalı firma ve bekleyen başvuru sayısı |
| `yonetim_acik_talep_eslesme` | Açık (`yeni` / `iletildi`) her talep için iline ve mekân tipine hizmet veren anlaşmalı firmalar |

Supabase → **SQL Editor**'de `select * from yonetim_il_ozeti;` ile kullanın. Önce iki tablo migration'ı uygulanmış olmalı.

## Saklama süresi temizliği (varsayılan kapalı)

`supabase/migrations/20261122130000_create_saklama_temizligi.sql` (canlıya otomatik uygulanmaz) şu fonksiyonu ekler:

```sql
-- Kuru çalıştırma: yalnızca kaç kaydın silineceğini gösterir
select * from saklama_suresi_dolanlari_temizle('2 years');
-- Gerçek silme (geri alınamaz)
select * from saklama_suresi_dolanlari_temizle('2 years', false);
```

- Süresi dolan tüm kurulum talepleri ve `anlasildi` olmayan iş ortağı başvuruları silinir; her gerçek çalışma `saklama_temizlik_kaydi` tablosuna yalnızca tarih + sayı olarak yazılır.
- 30 günden kısa süre reddedilir; anonim/authenticated çalıştıramaz.
- Otomatik (pg_cron) zamanlama, saklama süresi onaylanana kadar **eklenmez**; komut migration dosyasının başında.

## Hizmet verilmeyen il uyarısı (varsayılan kapalı)

`src/data/hizmetBolgeleri.ts` → `HIZMET_VERILEN_ILLER`. `null` iken uyarı yok. Anlaşmalı firmaların illeri yazılınca (ör. `['İstanbul', 'Kocaeli']`) teklif formunda (ülke Türkiye iken) listede olmayan il seçilirse üç dilde bilgi notu çıkar; gönderim engellenmez. Azerbaycan için şimdilik uyarı yok.

## Yeni kayıt e-posta bildirimi

`supabase/functions/yeni-kayit-bildirim` Edge Function'ı, yeni kurulum talebi **veya** iş ortaklığı başvurusu geldiğinde size e-posta gönderir (Resend ile). Veritabanına dokunmaz, kişisel veriyi loglamaz; `x-webhook-secret` başlığı olmayan istekleri reddeder.

1. [resend.com](https://resend.com)'da hesap açın, `cargeway.com` alan adını doğrulayın (DNS kayıtları), bir API anahtarı oluşturun.
2. Gizli değerleri girin (koda yazmayın):
   ```bash
   supabase secrets set WEBHOOK_SECRET=<uzun-rastgele-metin> RESEND_API_KEY=<anahtar> BILDIRIM_EPOSTA=<sizin-adresiniz> GONDEREN_EPOSTA=bildirim@cargeway.com
   ```
3. Fonksiyonu yayınlayın: `supabase functions deploy yeni-kayit-bildirim --no-verify-jwt`
4. Supabase → **Database → Webhooks → Create a new hook** — iki kez, her tablo için bir tane:
   - Tablo `kurulum_talepleri`, olay **Insert**; ikinci webhook'ta tablo `is_ortagi_basvurulari`, olay **Insert**
   - Tür **HTTP Request**, yöntem **POST**, URL `https://<proje-ref>.supabase.co/functions/v1/yeni-kayit-bildirim`
   - HTTP başlığı: `x-webhook-secret: <WEBHOOK_SECRET ile aynı değer>`
5. Önizlemede bir deneme talebi ve bir deneme başvurusu gönderip e-postaların geldiğini kontrol edin; deneme kayıtlarını Table Editor'den silin.

## Diller (TR / EN / AZ)

Site Türkçe (önek yok), İngilizce (`/en`) ve Azerbaycanca (`/az`) sunulur. Sayfa adresleri (slug'lar) tüm dillerde aynıdır.

- Arayüz metinleri: `src/i18n/messages.ts` (Türkçe kaynak; `en` ve `az` aynı yapıyı izler). AZ metinleri yayından önce ana dili Azerbaycan Türkçesi olan biri tarafından gözden geçirilmeli.
- İç bağlantılar `src/components/DilLink.tsx` üzerinden otomatik dil önekli olur; `hreflang` etiketleri otomatik yazılır.
- Haberler, rehberler, ürün rehberi, iş ortağı sayfası ve harita içeriği Türkiye'ye özel ve yalnızca Türkçe; EN/AZ'de bu sayfalarda "yalnızca Türkçe" notu görünür, menüde gösterilmez.
- Teklif formu Türkiye ve Azerbaycan'dan talep alır; her talep `ulke` (TR/AZ) ve `dil` (tr/en/az) ile kaydedilir. Bu sütunlar için `supabase/migrations/20261122120000_add_ulke_dil_to_kurulum_talepleri.sql` migration'ı diğer migration'lardan sonra uygulanmalıdır.
- "Çok Yakında" e-posta kayıtlarının `source` alanı dile göre `coming_soon_tr|en|az` olur.
