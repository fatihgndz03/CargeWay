/*
  # Yönetim görünümleri (yalnızca proje sahibi için)

  ## Amaç
  Supabase panelinde (Table Editor / SQL Editor) talepleri ve kurulum firmalarını
  eşleştirmeyi kolaylaştıran iki salt okunur görünüm:

  1. `yonetim_il_ozeti`
     İl bazında: toplam / yeni / açık kurulum talebi sayısı, son talep tarihi,
     o ile hizmet veren anlaşmalı firma sayısı ve bekleyen firma başvurusu sayısı.
     → Hangi illerde talep var ama anlaşmalı firma yok, bir bakışta görülür.

  2. `yonetim_acik_talep_eslesme`
     Durumu 'yeni' veya 'iletildi' olan her kurulum talebi için; talebin iline VE
     mekân tipine hizmet veren, durumu 'anlasildi' olan firmalar (ad + telefon).
     Eşleşen firma yoksa `uygun_firmalar` boş dizi, `uygun_firma_sayisi` 0'dır.

  "Anlaşmalı firma" = is_ortagi_basvurulari.durum = 'anlasildi'. Bu durumu yalnızca
  yazılı anlaşma (ve kişisel veri paylaşımı hükümleri) yapıldıktan sonra elle verin.

  ## Güvenlik
  - Görünümler `security_invoker = true` ile oluşturulur: sorgulayanın yetkileri ve
    alttaki tabloların RLS kuralları geçerli olur (anonim kullanıcı tablolardan
    okuyamadığı için görünümlerden de okuyamaz).
  - Ek önlem: anon ve authenticated rollerinden tüm yetkiler geri alınır.
  - Kişisel veri içerir; yalnızca panelden / service_role ile kullanın.

  ## Not
  Bu migration canlı veritabanına otomatik uygulanmaz. Önce
  20261119120000_create_kurulum_talepleri.sql ve
  20261121120000_create_is_ortagi_basvurulari.sql uygulanmış olmalıdır.
  Gereken PostgreSQL sürümü: 15+ (Supabase varsayılanı).
*/

CREATE OR REPLACE VIEW yonetim_il_ozeti
WITH (security_invoker = true)
AS
WITH talepler AS (
  SELECT
    il,
    count(*)                                              AS toplam_talep,
    count(*) FILTER (WHERE durum = 'yeni')                AS yeni_talep,
    count(*) FILTER (WHERE durum IN ('yeni', 'iletildi')) AS acik_talep,
    max(created_at)                                       AS son_talep
  FROM kurulum_talepleri
  GROUP BY il
),
firmalar AS (
  SELECT
    il,
    count(*) FILTER (WHERE b.durum = 'anlasildi')                          AS anlasmali_firma,
    count(*) FILTER (WHERE b.durum IN ('yeni', 'inceleniyor', 'gorusuldu')) AS bekleyen_basvuru
  FROM is_ortagi_basvurulari b
  CROSS JOIN LATERAL unnest(b.hizmet_illeri) AS il
  GROUP BY il
)
SELECT
  coalesce(t.il, f.il)                AS il,
  coalesce(t.toplam_talep, 0)         AS toplam_talep,
  coalesce(t.yeni_talep, 0)           AS yeni_talep,
  coalesce(t.acik_talep, 0)           AS acik_talep,
  t.son_talep,
  coalesce(f.anlasmali_firma, 0)      AS anlasmali_firma,
  coalesce(f.bekleyen_basvuru, 0)     AS bekleyen_basvuru
FROM talepler t
FULL OUTER JOIN firmalar f ON f.il = t.il
ORDER BY acik_talep DESC, toplam_talep DESC, il;

COMMENT ON VIEW yonetim_il_ozeti IS
  'İl bazında kurulum talebi ve anlaşmalı firma özeti (yalnızca proje sahibi).';

CREATE OR REPLACE VIEW yonetim_acik_talep_eslesme
WITH (security_invoker = true)
AS
SELECT
  t.id            AS talep_id,
  t.created_at,
  t.durum,
  t.il,
  t.ilce,
  t.mekan_tipi,
  t.ad,
  t.telefon,
  t.yonlendirilen_firma,
  coalesce(
    (
      SELECT array_agg(b.firma_adi || ' (' || b.telefon || ')' ORDER BY b.firma_adi)
      FROM is_ortagi_basvurulari b
      WHERE b.durum = 'anlasildi'
        AND t.il = ANY (b.hizmet_illeri)
        AND t.mekan_tipi = ANY (b.hizmet_turleri)
    ),
    ARRAY[]::text[]
  )               AS uygun_firmalar,
  (
    SELECT count(*)
    FROM is_ortagi_basvurulari b
    WHERE b.durum = 'anlasildi'
      AND t.il = ANY (b.hizmet_illeri)
      AND t.mekan_tipi = ANY (b.hizmet_turleri)
  )               AS uygun_firma_sayisi
FROM kurulum_talepleri t
WHERE t.durum IN ('yeni', 'iletildi')
ORDER BY t.created_at;

COMMENT ON VIEW yonetim_acik_talep_eslesme IS
  'Açık kurulum talepleri ve il + mekân tipine göre uygun anlaşmalı firmalar (yalnızca proje sahibi).';

REVOKE ALL ON yonetim_il_ozeti FROM PUBLIC;
REVOKE ALL ON yonetim_acik_talep_eslesme FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON yonetim_il_ozeti FROM anon';
    EXECUTE 'REVOKE ALL ON yonetim_acik_talep_eslesme FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON yonetim_il_ozeti FROM authenticated';
    EXECUTE 'REVOKE ALL ON yonetim_acik_talep_eslesme FROM authenticated';
  END IF;
END $$;
