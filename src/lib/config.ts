/**
 * "Çok Yakında" (bakım) ekranı ne zaman gösterilir?
 *
 * - VITE_SHOW_COMING_SOON=true  → her yerde Çok Yakında
 * - VITE_SHOW_COMING_SOON=false → her yerde tam site
 * - Tanımsızsa: yalnızca canlı alan adında (cargeway.com) Çok Yakında;
 *   Netlify/Vercel önizlemelerinde ve yerelde tam site.
 *
 * Siteyi yeniden açmak için: CANLI_BAKIM_MODU'nu false yapın
 * ya da Vercel'de VITE_SHOW_COMING_SOON=false tanımlayın.
 */
const CANLI_BAKIM_MODU = true;
const CANLI_ALAN_ADLARI = ['cargeway.com', 'www.cargeway.com'];

const ayar = import.meta.env.VITE_SHOW_COMING_SOON;

function hesapla(): boolean {
  if (ayar === 'true') return true;
  if (ayar === 'false') return false;
  if (typeof window === 'undefined') return false;
  return CANLI_BAKIM_MODU && CANLI_ALAN_ADLARI.includes(window.location.hostname);
}

export const SHOW_COMING_SOON = hesapla();
