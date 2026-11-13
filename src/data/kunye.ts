/**
 * Site sahibi / veri sorumlusu bilgileri (5651 sayılı Kanun m.3 tanıtıcı bilgiler + KVKK).
 * Köşeli parantezli alanlar doldurulmadan site bakım modundan çıkarılmamalı.
 * Doldurunca KUNYE_TAMAM otomatik olarak true olur ve "eksik bilgi" uyarısı kalkar.
 */
export const KUNYE = {
  /** Şahıs ise ad soyad, şirket ise ticaret unvanı */
  siteSahibi: '[Site sahibinin adı soyadı / ticaret unvanı]',
  /** Tebligat adresi (şahıs için iş adresi olabilir) */
  adres: '[Açık adres]',
  /** Başvuru ve iletişim e-postası */
  eposta: '[iletişim e-posta adresi]',
  /** Şirketse MERSİS / vergi no (isteğe bağlı) */
  sicil: '',
  /** Barındırma (yer sağlayıcı) */
  yerSaglayici: 'Vercel Inc. (vercel.com)',
};

export const KUNYE_TAMAM = !Object.values(KUNYE).some((v) => v.includes('['));
