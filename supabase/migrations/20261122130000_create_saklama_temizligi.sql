/*
  # Saklama süresi dolan kayıtların temizliği (KVKK m.7 — silme / yok etme)

  ## Amaç
  KVKK metnindeki saklama süresi (şimdilik "en fazla 2 yıl") dolan kişisel verileri
  silen tek bir fonksiyon:

    saklama_suresi_dolanlari_temizle(p_sure interval DEFAULT '2 years',
                                     p_kuru boolean  DEFAULT true)

  - `kurulum_talepleri`: created_at + p_sure geçmiş TÜM talepler silinir.
  - `is_ortagi_basvurulari`: created_at + p_sure geçmiş ve durumu 'anlasildi'
    OLMAYAN başvurular silinir (anlaşılan firmalar sözleşme süresince tutulur).
  - `p_kuru = true` (varsayılan) → hiçbir şey silinmez, yalnızca kaç kaydın
    silineceği döner. Gerçek silme için `p_kuru => false` verin.
  - Silme yapıldığında `saklama_temizlik_kaydi` tablosuna tarih ve SAYI yazılır
    (kişisel veri içermez) — "ne zaman, kaç kayıt silindi" kanıtı için.

  Kurulum talebi kaydı tam silinir (anonimleştirme yerine): tablo kısıtları
  (telefon biçimi vb.) anonim değer kabul etmez ve il bazında istatistik için
  ayrıca saklanan bir alan yoktur. İleride istatistik istenirse ayrı bir
  anonim özet tablosu eklenebilir.

  ## Güvenlik
  - Fonksiyon SECURITY INVOKER'dır; PUBLIC / anon / authenticated çalıştıramaz.
    Yalnızca proje sahibi (SQL Editor, postgres rolü) veya service_role çalıştırır.
  - Kayıt tablosunda RLS açık, politika yok → ziyaretçiler okuyamaz.

  ## Otomatik çalıştırma (VARSAYILAN KAPALI)
  Saklama süresi hukukçu tarafından onaylanmadan zamanlama EKLENMEZ.
  Onaydan sonra Supabase → Database → Extensions → pg_cron'u açıp SQL Editor'de:

    SELECT cron.schedule(
      'saklama-temizligi',
      '17 3 * * *',  -- her gün 03:17 (UTC)
      $$SELECT * FROM saklama_suresi_dolanlari_temizle('2 years', false)$$
    );

  Durdurmak için: SELECT cron.unschedule('saklama-temizligi');

  ## Not
  Bu migration canlı veritabanına otomatik uygulanmaz. Önce
  20261119120000_create_kurulum_talepleri.sql ve
  20261121120000_create_is_ortagi_basvurulari.sql uygulanmış olmalıdır.
*/

CREATE TABLE IF NOT EXISTS saklama_temizlik_kaydi (
  id                    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  calisma_zamani        timestamptz NOT NULL DEFAULT now(),
  saklama_suresi        interval NOT NULL,
  silinen_talep         int NOT NULL,
  silinen_basvuru       int NOT NULL
);

ALTER TABLE saklama_temizlik_kaydi ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON saklama_temizlik_kaydi FROM anon, authenticated;

CREATE OR REPLACE FUNCTION saklama_suresi_dolanlari_temizle(
  p_sure interval DEFAULT interval '2 years',
  p_kuru boolean DEFAULT true
)
RETURNS TABLE (kuru_calisma boolean, silinen_talep int, silinen_basvuru int, esik timestamptz)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_esik    timestamptz;
  v_talep   int;
  v_basvuru int;
BEGIN
  -- Yanlışlıkla çok kısa süre verilip yeni kayıtların silinmesini önle.
  IF p_sure IS NULL OR p_sure < interval '30 days' THEN
    RAISE EXCEPTION 'Saklama süresi en az 30 gün olmalı (verilen: %)', p_sure;
  END IF;

  v_esik := now() - p_sure;

  IF p_kuru THEN
    SELECT count(*) INTO v_talep FROM kurulum_talepleri WHERE created_at < v_esik;
    SELECT count(*) INTO v_basvuru FROM is_ortagi_basvurulari
      WHERE created_at < v_esik AND durum <> 'anlasildi';
  ELSE
    WITH s AS (DELETE FROM kurulum_talepleri WHERE created_at < v_esik RETURNING 1)
      SELECT count(*) INTO v_talep FROM s;
    WITH s AS (
      DELETE FROM is_ortagi_basvurulari
      WHERE created_at < v_esik AND durum <> 'anlasildi'
      RETURNING 1
    )
      SELECT count(*) INTO v_basvuru FROM s;

    INSERT INTO saklama_temizlik_kaydi (saklama_suresi, silinen_talep, silinen_basvuru)
    VALUES (p_sure, v_talep, v_basvuru);
  END IF;

  RETURN QUERY SELECT p_kuru, v_talep, v_basvuru, v_esik;
END;
$$;

REVOKE ALL ON FUNCTION saklama_suresi_dolanlari_temizle(interval, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION saklama_suresi_dolanlari_temizle(interval, boolean) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION saklama_suresi_dolanlari_temizle(interval, boolean) TO service_role;
