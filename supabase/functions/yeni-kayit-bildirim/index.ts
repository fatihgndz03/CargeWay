// Supabase Edge Function: yeni kurulum talebi veya iş ortaklığı başvurusu gelince
// site sahibine e-posta gönderir (Resend ile).
//
// Tetikleyici: Supabase → Database → Webhooks. İki webhook aynı fonksiyonu çağırır:
//   1) `kurulum_talepleri` tablosunda INSERT
//   2) `is_ortagi_basvurulari` tablosunda INSERT
// Kurulum adımları: README.md → "Yeni kayıt e-posta bildirimi".
//
// Gerekli gizli değerler (Supabase → Edge Functions → Secrets; KODA YAZMAYIN):
//   WEBHOOK_SECRET   Webhook'lara eklenen `x-webhook-secret` başlığının değeri (uzun rastgele metin)
//   RESEND_API_KEY   Resend API anahtarı (resend.com)
//   BILDIRIM_EPOSTA  Bildirimin gideceği adres
//   GONDEREN_EPOSTA  Gönderen adres (Resend'de doğrulanmış alan adından, ör. bildirim@cargeway.com)
//
// Fonksiyon veritabanını okumaz/yazmaz; yalnızca webhook gövdesindeki kaydı e-postaya çevirir.
// Kişisel veri loglanmaz.

import { DESTEKLENEN_TABLOLAR, epostaHazirla, type Kayit } from './eposta.ts';

declare const Deno: {
  env: { get(ad: string): string | undefined };
  serve(isleyici: (req: Request) => Response | Promise<Response>): unknown;
};

/** Zamanlama saldırılarına karşı sabit süreli karşılaştırma. */
function esit(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let fark = 0;
  for (let i = 0; i < a.length; i++) fark |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return fark === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const gizli = Deno.env.get('WEBHOOK_SECRET') ?? '';
  const gelen = req.headers.get('x-webhook-secret') ?? '';
  if (!gizli || !esit(gelen, gizli)) return new Response('Unauthorized', { status: 401 });

  let yuk: { type?: string; table?: string; record?: Kayit };
  try {
    yuk = await req.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const tablo = String(yuk.table ?? '');
  if (
    yuk.type !== 'INSERT' ||
    !yuk.record ||
    !(DESTEKLENEN_TABLOLAR as readonly string[]).includes(tablo)
  ) {
    return new Response('Yok sayıldı', { status: 200 });
  }

  const eposta = epostaHazirla(tablo, yuk.record);
  if (!eposta) return new Response('Yok sayıldı', { status: 200 });

  const apiKey = Deno.env.get('RESEND_API_KEY');
  const alici = Deno.env.get('BILDIRIM_EPOSTA');
  const gonderen = Deno.env.get('GONDEREN_EPOSTA');
  if (!apiKey || !alici || !gonderen) {
    console.error('RESEND_API_KEY / BILDIRIM_EPOSTA / GONDEREN_EPOSTA tanımlı değil');
    return new Response('Yapılandırma eksik', { status: 500 });
  }

  const yanit = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: gonderen,
      to: [alici],
      subject: eposta.konu,
      html: eposta.html,
      text: eposta.metin,
    }),
  });

  if (!yanit.ok) {
    console.error('E-posta gönderilemedi, tablo:', tablo, 'durum:', yanit.status);
    return new Response('E-posta gönderilemedi', { status: 502 });
  }
  return new Response('ok', { status: 200 });
});
