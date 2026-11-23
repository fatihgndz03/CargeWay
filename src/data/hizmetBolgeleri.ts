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

/**
 * Azerbaycan'dan gelen teklif talepleri için bilgi notu.
 *
 * VARSAYILAN KAPALI (false): formda Azerbaycan seçildiğinde ek not gösterilmez.
 * true yapılırsa (SORULAR.md Soru 21, seçenek a) ülke olarak Azerbaycan seçen
 * ziyaretçiye "şu an Azerbaycan'da kurulum hizmeti verilemiyor; talebiniz
 * yalnızca ilgi ölçümü için kaydedilir ve hiçbir firmayla paylaşılmaz" notu
 * gösterilir. Talep göndermesi engellenmez.
 *
 * Bu not bir taahhüttür: açıkken Azerbaycan taleplerini hiçbir firmaya iletmeyin.
 */
export const AZERBAYCAN_BILGI_NOTU_ACIK: boolean = false;

/** Seçilen ülke için Azerbaycan bilgi notu gösterilmeli mi? */
export function azerbaycanNotuGoster(ulke: string, acik: boolean = AZERBAYCAN_BILGI_NOTU_ACIK): boolean {
  return acik && ulke === 'AZ';
}
