/*
  # Kurulum taleplerine ülke ve dil

  Site Türkçe, İngilizce ve Azerbaycanca sunuluyor; teklif formu Türkiye ve Azerbaycan'dan
  talep alabiliyor. Azerbaycan'daki talep potansiyelini ölçmek için her talebin ülkesi ve
  formun doldurulduğu dil saklanır.

  - ulke: 'TR' | 'AZ' (varsayılan 'TR'; eski kayıtlar Türkiye sayılır)
  - dil : 'tr' | 'en' | 'az' (varsayılan 'tr')

  Mevcut INSERT politikası değişmez. Bu migration 20261119120000_create_kurulum_talepleri.sql'den
  SONRA uygulanmalıdır. Canlı veritabanına otomatik uygulanmaz.
*/

ALTER TABLE kurulum_talepleri
  ADD COLUMN IF NOT EXISTS ulke text NOT NULL DEFAULT 'TR' CHECK (ulke IN ('TR', 'AZ')),
  ADD COLUMN IF NOT EXISTS dil  text NOT NULL DEFAULT 'tr' CHECK (dil IN ('tr', 'en', 'az'));

CREATE INDEX IF NOT EXISTS kurulum_talepleri_ulke_idx ON kurulum_talepleri (ulke);
