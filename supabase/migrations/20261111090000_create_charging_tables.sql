/*
  # Şarj haritası tabloları: operators, stations, connectors

  ## Amaç
  Türkiye'deki farklı şarj ağlarının istasyonlarını tek haritada göstermek için
  temel veri modeli. CargeWay yalnızca bilgi gösterir; ödeme/OCPP yoktur.

  ## Tablolar
  - operators  : Şarj ağı / operatör (ZES, Eşarj vb.)
  - stations   : Fiziksel şarj istasyonu (konum, adres, operatör)
  - connectors : İstasyondaki soket grupları (tip, AC/DC, güç, adet)

  ## Güvenlik
  - Tüm tablolarda RLS açık.
  - anon ve authenticated rollerine yalnızca SELECT (herkese okuma).
  - Yazma işlemleri yalnızca service_role ile (RLS'i atlayan aktarım betikleri).

  ## Not
  Bu migration canlı veritabanına otomatik uygulanmaz; proje sahibi tarafından
  Supabase CLI (`supabase db push`) veya SQL Editor ile uygulanmalıdır.
*/

-- Ortak: updated_at alanını otomatik güncelle
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- operators
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operators (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text NOT NULL,
  website     text,
  phone       text,
  app_url     text,
  logo_url    text,
  color       text CHECK (color IS NULL OR color ~ '^#[0-9a-fA-F]{6}$'),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER operators_set_updated_at
  BEFORE UPDATE ON operators
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- stations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  operator_id    uuid REFERENCES operators(id) ON DELETE SET NULL,
  name           text NOT NULL,
  address        text,
  city           text,           -- il
  district       text,           -- ilçe
  latitude       double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude      double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  access_type    text CHECK (access_type IN ('public', 'restricted', 'private')) DEFAULT 'public',
  opening_hours  text,           -- serbest metin, ör. "7/24"
  status         text CHECK (status IN ('operational', 'planned', 'out_of_service', 'unknown')) DEFAULT 'unknown',
  -- Veri kaynağı izlenebilirliği (ör. 'ocm' = Open Charge Map, 'manual', 'csv:zes_2026-11')
  source         text NOT NULL DEFAULT 'manual',
  source_id      text,
  source_updated_at timestamptz,
  is_sample      boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, source_id)
);

CREATE INDEX IF NOT EXISTS stations_operator_idx ON stations (operator_id);
CREATE INDEX IF NOT EXISTS stations_city_idx ON stations (city);
CREATE INDEX IF NOT EXISTS stations_lat_lng_idx ON stations (latitude, longitude);

CREATE TRIGGER stations_set_updated_at
  BEFORE UPDATE ON stations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- connectors
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS connectors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id    uuid NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  connector_type text NOT NULL CHECK (
    connector_type IN ('type2', 'ccs2', 'chademo', 'type1', 'ccs1', 'gbt', 'schuko', 'tesla', 'other')
  ),
  current_type  text NOT NULL CHECK (current_type IN ('AC', 'DC')),
  power_kw      numeric(6, 1) CHECK (power_kw IS NULL OR power_kw > 0),
  quantity      integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS connectors_station_idx ON connectors (station_id);
CREATE INDEX IF NOT EXISTS connectors_type_idx ON connectors (connector_type, current_type);

CREATE TRIGGER connectors_set_updated_at
  BEFORE UPDATE ON connectors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: herkese okuma, yazma yok (service_role RLS'i atlar)
-- ---------------------------------------------------------------------------
ALTER TABLE operators  ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operatörler herkese açık"
  ON operators FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "İstasyonlar herkese açık"
  ON stations FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Soketler herkese açık"
  ON connectors FOR SELECT TO anon, authenticated USING (true);
