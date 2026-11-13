import { useEffect } from 'react';

export const SITE_URL = 'https://cargeway.com';
export const DEFAULT_TITLE = 'CargeWay — Türkiye EV Şarj Haritası';
export const DEFAULT_DESCRIPTION =
  "CargeWay, Türkiye'deki elektrikli araç şarj istasyonlarını tek haritada bir araya getiren bilgi platformudur.";

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function removeMetaTag(attr: 'name' | 'property', key: string) {
  document.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

/** Sayfa başlığı, açıklaması ve sosyal medya (Open Graph / Twitter) etiketlerini ayarlar. */
export function applySeo(title: string, description: string) {
  document.title = title;
  setMetaTag('name', 'description', description);
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
}

/** Bileşen ekrandayken başlık/açıklamayı ayarlar. `noindex` arama motorlarına sayfayı dizine eklememesini söyler. */
export function useSeo(title: string, description: string = DEFAULT_DESCRIPTION, opts?: { noindex?: boolean }) {
  const noindex = opts?.noindex ?? false;
  useEffect(() => {
    applySeo(title, description);
    if (noindex) setMetaTag('name', 'robots', 'noindex');
    return () => {
      if (noindex) removeMetaTag('name', 'robots');
    };
  }, [title, description, noindex]);
}

/** Geçerli adrese göre canonical ve og:url etiketlerini günceller. */
export function applyCanonical(pathname: string) {
  const url = `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`;
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
  setMetaTag('property', 'og:url', url);
}
