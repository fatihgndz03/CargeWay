/**
 * Temsili iç mekân (adım 3): döşeme, ön koltuklar, arka sıra, gösterge paneli, direksiyon,
 * orta ekran ve orta konsol. Tamamı kodla üretilir; bilerek sade ve markasızdır
 * (hiçbir üreticinin iç tasarımını, ekran arayüzünü ya da logosunu taklit etmez).
 *
 * Koordinatlar govde.ts ile aynı: +x ön, +y yukarı; sürücü solda (−z).
 */
import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  PointLight,
  Group,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TorusGeometry,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/** Koltuk konumları (göz noktası kamera geçişinde kullanılır). */
export const KOLTUK = {
  onX: 0.15,
  arkaX: -0.98,
  /** Koltuk merkezlerinin |z|'si */
  z: 0.37,
  /** Oturan birinin göz yüksekliği (yaklaşık) */
  gozY: 1.23,
} as const;

function icMalzemeler() {
  return {
    kumas: new MeshStandardMaterial({ color: 0x2a2e33, roughness: 0.92, metalness: 0 }),
    kumasKoyu: new MeshStandardMaterial({ color: 0x1c1f22, roughness: 0.9, metalness: 0 }),
    panel: new MeshStandardMaterial({ color: 0x15171a, roughness: 0.7, metalness: 0.1 }),
    panelAcik: new MeshStandardMaterial({ color: 0x3a3f45, roughness: 0.55, metalness: 0.2 }),
    zemin: new MeshStandardMaterial({ color: 0x101214, roughness: 0.95, metalness: 0 }),
    metal: new MeshStandardMaterial({ color: 0x8d949b, roughness: 0.3, metalness: 0.85 }),
    yesil: new MeshBasicMaterial({ color: 0x22c55e }),
  };
}

/**
 * Orta ekran görüntüsü: tuvalde çizilen genel bir arayüz (üstten araç silüeti + şarj çubuğu).
 * Rakam ya da yazı YOK (sahte veri gösterilmesin diye); yalnızca biçimsel.
 */
function ekranDokusu(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 320;
  const x = c.getContext('2d');
  if (x) {
    x.fillStyle = '#05080a';
    x.fillRect(0, 0, 512, 320);
    // ince ızgara (harita hissi)
    x.strokeStyle = 'rgba(255,255,255,0.05)';
    x.lineWidth = 2;
    for (let i = 0; i < 512; i += 40) {
      x.beginPath();
      x.moveTo(i, 0);
      x.lineTo(i + 80, 320);
      x.stroke();
    }
    // üstten araç silüeti
    x.strokeStyle = 'rgba(229,249,236,0.75)';
    x.lineWidth = 5;
    x.beginPath();
    x.roundRect(186, 70, 140, 74, 30);
    x.stroke();
    x.beginPath();
    x.roundRect(222, 82, 66, 50, 14);
    x.stroke();
    // şarj çubuğu
    x.fillStyle = 'rgba(255,255,255,0.12)';
    x.beginPath();
    x.roundRect(96, 200, 320, 26, 13);
    x.fill();
    x.fillStyle = '#22c55e';
    x.beginPath();
    x.roundRect(96, 200, 210, 26, 13);
    x.fill();
    // şimşek simgesi
    x.fillStyle = '#22c55e';
    x.beginPath();
    x.moveTo(258, 244);
    x.lineTo(240, 278);
    x.lineTo(256, 278);
    x.lineTo(250, 304);
    x.lineTo(274, 266);
    x.lineTo(258, 266);
    x.closePath();
    x.fill();
  }
  const d = new CanvasTexture(c);
  d.colorSpace = SRGBColorSpace;
  return d;
}

function koltuk(m: ReturnType<typeof icMalzemeler>, genislik: number): Group {
  const g = new Group();
  const minder = new Mesh(new RoundedBoxGeometry(0.5, 0.13, genislik, 3, 0.05), m.kumas);
  minder.position.set(0, 0.56, 0);
  minder.rotation.z = 0.06; // ön kenar hafif yukarı
  const sirt = new Mesh(new RoundedBoxGeometry(0.13, 0.62, genislik, 3, 0.05), m.kumas);
  sirt.position.set(-0.26, 0.9, 0);
  sirt.rotation.z = 0.2; // arkaya yatık
  g.add(minder, sirt);
  return g;
}

function basDestegi(m: ReturnType<typeof icMalzemeler>, genislik: number): Mesh {
  const b = new Mesh(new RoundedBoxGeometry(0.1, 0.16, genislik, 3, 0.04), m.kumasKoyu);
  b.rotation.z = 0.2;
  return b;
}

export type IcMekan = {
  kok: Group;
  /** Sahne kapanırken GPU kaynaklarını temizlemek için */
  malzemeler: Material[];
};

export function icMekanOlustur(): IcMekan {
  const m = icMalzemeler();
  const kok = new Group();
  kok.name = 'ic-mekan';

  // Taban
  const taban = new Mesh(new BoxGeometry(2.55, 0.06, 1.62), m.zemin);
  taban.position.set(-0.4, 0.37, 0);
  kok.add(taban);

  // Ön koltuklar
  for (const yon of [1, -1]) {
    const k = koltuk(m, 0.5);
    k.position.set(KOLTUK.onX, 0, yon * KOLTUK.z);
    const b = basDestegi(m, 0.26);
    b.position.set(-0.33, 1.29, 0);
    k.add(b);
    kok.add(k);
  }

  // Arka sıra (tek parça oturak, iki baş desteği)
  const arka = koltuk(m, 1.3);
  arka.position.set(KOLTUK.arkaX, 0, 0);
  for (const yon of [1, -1]) {
    const b = basDestegi(m, 0.24);
    b.position.set(-0.33, 1.27, yon * KOLTUK.z);
    arka.add(b);
  }
  kok.add(arka);

  // Bagaj rafı (arka koltuğun arkası)
  const raf = new Mesh(new BoxGeometry(0.5, 0.03, 1.36), m.panel);
  raf.position.set(-1.62, 1.06, 0);
  kok.add(raf);

  // Orta konsol (ön koltukların arası)
  const konsol = new Mesh(new RoundedBoxGeometry(0.72, 0.2, 0.22, 3, 0.04), m.panel);
  konsol.position.set(0.26, 0.5, 0);
  kok.add(konsol);
  const kolDayama = new Mesh(new RoundedBoxGeometry(0.3, 0.06, 0.2, 3, 0.025), m.kumasKoyu);
  kolDayama.position.set(0.0, 0.63, 0);
  kok.add(kolDayama);

  // Gösterge paneli: alt gövde (geniş) + üst kısım (cam evin içine sığacak kadar dar)
  const panelAlt = new Mesh(new BoxGeometry(0.34, 0.5, 1.62), m.panel);
  panelAlt.position.set(0.94, 0.66, 0);
  const panelUst = new Mesh(new RoundedBoxGeometry(0.32, 0.12, 1.26, 3, 0.04), m.panel);
  panelUst.position.set(0.9, 0.95, 0);
  // Panel boyunca ince yeşil ortam ışığı şeridi
  const serit = new Mesh(new BoxGeometry(0.006, 0.008, 1.2), m.yesil);
  serit.position.set(0.74, 0.885, 0);
  // Panel önündeki açık renkli trim
  const trim = new Mesh(new BoxGeometry(0.02, 0.04, 1.5), m.panelAcik);
  trim.position.set(0.76, 0.84, 0);
  kok.add(panelAlt, panelUst, serit, trim);

  // Orta ekran (yüzü sürücüye/yolcuya dönük, hafif arkaya yatık)
  const ekranDoku = ekranDokusu();
  const ekranMalz = new MeshBasicMaterial({ map: ekranDoku, toneMapped: false });
  const cerceve = new Mesh(new BoxGeometry(0.02, 0.18, 0.29), m.panel);
  const ekran = new Mesh(new PlaneGeometry(0.27, 0.165), ekranMalz);
  ekran.rotation.y = -Math.PI / 2; // -x yönüne (içeri) baksın
  ekran.position.x = -0.011;
  const ekranGrup = new Group();
  ekranGrup.add(cerceve, ekran);
  ekranGrup.position.set(0.76, 1.1, 0);
  ekranGrup.rotation.z = -0.18; // üst kenar öne yatık
  kok.add(ekranGrup);

  // Sürücü göstergesi (direksiyonun arkasında küçük koyu ekran)
  const gosterge = new Mesh(new BoxGeometry(0.02, 0.07, 0.24), m.panelAcik);
  gosterge.position.set(0.8, 1.04, -KOLTUK.z);
  gosterge.rotation.z = -0.2;
  kok.add(gosterge);

  // Direksiyon (sürücü tarafı, −z): simit + göbek + 3 kol + kolon
  const direksiyon = new Group();
  const simit = new Mesh(new TorusGeometry(0.17, 0.022, 12, 48), m.kumasKoyu);
  const gobek = new Mesh(new CylinderGeometry(0.055, 0.055, 0.04, 24), m.panel);
  gobek.rotation.x = Math.PI / 2;
  direksiyon.add(simit, gobek);
  for (const aci of [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]) {
    const kol = new Mesh(new BoxGeometry(0.17, 0.026, 0.014), m.metal);
    kol.position.set(Math.cos(aci - Math.PI / 2) * 0.09, Math.sin(aci - Math.PI / 2) * 0.09, 0);
    kol.rotation.z = aci - Math.PI / 2;
    direksiyon.add(kol);
  }
  const kolon = new Mesh(new CylinderGeometry(0.03, 0.04, 0.26, 16), m.panel);
  kolon.rotation.x = Math.PI / 2;
  kolon.position.z = -0.14;
  direksiyon.add(kolon);
  // Torus xy düzleminde, yüzü +z'ye bakar → sürücüye (-x) dönsün, üstü öne yatık
  direksiyon.rotation.order = 'YXZ';
  direksiyon.rotation.y = -Math.PI / 2;
  direksiyon.rotation.x = -0.42;
  direksiyon.position.set(0.55, 0.96, -KOLTUK.z);
  kok.add(direksiyon);

  // Tavan lambası: dış ışıklar iç mekâna yukarıdan vurmadığı için iç mekân çok karanlık kalıyordu
  const lamba = new PointLight(0xfff4e6, 5, 3, 1.2);
  lamba.position.set(-0.35, 1.42, 0);
  kok.add(lamba);

  const malzemeler = [...Object.values(m), ekranMalz];
  return { kok, malzemeler };
}
