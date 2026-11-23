/*
  # Şarj ünitesi kurulum talepleri (teklif formu)

  ## Amaç
  /sarj-unitesi-kurulumu sayfasındaki "Teklif al" formundan gelen talepleri saklar.
  Talepler, kullanıcının açık rızasıyla CargeWay'in anlaşmalı kurulum firmalarına iletilir.

  ## Güvenlik
  - RLS açık.
  - anon / authenticated yalnızca INSERT yapabilir (iki onay alanı true olmak zorunda).
  - SELECT / UPDATE / DELETE politikası yok: talepleri yalnızca proje sahibi
    (Supabase paneli veya service_role) görebilir.
  - Basit uzunluk ve biçim kontrolleri CHECK kısıtlarıyla veritabanında da yapılır.

  ## Not
  Bu migration canlı veritabanına otomatik uygulanmaz; proje sahibi Supabase
  SQL Editor'de çalıştırmalı veya `supabase db push` kullanmalıdır.
*/

CREATE TABLE IF NOT EXISTS kurulum_talepleri (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         timestamptz NOT NULL DEFAULT now(),
  durum              text NOT NULL DEFAULT 'yeni'
                     CHECK (durum IN ('yeni', 'iletildi', 'teklif_verildi', 'kazanildi', 'kaybedildi', 'iptal')),

  -- Mekan
  mekan_tipi         text NOT NULL CHECK (mekan_tipi IN ('ev', 'apartman-site', 'isyeri-otopark')),
  otopark_tipi       text CHECK (otopark_tipi IN ('kapali', 'acik', 'mustakil-garaj', 'bilinmiyor')),
  tahmini_mesafe     text CHECK (tahmini_mesafe IN ('0-10', '10-25', '25-50', '50+', 'bilinmiyor')),
  arac_modeli        text CHECK (char_length(arac_modeli) <= 80),
  unite_sayisi       int  CHECK (unite_sayisi BETWEEN 1 AND 200),

  -- Konum
  il                 text NOT NULL CHECK (char_length(il) BETWEEN 2 AND 40),
  ilce               text CHECK (char_length(ilce) <= 60),

  -- İletişim
  ad                 text NOT NULL CHECK (char_length(ad) BETWEEN 2 AND 80),
  telefon            text NOT NULL CHECK (telefon ~ '^[0-9 +()-]{10,20}$'),
  eposta             text CHECK (eposta IS NULL OR eposta ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  not_metni          text CHECK (char_length(not_metni) <= 1000),
  yuk_yonetimi_ilgi  boolean NOT NULL DEFAULT false,  -- akıllı yük yönetimi / ev enerji takibi ilgisi

  -- Onaylar (KVKK m.5/1 açık rıza + aktarım rızası)
  kvkk_onay          boolean NOT NULL,
  paylasim_onay      boolean NOT NULL,
  onay_metni_surumu  text NOT NULL CHECK (char_length(onay_metni_surumu) <= 20),

  -- İç kullanım (form tarafından doldurulmaz)
  yonlendirilen_firma text,
  ic_not             text
);

CREATE INDEX IF NOT EXISTS kurulum_talepleri_created_idx ON kurulum_talepleri (created_at DESC);
CREATE INDEX IF NOT EXISTS kurulum_talepleri_durum_idx ON kurulum_talepleri (durum);

ALTER TABLE kurulum_talepleri ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes talep gönderebilir" ON kurulum_talepleri;
CREATE POLICY "Herkes talep gönderebilir"
  ON kurulum_talepleri
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    kvkk_onay = true
    AND paylasim_onay = true
    AND durum = 'yeni'
    AND yonlendirilen_firma IS NULL
    AND ic_not IS NULL
  );
