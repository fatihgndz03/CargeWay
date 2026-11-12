#!/usr/bin/env node
/**
 * CargeWay istasyon aktarım betiği
 * ---------------------------------
 * Şarj istasyonu verisini CSV dosyasından veya Open Charge Map'ten okuyup
 * Supabase'deki operators / stations / connectors tablolarına yazar.
 *
 * Kullanım (önce `npm ci`):
 *
 *   # 1) Kuru çalıştırma: hiçbir şey yazmaz, ne aktarılacağını özetler ve JSON'a döker
 *   node scripts/istasyon-aktar.mjs --csv veriler/istasyonlar/zes.csv --kuru
 *   node scripts/istasyon-aktar.mjs --ocm --kuru            (OCM_API_KEY gerekir)
 *
 *   # 2) Gerçek aktarım (SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekir)
 *   node scripts/istasyon-aktar.mjs --csv veriler/istasyonlar/zes.csv
 *
 * Seçenekler:
 *   --csv <dosya>        CSV dosyası (birden fazla verilebilir)
 *   --ocm                Open Charge Map'ten Türkiye verisini çek (OCM_API_KEY ortam değişkeni)
 *   --ocm-dosya <dosya>  Daha önce indirilmiş OCM JSON yanıtını kullan (API'ye gitmez)
 *   --kaynak-etiketi <x> CSV için kaynak etiketi (varsayılan: csv:<dosya adı>)
 *   --kuru               Veritabanına yazma; özet + aktarim-onizleme.json üret
 *   --env <dosya>        Ortam değişkenlerini bu dosyadan oku (ör. veriler/gizli.env)
 *
 * Gizli anahtarlar yalnızca ortam değişkeninden / --env dosyasından okunur;
 * asla repoya eklenmemelidir. Bu betik veri SİLMEZ: yalnızca ekler/günceller
 * (aynı kaynaktan gelen istasyonun soketleri yenilenir).
 *
 * CSV biçimi (ilk satır başlık; ayraç , veya ; otomatik algılanır; UTF-8):
 *   operator,istasyon_adi,adres,il,ilce,enlem,boylam,soket,akim,guc_kw,adet,calisma_saatleri,kaynak_id,operator_web
 * Her satır bir soket grubudur. Aynı istasyonun birden çok soketi için satırı
 * tekrarlayın (kaynak_id aynı olsun; kaynak_id yoksa operator+ad+koordinat ile eşlenir).
 *   soket: type2 | ccs2 | chademo | type1 | ccs1 | gbt | schuko | tesla | other
 *          (ayrıca "Type 2", "CCS", "CHAdeMO" gibi yazımlar da tanınır)
 *   akim : AC | DC (boşsa soket tipinden tahmin edilir)
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { basename } from 'node:path';

// ---------------------------------------------------------------------------
// Argümanlar ve ortam
// ---------------------------------------------------------------------------

export function parseArgs(argv) {
  const args = { csv: [], ocm: false, ocmDosya: null, kuru: false, env: null, kaynakEtiketi: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--csv') args.csv.push(argv[++i]);
    else if (a === '--ocm') args.ocm = true;
    else if (a === '--ocm-dosya') args.ocmDosya = argv[++i];
    else if (a === '--kuru') args.kuru = true;
    else if (a === '--env') args.env = argv[++i];
    else if (a === '--kaynak-etiketi') args.kaynakEtiketi = argv[++i];
    else if (a === '-h' || a === '--help') args.help = true;
    else throw new Error(`Bilinmeyen seçenek: ${a}`);
  }
  return args;
}

function loadEnvFile(path) {
  if (!path || !existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
}

// ---------------------------------------------------------------------------
// Yardımcılar
// ---------------------------------------------------------------------------

const TR_MAP = { ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u' };

export function slugify(text) {
  return String(text ?? '')
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (c) => TR_MAP[c])
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

/** Basit ama tırnak destekli CSV ayrıştırıcı. */
export function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const firstLine = text.split(/\r?\n/, 1)[0];
  const delim = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';
  const rows = [];
  let row = [];
  let field = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === delim) {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== '')) rows.push(row);
  if (!rows.length) return [];
  const header = rows[0].map((h) => slugify(h).replace(/-/g, '_'));
  return rows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

function num(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function normalizeConnector(raw) {
  const s = String(raw ?? '').toLowerCase().replace(/[\s_/-]+/g, '');
  if (!s) return 'other';
  if (s.includes('chademo')) return 'chademo';
  if (s.includes('ccs1') || s.includes('combo1')) return 'ccs1';
  if (s.includes('ccs') || s.includes('combo')) return 'ccs2';
  if (s.includes('gbt') || s === 'gb') return 'gbt';
  if (s.includes('type1') || s.includes('tip1') || s.includes('j1772')) return 'type1';
  if (s.includes('type2') || s.includes('tip2') || s.includes('mennekes') || s.includes('iec62196')) return 'type2';
  if (s.includes('schuko') || s.includes('cee77')) return 'schuko';
  if (s.includes('tesla') || s.includes('nacs')) return 'tesla';
  if (['type2', 'ccs2', 'chademo', 'type1', 'ccs1', 'gbt', 'schuko', 'tesla', 'other'].includes(s)) return s;
  return 'other';
}

function guessCurrent(connectorType) {
  return ['ccs2', 'ccs1', 'chademo', 'gbt'].includes(connectorType) ? 'DC' : 'AC';
}

function validLatLng(lat, lng) {
  // Türkiye sınırları (biraz pay ile)
  return lat !== null && lng !== null && lat >= 35.5 && lat <= 42.5 && lng >= 25.5 && lng <= 45.0;
}

// ---------------------------------------------------------------------------
// Kaynak: CSV
// ---------------------------------------------------------------------------

/**
 * @returns {{ operators: Map<string, object>, stations: object[], warnings: string[] }}
 */
export function fromCsv(text, sourceTag) {
  const rows = parseCsv(text);
  const warnings = [];
  const operators = new Map();
  const stationsByKey = new Map();

  rows.forEach((r, idx) => {
    const line = idx + 2;
    const lat = num(r.enlem ?? r.latitude ?? r.lat);
    const lng = num(r.boylam ?? r.longitude ?? r.lng ?? r.lon);
    const name = r.istasyon_adi || r.ad || r.name;
    if (!name) return warnings.push(`Satır ${line}: istasyon adı yok, atlandı.`);
    if (!validLatLng(lat, lng)) return warnings.push(`Satır ${line}: geçersiz/Türkiye dışı koordinat (${r.enlem}, ${r.boylam}), atlandı.`);

    const opName = r.operator || r.operator_adi || '';
    const opSlug = opName ? slugify(opName) : null;
    if (opSlug && !operators.has(opSlug)) {
      operators.set(opSlug, { slug: opSlug, name: opName, website: r.operator_web || null });
    }

    const key = r.kaynak_id || `${opSlug}|${name}|${lat.toFixed(5)}|${lng.toFixed(5)}`;
    let st = stationsByKey.get(key);
    if (!st) {
      st = {
        source: sourceTag,
        source_id: r.kaynak_id || slugify(`${opSlug ?? 'op'}-${name}-${lat.toFixed(5)}-${lng.toFixed(5)}`),
        operator_slug: opSlug,
        name,
        address: r.adres || null,
        city: r.il || null,
        district: r.ilce || null,
        latitude: lat,
        longitude: lng,
        opening_hours: r.calisma_saatleri || null,
        access_type: 'public',
        status: 'unknown',
        source_updated_at: null,
        connectors: [],
      };
      stationsByKey.set(key, st);
    }

    if (r.soket || r.guc_kw) {
      const connector_type = normalizeConnector(r.soket);
      const akim = String(r.akim || '').toUpperCase();
      st.connectors.push({
        connector_type,
        current_type: akim === 'AC' || akim === 'DC' ? akim : guessCurrent(connector_type),
        power_kw: num(r.guc_kw),
        quantity: Math.max(1, Math.round(num(r.adet) ?? 1)),
      });
    }
  });

  return { operators, stations: [...stationsByKey.values()], warnings };
}

// ---------------------------------------------------------------------------
// Kaynak: Open Charge Map (lisans: CC BY 4.0 — sitede atıf gerekir)
// ---------------------------------------------------------------------------

// OCM ConnectionTypeID → CargeWay soket tipi (bilinmeyenler 'other' ya da başlıktan tahmin)
const OCM_CONNECTION = {
  1: 'type1',
  2: 'chademo',
  25: 'type2',
  1036: 'type2',
  32: 'ccs1',
  33: 'ccs2',
  28: 'schuko',
  27: 'tesla',
  30: 'tesla',
};

export function fromOcm(pois) {
  const operators = new Map();
  const stations = [];
  const warnings = [];

  for (const p of pois) {
    const a = p.AddressInfo || {};
    const lat = num(a.Latitude);
    const lng = num(a.Longitude);
    if (!validLatLng(lat, lng)) {
      warnings.push(`OCM #${p.ID}: Türkiye dışı/geçersiz koordinat, atlandı.`);
      continue;
    }
    const op = p.OperatorInfo;
    let opSlug = null;
    // OCM'de ID 1 = "(Unknown Operator)", 45 = "(Private Residence/Individual)"
    if (op && op.Title && ![1, 45].includes(op.ID)) {
      opSlug = slugify(op.Title.replace(/\(.*?\)/g, ''));
      if (opSlug && !operators.has(opSlug)) {
        operators.set(opSlug, { slug: opSlug, name: op.Title.trim(), website: op.WebsiteURL || null });
      }
    }

    const connectors = [];
    for (const c of p.Connections || []) {
      const t = c.ConnectionType || {};
      const connector_type = OCM_CONNECTION[c.ConnectionTypeID] ?? normalizeConnector(t.Title);
      const current_type =
        c.CurrentTypeID === 30 ? 'DC' : c.CurrentTypeID === 10 || c.CurrentTypeID === 20 ? 'AC' : guessCurrent(connector_type);
      const power = num(c.PowerKW);
      connectors.push({
        connector_type,
        current_type,
        power_kw: power && power > 0 ? power : null,
        quantity: Math.max(1, num(c.Quantity) ?? 1),
      });
    }

    const st = p.StatusType;
    const status = st ? (st.IsOperational === true ? 'operational' : st.IsOperational === false ? 'out_of_service' : 'unknown') : 'unknown';
    const usage = p.UsageType;
    const access_type = usage ? (usage.IsPublic === false ? 'private' : usage.IsMembershipRequired || usage.IsAccessKeyRequired ? 'restricted' : 'public') : 'public';

    stations.push({
      source: 'ocm',
      source_id: String(p.ID),
      operator_slug: opSlug,
      name: (a.Title || `Şarj istasyonu #${p.ID}`).trim(),
      address: [a.AddressLine1, a.AddressLine2].filter(Boolean).join(', ') || null,
      city: a.StateOrProvince || a.Town || null,
      district: a.StateOrProvince && a.Town && a.Town !== a.StateOrProvince ? a.Town : null,
      latitude: lat,
      longitude: lng,
      opening_hours: a.AccessComments || null,
      access_type,
      status,
      source_updated_at: p.DateLastStatusUpdate || p.DateLastVerified || null,
      connectors,
    });
  }
  return { operators, stations, warnings };
}

async function fetchOcm(apiKey) {
  const url =
    'https://api.openchargemap.io/v3/poi/?output=json&countrycode=TR&maxresults=20000&compact=false&verbose=false';
  const res = await fetch(url, { headers: { 'X-API-Key': apiKey, 'User-Agent': 'CargeWay-aktarim/1.0' } });
  if (!res.ok) throw new Error(`Open Charge Map isteği başarısız: HTTP ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Slug üretimi ve birleştirme
// ---------------------------------------------------------------------------

export function assignSlugs(stations, takenSlugs = new Set()) {
  const used = new Set(takenSlugs);
  for (const s of stations) {
    const base = slugify([s.operator_slug, s.name, s.district || s.city].filter(Boolean).join(' ')) || 'istasyon';
    let slug = base;
    let n = 2;
    while (used.has(slug)) slug = `${base}-${n++}`;
    used.add(slug);
    s.slug = slug;
  }
  return stations;
}

// ---------------------------------------------------------------------------
// Supabase'e yazma
// ---------------------------------------------------------------------------

async function writeToSupabase({ operators, stations }) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL (veya VITE_SUPABASE_URL) ve SUPABASE_SERVICE_ROLE_KEY gerekli. ' +
        'service_role anahtarını yalnızca kendi bilgisayarınızda kullanın, asla repoya veya Netlify ortamına eklemeyin.'
    );
  }
  const { createClient } = await import('@supabase/supabase-js');
  const db = createClient(url, key, { auth: { persistSession: false } });

  // 1) Operatörler (slug'a göre ekle/güncelle)
  const opRows = [...operators.values()];
  const opIds = new Map();
  if (opRows.length) {
    const { data, error } = await db.from('operators').upsert(opRows, { onConflict: 'slug' }).select('id, slug');
    if (error) throw new Error(`operators: ${error.message}`);
    data.forEach((o) => opIds.set(o.slug, o.id));
  }

  // 2) Mevcut slug'lar (başka kaynaktan gelen istasyonlarla çakışmasın) ve mevcut kayıtların slug'ları korunur
  const existing = new Map(); // `${source}|${source_id}` -> slug
  const taken = new Set();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from('stations').select('slug, source, source_id').range(from, from + 999);
    if (error) throw new Error(`stations okuma: ${error.message}`);
    data.forEach((r) => {
      taken.add(r.slug);
      if (r.source_id) existing.set(`${r.source}|${r.source_id}`, r.slug);
    });
    if (data.length < 1000) break;
  }
  const fresh = [];
  for (const s of stations) {
    const prev = existing.get(`${s.source}|${s.source_id}`);
    if (prev) s.slug = prev; // adres (URL) değişmesin
    else fresh.push(s);
  }
  assignSlugs(fresh, taken);

  // 3) İstasyonlar + soketler (parça parça)
  let written = 0;
  const BATCH = 500;
  for (let i = 0; i < stations.length; i += BATCH) {
    const chunk = stations.slice(i, i + BATCH);
    const rows = chunk.map((s) => ({
      slug: s.slug,
      operator_id: s.operator_slug ? opIds.get(s.operator_slug) ?? null : null,
      name: s.name,
      address: s.address,
      city: s.city,
      district: s.district,
      latitude: s.latitude,
      longitude: s.longitude,
      access_type: s.access_type,
      opening_hours: s.opening_hours,
      status: s.status,
      source: s.source,
      source_id: s.source_id,
      source_updated_at: s.source_updated_at,
      is_sample: false,
    }));
    const { data, error } = await db.from('stations').upsert(rows, { onConflict: 'source,source_id' }).select('id, source_id');
    if (error) throw new Error(`stations: ${error.message}`);
    const idBySource = new Map(data.map((r) => [r.source_id, r.id]));
    const ids = [...idBySource.values()];

    // Bu istasyonların soketlerini yenile (yalnızca bu partideki istasyonlar)
    const del = await db.from('connectors').delete().in('station_id', ids);
    if (del.error) throw new Error(`connectors silme: ${del.error.message}`);
    const conRows = chunk.flatMap((s) =>
      s.connectors.map((c) => ({ ...c, station_id: idBySource.get(s.source_id) }))
    );
    if (conRows.length) {
      const ins = await db.from('connectors').insert(conRows);
      if (ins.error) throw new Error(`connectors: ${ins.error.message}`);
    }
    written += chunk.length;
    console.log(`  ${written}/${stations.length} istasyon yazıldı`);
  }
}

// ---------------------------------------------------------------------------
// Ana akış
// ---------------------------------------------------------------------------

function summarize({ operators, stations, warnings }) {
  const conn = stations.reduce((n, s) => n + s.connectors.length, 0);
  const dc = stations.filter((s) => s.connectors.some((c) => c.current_type === 'DC')).length;
  const cities = new Set(stations.map((s) => s.city).filter(Boolean));
  console.log(`\nÖzet:`);
  console.log(`  Operatör      : ${operators.size}`);
  console.log(`  İstasyon      : ${stations.length} (DC soketli: ${dc})`);
  console.log(`  Soket grubu   : ${conn}`);
  console.log(`  İl sayısı     : ${cities.size}`);
  if (warnings.length) {
    console.log(`  Uyarı         : ${warnings.length} (ilk 10'u aşağıda)`);
    warnings.slice(0, 10).forEach((w) => console.log(`    - ${w}`));
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || (!args.csv.length && !args.ocm && !args.ocmDosya)) {
    console.log(readFileSync(new URL(import.meta.url)).toString().split('*/')[0]);
    return;
  }
  loadEnvFile(args.env);

  const all = { operators: new Map(), stations: [], warnings: [] };
  const merge = (r) => {
    r.operators.forEach((v, k) => all.operators.set(k, v));
    all.stations.push(...r.stations);
    all.warnings.push(...r.warnings);
  };

  for (const file of args.csv) {
    const tag = args.kaynakEtiketi || `csv:${basename(file).replace(/\.[^.]+$/, '')}`;
    console.log(`CSV okunuyor: ${file} (kaynak: ${tag})`);
    merge(fromCsv(readFileSync(file, 'utf8'), tag));
  }
  if (args.ocmDosya) {
    console.log(`OCM dosyası okunuyor: ${args.ocmDosya}`);
    merge(fromOcm(JSON.parse(readFileSync(args.ocmDosya, 'utf8'))));
  } else if (args.ocm) {
    const key = process.env.OCM_API_KEY;
    if (!key) throw new Error('OCM_API_KEY tanımlı değil (ör. --env veriler/gizli.env).');
    console.log('Open Charge Map\'ten Türkiye verisi indiriliyor…');
    const pois = await fetchOcm(key);
    writeFileSync('ocm-tr-ham.json', JSON.stringify(pois));
    console.log(`  ${pois.length} kayıt indirildi (ocm-tr-ham.json olarak kaydedildi)`);
    merge(fromOcm(pois));
  }

  summarize(all);

  if (args.kuru) {
    assignSlugs(all.stations);
    const out = {
      operators: [...all.operators.values()],
      stations: all.stations,
      warnings: all.warnings,
    };
    writeFileSync('aktarim-onizleme.json', JSON.stringify(out, null, 2));
    console.log('\nKuru çalıştırma: veritabanına yazılmadı. Önizleme: aktarim-onizleme.json');
    return;
  }

  console.log('\nSupabase\'e yazılıyor…');
  await writeToSupabase(all);
  console.log('Tamamlandı.');
}

const isMain = process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]));
if (isMain) {
  main().catch((e) => {
    console.error(`\nHATA: ${e.message}`);
    process.exit(1);
  });
}
