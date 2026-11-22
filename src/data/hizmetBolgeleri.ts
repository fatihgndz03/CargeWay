import { ILLER } from './iller';

/**
 * Anlaşmalı kurulum firmalarının hizmet verdiği iller.
 *
 * VARSAYILAN KAPALI (null): teklif formunda il uyarısı gösterilmez.
 * Yazılı anlaşma yapılan firmaların hizmet verdiği illeri buraya yazınca
 * (ör. ['İstanbul', 'Kocaeli']) bu iller DIŞINDA bir il seçen ziyaretçiye
 * formda bilgi notu gösterilir. Talep göndermesi engellenmez.
 *
 * İl adları src/data/iller.ts'deki yazımla birebir aynı olmalı.
 * Karar: SORULAR.md Soru 14.
 */
export const HIZMET_VERILEN_ILLER: readonly string[] | null = null;

/** Seçilen ilde anlaşmalı firma yoksa true; liste tanımlı değilse veya il boşsa false. */
export function hizmetDisiIl(il: string, liste: readonly string[] | null = HIZMET_VERILEN_ILLER): boolean {
  if (!liste || !il) return false;
  return !liste.includes(il);
}

/** Geliştirme sırasında yanlış yazılmış il adlarını yakalamak için. */
export function gecersizIller(liste: readonly string[] | null = HIZMET_VERILEN_ILLER): string[] {
  if (!liste) return [];
  const gecerli: readonly string[] = ILLER;
  return liste.filter((x) => !gecerli.includes(x));
}
