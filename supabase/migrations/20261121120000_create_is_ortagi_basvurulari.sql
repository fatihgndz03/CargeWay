/*
  # Kurulumcu firma (iş ortağı) başvuruları

  ## Amaç
  /is-ortagi-ol sayfasındaki formdan gelen, şarj ünitesi kurulumu yapan firmaların
  CargeWay ile çalışma başvurularını saklar. Kurulum taleplerinden (kurulum_talepleri)
  tamamen ayrı bir tablodur.

  ## Güvenlik
  - RLS açık.
  - anon / authenticated yalnızca INSERT yapabilir (aydınlatma metni onayı true olmak zorunda,
    durum 'yeni' olmak zorunda, iç kullanım alanları boş olmak zorunda).
  - SELECT / UPDATE / DELETE politikası yok: başvuruları yalnızca proje sahibi
    (Supabase paneli veya service_role) görebilir.
  - Uzunluk, biçim ve seçenek kontrolleri CHECK kısıtlarıyla veritabanında da yapılır.

  ## Not
  Bu migration canlı veritabanına otomatik uygulanmaz; proje sahibi Supabase
  SQL Editor'de çalıştırmalı veya `supabase db push` kullanmalıdır.
*/

CREATE TABLE IF NOT EXISTS is_ortagi_basvurulari (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            timestamptz NOT NULL DEFAULT now(),
  durum                 text NOT NULL DEFAULT 'yeni'
                        CHECK (durum IN ('yeni', 'inceleniyor', 'gorusuldu', 'anlasildi', 'reddedildi')),

  -- Firma
  firma_adi             text NOT NULL CHECK (char_length(firma_adi) BETWEEN 2 AND 120),
  web_sitesi            text CHECK (web_sitesi IS NULL OR (char_length(web_sitesi) <= 200 AND web_sitesi ~* '^(https?://)?[a-z0-9.-]+\.[a-z]{2,}(/.*)?$')),
  yetki_belgeleri       text[] NOT NULL
                        CHECK (
                          cardinality(yetki_belgeleri) BETWEEN 1 AND 5
                          AND yetki_belgeleri <@ ARRAY['smm', 'tesisat-yetki', 'uretici-yetkili', 'diger']::text[]
                        ),
  yetki_aciklama        text CHECK (char_length(yetki_aciklama) <= 300),

  -- Hizmet
  hizmet_illeri         text[] NOT NULL
                        CHECK (
                          cardinality(hizmet_illeri) BETWEEN 1 AND 81
                          AND char_length(array_to_string(hizmet_illeri, ',')) <= 2000
                        ),
  hizmet_turleri        text[] NOT NULL
                        CHECK (
                          cardinality(hizmet_turleri) BETWEEN 1 AND 3
                          AND hizmet_turleri <@ ARRAY['ev', 'apartman-site', 'isyeri-otopark']::text[]
                        ),
  yillik_kurulum        text CHECK (yillik_kurulum IN ('0-10', '10-50', '50-200', '200+', 'belirtilmedi')),

  -- İletişim
  yetkili_ad            text NOT NULL CHECK (char_length(yetkili_ad) BETWEEN 2 AND 80),
  telefon               text NOT NULL CHECK (telefon ~ '^[0-9 +()-]{10,20}$'),
  eposta                text NOT NULL CHECK (eposta ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND char_length(eposta) <= 120),
  not_metni             text CHECK (char_length(not_metni) <= 1000),

  -- Aydınlatma metni onayı
  kvkk_onay             boolean NOT NULL,
  onay_metni_surumu     text NOT NULL CHECK (char_length(onay_metni_surumu) <= 20),

  -- İç kullanım (form tarafından doldurulmaz)
  ic_not                text
);

CREATE INDEX IF NOT EXISTS is_ortagi_basvurulari_created_idx ON is_ortagi_basvurulari (created_at DESC);
CREATE INDEX IF NOT EXISTS is_ortagi_basvurulari_durum_idx ON is_ortagi_basvurulari (durum);

ALTER TABLE is_ortagi_basvurulari ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes iş ortaklığı başvurusu gönderebilir" ON is_ortagi_basvurulari;
CREATE POLICY "Herkes iş ortaklığı başvurusu gönderebilir"
  ON is_ortagi_basvurulari
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    kvkk_onay = true
    AND durum = 'yeni'
    AND ic_not IS NULL
  );
