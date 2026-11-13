import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

/**
 * Ortam değişkenleri tanımlı değilse ya da hatalıysa null döner; böylece
 * Supabase yapılandırılmadan (veya yanlış yapılandırılsa bile) site açılabilir.
 * Hatalı bir VITE_SUPABASE_URL değeri createClient'ı çökertip sayfayı
 * bembeyaz bırakıyordu.
 */
function olustur(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!/^https?:\/\//i.test(supabaseUrl)) {
    console.error('VITE_SUPABASE_URL geçersiz (https://... ile başlamalı). Supabase devre dışı.');
    return null;
  }
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (hata) {
    console.error('Supabase başlatılamadı, devre dışı bırakıldı:', hata);
    return null;
  }
}

export const supabase: SupabaseClient | null = olustur();
