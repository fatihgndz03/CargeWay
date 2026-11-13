#!/usr/bin/env node
/**
 * dist/sitemap.xml üretir. `npm run build` sonrasında otomatik çalışır.
 *
 * - Sabit sayfalar her zaman eklenir.
 * - VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY tanımlıysa (Netlify ortamı),
 *   Supabase'deki gerçek (is_sample = false) istasyonların /istasyon/:slug sayfaları da eklenir.
 * - Supabase'e ulaşılamazsa derleme BOZULMAZ; yalnızca sabit sayfalarla devam edilir.
 * - "Çok Yakında" modunda (VITE_SHOW_COMING_SOON=true) yalnızca ana sayfa eklenir.
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';

const SITE = (process.env.SITE_URL || 'https://cargeway.com').replace(/\/+$/, '');
const STATIC_PATHS = ['/', '/sarj-haritasi', '/araclar', '/kvkk', '/gizlilik', '/cerezler'];

function xmlEscape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function stationEntries() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const db = createClient(url, key, { auth: { persistSession: false } });
    const out = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await db
        .from('stations')
        .select('slug, updated_at')
        .eq('is_sample', false)
        .order('slug')
        .range(from, from + 999);
      if (error) throw error;
      out.push(...data.map((r) => ({ path: `/istasyon/${r.slug}`, lastmod: r.updated_at?.slice(0, 10) })));
      if (data.length < 1000) break;
    }
    return out;
  } catch (e) {
    console.warn(`sitemap: istasyonlar alınamadı, yalnızca sabit sayfalar eklenecek (${e.message ?? e})`);
    return [];
  }
}

async function main() {
  const comingSoon = process.env.VITE_SHOW_COMING_SOON === 'true';
  const entries = comingSoon ? [{ path: '/' }] : [...STATIC_PATHS.map((path) => ({ path })), ...(await stationEntries())];

  const body = entries
    .map(
      (e) =>
        `  <url><loc>${xmlEscape(SITE + e.path)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  if (!existsSync('dist')) mkdirSync('dist');
  writeFileSync('dist/sitemap.xml', xml);
  console.log(`sitemap: ${entries.length} adres yazıldı → dist/sitemap.xml`);
}

main();
