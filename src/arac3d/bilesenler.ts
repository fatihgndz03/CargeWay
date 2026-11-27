/**
 * Temsili elektrikli araç tahrik ve şarj bileşenleri (adım 4: patlatılmış görünüm).
 *
 * Tamamen kodla üretilir; hiçbir üreticinin parçasını birebir göstermez. Yerleşim genel bir
 * "arkadan itişli, tek motorlu" düzendir (adım 7'de tek/çift motor varyantları gelecek):
 *  - batarya paketi: kabin tabanının altında; tepsi + modüller (biri hücreleriyle) + kapak
 *  - tahrik ünitesi (arka aks): elektrik motoru (gövde/stator + rotor), redüktör, inverter
 *  - araç içi şarj cihazı (OBC) ve şarj soketi (arka sol çeyrek)
 *  - soğutma: önde ısı eşanjörü (radyatör) + pompa + soğutma hattı
 *  - yüksek gerilim kabloları (turuncu)
 *
 * Her parçanın bir "yerinde" konumu (araç içindeki yeri) ve bir "patlak" konumu vardır;
 * `patlat(t)` 0 → 1 arasında bu iki konum arasında yumuşakça geçirir. Kablolar ve soğutma
 * hattı patlak konumlar için çizilir, yalnızca görünüm tamamen açıldığında belirir.
 *
 * Koordinatlar govde.ts ile aynı: +x ön, +y yukarı, sürücü solda (−z). Birim ≈ metre.
 */
import {
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  InstancedMesh,
  type Material,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  Shape,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { OLCU } from './govde';

import type { ParcaAdi } from '../data/parcaBilgileri';
export type { ParcaAdi };

/** Sayfadaki lejant ve klavyeyle gezinme sırası. */
export const PARCA_ADLARI: ParcaAdi[] = ['batarya', 'motor', 'reduktor', 'inverter', 'obc', 'soket', 'sogutma', 'kablo'];

/** Lejant/bilgi kartı rengi (sayfadaki renk noktalarıyla aynı). */
export const PARCA_RENK: Record<ParcaAdi, string> = {
  batarya: '#22c55e',
  motor: '#f59e0b',
  reduktor: '#94a3b8',
  inverter: '#60a5fa',
  obc: '#a78bfa',
  soket: '#f472b6',
  sogutma: '#22d3ee',
  kablo: '#f97316',
};

export type Bilesenler = {
  kok: Group;
  /** 0 = parçalar araçta yerinde, 1 = tamamen patlatılmış. */
  patlat: (t: number) => void;
  /** Her parçanın kökü (adım 5'te tıklayınca bilgi kartı için). */
  parcalar: Record<ParcaAdi, Group>;
  malzemeler: Material[];
};

const ARKA_AKS = -OLCU.dingilArasi / 2;
const AKS_Y = OLCU.tekerYaricap;

/** Batarya paketi ölçüleri: dingiller arasında, kabin tabanının altında. */
const BAT = { xArka: -1.22, xOn: 1.0, hw: 0.7, yAlt: 0.19, yUst: 0.335 };

function malzemeler() {
  return {
    tepsi: new MeshStandardMaterial({ color: 0x3a3f45, roughness: 0.55, metalness: 0.6 }),
    kapak: new MeshStandardMaterial({ color: 0x2f3439, roughness: 0.55, metalness: 0.6 }),
    modul: new MeshStandardMaterial({ color: 0x1c2023, roughness: 0.6, metalness: 0.3 }),
    modulUst: new MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5, metalness: 0.1, emissive: 0x0d4f25, emissiveIntensity: 0.6 }),
    hucre: new MeshStandardMaterial({ color: 0x2b3a31, roughness: 0.35, metalness: 0.6 }),
    hucreUc: new MeshStandardMaterial({ color: 0xc9d1d6, roughness: 0.3, metalness: 0.9 }),
    aluminyum: new MeshStandardMaterial({ color: 0xa7adb3, roughness: 0.38, metalness: 0.85 }),
    dokum: new MeshStandardMaterial({ color: 0x6f757b, roughness: 0.55, metalness: 0.75 }),
    bakir: new MeshStandardMaterial({ color: 0xc26b2c, roughness: 0.35, metalness: 0.9, emissive: 0x3a1a05, emissiveIntensity: 0.5 }),
    celik: new MeshStandardMaterial({ color: 0x8b939b, roughness: 0.3, metalness: 0.9 }),
    lamine: new MeshStandardMaterial({ color: 0x4a5056, roughness: 0.4, metalness: 0.8 }),
    inverter: new MeshStandardMaterial({ color: 0xb8bec4, roughness: 0.4, metalness: 0.7 }),
    inverterSerit: new MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.5, emissive: 0x1d4ed8, emissiveIntensity: 0.45 }),
    obc: new MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.55, metalness: 0.5 }),
    obcSerit: new MeshStandardMaterial({ color: 0xa78bfa, roughness: 0.5, emissive: 0x5b21b6, emissiveIntensity: 0.45 }),
    soketGovde: new MeshStandardMaterial({ color: 0x15171a, roughness: 0.6, metalness: 0.2 }),
    soketHalka: new MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5, emissive: 0x9d174d, emissiveIntensity: 0.45 }),
    pin: new MeshStandardMaterial({ color: 0xd4af6a, roughness: 0.3, metalness: 0.95 }),
    radyator: new MeshStandardMaterial({ color: 0x9aa3ab, roughness: 0.5, metalness: 0.7 }),
    sogutma: new MeshStandardMaterial({ color: 0x22d3ee, roughness: 0.4, emissive: 0x0e7490, emissiveIntensity: 0.5, transparent: true, opacity: 0 }),
    kablo: new MeshStandardMaterial({ color: 0xf97316, roughness: 0.55, emissive: 0x9a3412, emissiveIntensity: 0.4, transparent: true, opacity: 0 }),
    siyah: new MeshStandardMaterial({ color: 0x111315, roughness: 0.7, metalness: 0.2, side: DoubleSide }),
  };
}
type Mz = ReturnType<typeof malzemeler>;

/** Patlatılabilir parça: yerinde → patlak konum arasında (ve isteğe bağlı dönüşle) hareket eder. */
type Hareketli = { nesne: Object3D; yerinde: Vector3; patlak: Vector3; gecikme: number; ara?: Vector3 };

/** Dişli profili (ExtrudeGeometry için). */
function disliSekli(r: number, dis: number, derinlik: number): Shape {
  const s = new Shape();
  const n = dis * 4;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const faz = i % 4;
    const rr = faz === 1 || faz === 2 ? r : r - derinlik;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  return s;
}

function disli(m: Material, r: number, dis: number, kalinlik: number): Mesh {
  const g = new ExtrudeGeometry(disliSekli(r, dis, Math.min(0.018, r * 0.18)), {
    depth: kalinlik,
    bevelEnabled: false,
    curveSegments: 1,
  });
  g.translate(0, 0, -kalinlik / 2);
  return new Mesh(g, m);
}

// ---------------------------------------------------------------------------
// Batarya paketi
// ---------------------------------------------------------------------------
function batarya(mz: Mz, hareket: Hareketli[]): Group {
  const grup = new Group();
  grup.name = 'parca-batarya';
  const uz = BAT.xOn - BAT.xArka;
  const cx = (BAT.xOn + BAT.xArka) / 2;
  const h = BAT.yUst - BAT.yAlt;

  // Tepsi: taban + 4 duvar (üstü açık)
  const tepsi = new Group();
  const taban = new Mesh(new RoundedBoxGeometry(uz, 0.025, BAT.hw * 2, 2, 0.01), mz.tepsi);
  taban.position.y = BAT.yAlt + 0.0125;
  tepsi.add(taban);
  for (const yon of [1, -1]) {
    const yan = new Mesh(new BoxGeometry(uz, h * 0.8, 0.03), mz.tepsi);
    yan.position.set(0, BAT.yAlt + h * 0.4, yon * (BAT.hw - 0.015));
    const uc = new Mesh(new BoxGeometry(0.03, h * 0.8, BAT.hw * 2), mz.tepsi);
    uc.position.set(yon * (uz / 2 - 0.015), BAT.yAlt + h * 0.4, 0);
    tepsi.add(yan, uc);
  }
  // Ortada boyuna kiriş
  const kiris = new Mesh(new BoxGeometry(uz - 0.06, h * 0.7, 0.03), mz.tepsi);
  kiris.position.set(0, BAT.yAlt + h * 0.35, 0);
  tepsi.add(kiris);
  tepsi.position.x = cx;
  grup.add(tepsi);
  hareket.push({ nesne: tepsi, yerinde: tepsi.position.clone(), patlak: new Vector3(cx, -0.0, 0), gecikme: 0 });

  // Modüller: 2 sıra × 6 (enine)
  const sutun = 6;
  const mUz = (uz - 0.1) / sutun - 0.03;
  const mGen = BAT.hw - 0.07;
  const mH = h * 0.72;
  const modulGeo = new RoundedBoxGeometry(mUz, mH, mGen, 2, 0.012);
  const ustGeo = new BoxGeometry(mUz * 0.86, 0.006, mGen * 0.86);
  for (let i = 0; i < sutun; i++) {
    for (const yon of [1, -1]) {
      const x = BAT.xArka + 0.05 + (i + 0.5) * ((uz - 0.1) / sutun);
      const z = yon * (mGen / 2 + 0.03);
      const modul = new Group();
      const kasa = new Mesh(modulGeo, mz.modul);
      const ust = new Mesh(ustGeo, mz.modulUst);
      ust.position.y = mH / 2 + 0.002;
      modul.add(kasa, ust);
      // Bir modülün içini göster: üst plaka yerine hücreler (silindirik hücre dizisi)
      const ornek = i === sutun - 2 && yon === -1;
      if (ornek) {
        ust.visible = false;
        kasa.visible = false;
        const altPlaka = new Mesh(new BoxGeometry(mUz, 0.012, mGen), mz.modul);
        altPlaka.position.y = -mH / 2 + 0.006;
        modul.add(altPlaka);
        const nx = 6;
        const nz = 11;
        const r = Math.min(mUz / nx, mGen / nz) * 0.46;
        const hH = mH * 0.9;
        const govdeGeo = new CylinderGeometry(r, r, hH, 14);
        const ucGeo = new CylinderGeometry(r * 0.45, r * 0.45, 0.006, 10);
        const hucreler = new InstancedMesh(govdeGeo, mz.hucre, nx * nz);
        const uclar = new InstancedMesh(ucGeo, mz.hucreUc, nx * nz);
        const mt = new Matrix4();
        let k = 0;
        for (let a = 0; a < nx; a++) {
          for (let b = 0; b < nz; b++) {
            const hx = -mUz / 2 + (a + 0.5) * (mUz / nx);
            const hz = -mGen / 2 + (b + 0.5) * (mGen / nz);
            mt.makeTranslation(hx, -mH / 2 + 0.012 + hH / 2, hz);
            hucreler.setMatrixAt(k, mt);
            mt.makeTranslation(hx, -mH / 2 + 0.012 + hH + 0.003, hz);
            uclar.setMatrixAt(k, mt);
            k++;
          }
        }
        modul.add(hucreler, uclar);
        // Yan duvarlar (yarım boy, içi görünsün)
        for (const s of [1, -1]) {
          const d = new Mesh(new BoxGeometry(mUz, mH * 0.55, 0.008), mz.modul);
          d.position.set(0, -mH / 2 + mH * 0.275, s * (mGen / 2));
          modul.add(d);
        }
      }
      const y = BAT.yAlt + 0.025 + mH / 2 + 0.004;
      modul.position.set(x, y, z);
      grup.add(modul);
      // Patlak: modüller aralanır ve yükselir; örnek modül daha yukarı ve dışarı çıkar
      const yay = 1.18;
      const patlak = new Vector3(cx + (x - cx) * yay, y + 0.32, z * 1.32);
      if (ornek) patlak.add(new Vector3(0, 0.32, -0.42));
      hareket.push({ nesne: modul, yerinde: modul.position.clone(), patlak, gecikme: 0.08 + 0.02 * i });
    }
  }

  // Kapak: önce yükselir, sonra aracın yanına (tekerleklerin dışına) yere iner. Üstte kalınca
  // (deneme günlüğü) modüllerin üstünü örtüp onları soluklaştırıyordu.
  const kapak = new Mesh(new RoundedBoxGeometry(uz, 0.02, BAT.hw * 2, 2, 0.008), mz.kapak);
  kapak.position.set(cx, BAT.yUst - 0.01, 0);
  grup.add(kapak);
  hareket.push({
    nesne: kapak,
    yerinde: kapak.position.clone(),
    patlak: new Vector3(cx, 0.03, 1.78),
    ara: new Vector3(cx, BAT.yUst + 0.75, 0.9),
    gecikme: 0,
  });
  return grup;
}

// ---------------------------------------------------------------------------
// Tahrik ünitesi: motor (stator + rotor), redüktör, inverter, aks milleri
// ---------------------------------------------------------------------------
const MOTOR = { x: ARKA_AKS + 0.04, y: AKS_Y + 0.02, z: -0.13, r: 0.16, uz: 0.32 };

function motor(mz: Mz, hareket: Hareketli[]): Group {
  const grup = new Group();
  grup.name = 'parca-motor';

  // Stator + gövde: z ekseni boyunca açık uçlu silindir, içinde lamine stator paketi ve bakır sargı başları
  const stator = new Group();
  const kasa = new Mesh(new CylinderGeometry(MOTOR.r, MOTOR.r, MOTOR.uz, 40, 1, true), mz.dokum);
  kasa.rotation.x = Math.PI / 2;
  // Soğutma kanatçıkları
  for (let i = -3; i <= 3; i++) {
    const kanat = new Mesh(new TorusGeometry(MOTOR.r + 0.004, 0.006, 6, 40), mz.dokum);
    kanat.position.z = (i / 3.5) * (MOTOR.uz / 2);
    stator.add(kanat);
  }
  const lamine = new Mesh(new CylinderGeometry(MOTOR.r - 0.012, MOTOR.r - 0.012, MOTOR.uz * 0.7, 40, 1, true), mz.lamine);
  lamine.rotation.x = Math.PI / 2;
  const ic = new Mesh(new CylinderGeometry(MOTOR.r * 0.6, MOTOR.r * 0.6, MOTOR.uz * 0.7, 40, 1, true), mz.lamine);
  ic.rotation.x = Math.PI / 2;
  ic.material = mz.siyah;
  stator.add(kasa, lamine, ic);
  // Ön/arka yüz halkaları (stator dişleri arası koyu)
  for (const yon of [1, -1]) {
    const yuz = new Mesh(new TorusGeometry(MOTOR.r * 0.8, MOTOR.r * 0.2, 4, 40), mz.lamine);
    yuz.scale.z = 0.08;
    yuz.position.z = yon * MOTOR.uz * 0.35;
    stator.add(yuz);
    // Bakır sargı başları
    const sargi = new Mesh(new TorusGeometry(MOTOR.r * 0.78, 0.028, 10, 40), mz.bakir);
    sargi.position.z = yon * (MOTOR.uz * 0.35 + 0.022);
    stator.add(sargi);
  }
  stator.position.set(MOTOR.x, MOTOR.y, MOTOR.z);
  grup.add(stator);
  hareket.push({
    nesne: stator,
    yerinde: stator.position.clone(),
    patlak: new Vector3(MOTOR.x - 0.55, MOTOR.y + 0.42, MOTOR.z - 0.12),
    gecikme: 0.1,
  });

  // Rotor: stator içinden eksen boyunca dışarı kayar
  const rotor = new Group();
  const rotorGovde = new Mesh(new CylinderGeometry(MOTOR.r * 0.56, MOTOR.r * 0.56, MOTOR.uz * 0.68, 32), mz.lamine);
  rotorGovde.rotation.x = Math.PI / 2;
  const mil = new Mesh(new CylinderGeometry(0.022, 0.022, MOTOR.uz + 0.22, 16), mz.celik);
  mil.rotation.x = Math.PI / 2;
  rotor.add(rotorGovde, mil);
  // Rotor üzerinde mıknatıs/çubuk izleri
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const cubuk = new Mesh(new BoxGeometry(0.014, 0.03, MOTOR.uz * 0.66), mz.celik);
    cubuk.position.set(Math.cos(a) * MOTOR.r * 0.53, Math.sin(a) * MOTOR.r * 0.53, 0);
    cubuk.rotation.z = a + Math.PI / 2;
    rotor.add(cubuk);
  }
  rotor.position.set(MOTOR.x, MOTOR.y, MOTOR.z);
  grup.add(rotor);
  hareket.push({
    nesne: rotor,
    yerinde: rotor.position.clone(),
    patlak: new Vector3(MOTOR.x - 0.55, MOTOR.y + 0.42, MOTOR.z - 0.62),
    gecikme: 0.25,
  });
  grup.userData.rotor = rotor;
  return grup;
}

function reduktor(mz: Mz, hareket: Hareketli[]): Group {
  const grup = new Group();
  grup.name = 'parca-reduktor';
  const z0 = MOTOR.z + MOTOR.uz / 2 + 0.1;
  // Kasa: motorun yanında, aks hizasında
  const kasa = new Mesh(new RoundedBoxGeometry(0.34, 0.36, 0.16, 3, 0.04), mz.dokum);
  kasa.position.set(MOTOR.x + 0.03, MOTOR.y + 0.02, z0);
  grup.add(kasa);
  hareket.push({ nesne: kasa, yerinde: kasa.position.clone(), patlak: new Vector3(MOTOR.x + 0.03, MOTOR.y + 0.3, z0 + 0.5), gecikme: 0.12 });
  // Dişliler: küçük (motor milinde) → büyük (diferansiyel/aks); kapak açılmış gibi kasanın yanında
  const dis = new Group();
  const kucuk = disli(mz.celik, 0.06, 12, 0.04);
  kucuk.position.set(0, 0.07, 0);
  const buyuk = disli(mz.celik, 0.13, 26, 0.04);
  buyuk.position.set(0.02, -0.1, 0);
  const ara = disli(mz.celik, 0.085, 18, 0.035);
  ara.position.set(0.1, -0.0, -0.045);
  dis.add(kucuk, buyuk, ara);
  dis.position.set(MOTOR.x + 0.03, MOTOR.y + 0.02, z0 + 0.1);
  grup.add(dis);
  hareket.push({ nesne: dis, yerinde: dis.position.clone(), patlak: new Vector3(MOTOR.x + 0.03, MOTOR.y + 0.3, z0 + 0.82), gecikme: 0.2 });
  grup.userData.disliler = [kucuk, buyuk, ara];
  return grup;
}

function inverter(mz: Mz, hareket: Hareketli[]): Group {
  const grup = new Group();
  grup.name = 'parca-inverter';
  const kutu = new Group();
  const govde = new Mesh(new RoundedBoxGeometry(0.34, 0.1, 0.3, 3, 0.02), mz.inverter);
  const serit = new Mesh(new BoxGeometry(0.3, 0.012, 0.012), mz.inverterSerit);
  serit.position.set(0, 0.03, 0.151);
  const kapak = new Mesh(new BoxGeometry(0.26, 0.008, 0.22), mz.lamine);
  kapak.position.y = 0.052;
  // Soğutma rakorları
  for (const yon of [1, -1]) {
    const rakor = new Mesh(new CylinderGeometry(0.014, 0.014, 0.05, 10), mz.celik);
    rakor.rotation.z = Math.PI / 2;
    rakor.position.set(0.19, 0, yon * 0.07);
    kutu.add(rakor);
  }
  kutu.add(govde, serit, kapak);
  const p = new Vector3(MOTOR.x - 0.02, MOTOR.y + MOTOR.r + 0.07, MOTOR.z + 0.06);
  kutu.position.copy(p);
  grup.add(kutu);
  hareket.push({ nesne: kutu, yerinde: p.clone(), patlak: new Vector3(p.x - 0.35, p.y + 0.95, p.z + 0.15), gecikme: 0.05 });
  return grup;
}

/** Arka aks milleri (motor/redüktörden tekerleklere). Hareket etmez. */
function aksMilleri(mz: Mz): Group {
  const grup = new Group();
  const tekerZ = OLCU.genislik / 2 - OLCU.tekerGenislik / 2;
  for (const yon of [1, -1]) {
    const uz = tekerZ - 0.2;
    const mil = new Mesh(new CylinderGeometry(0.018, 0.018, uz, 10), mz.celik);
    mil.rotation.x = Math.PI / 2;
    mil.position.set(ARKA_AKS, AKS_Y, yon * (0.1 + uz / 2));
    grup.add(mil);
  }
  return grup;
}

// ---------------------------------------------------------------------------
// Şarj: OBC ve soket
// ---------------------------------------------------------------------------
const OBC_P = new Vector3(-1.98, 0.52, 0.18);
/** Şarj soketi: arka sol çeyrek panel (temsili konum; araçtan araca değişir). */
const SOKET_P = new Vector3(-1.82, 0.86, -0.93);

function obc(mz: Mz, hareket: Hareketli[]): Group {
  const grup = new Group();
  grup.name = 'parca-obc';
  const kutu = new Group();
  const govde = new Mesh(new RoundedBoxGeometry(0.3, 0.09, 0.24, 3, 0.02), mz.obc);
  const serit = new Mesh(new BoxGeometry(0.012, 0.012, 0.2), mz.obcSerit);
  serit.position.set(0.151, 0.025, 0);
  // Üstte soğutucu kanatçıklar
  for (let i = 0; i < 7; i++) {
    const kanat = new Mesh(new BoxGeometry(0.24, 0.025, 0.006), mz.aluminyum);
    kanat.position.set(0, 0.055, -0.09 + i * 0.03);
    kutu.add(kanat);
  }
  kutu.add(govde, serit);
  kutu.position.copy(OBC_P);
  grup.add(kutu);
  hareket.push({ nesne: kutu, yerinde: OBC_P.clone(), patlak: new Vector3(OBC_P.x - 0.55, OBC_P.y + 0.75, OBC_P.z + 0.05), gecikme: 0.05 });
  return grup;
}

function soket(mz: Mz, hareket: Hareketli[]): Group {
  const grup = new Group();
  grup.name = 'parca-soket';
  const kutu = new Group();
  // Yüzü dışarı (−z) bakan genel bir soket: koyu yuva, renkli halka, pimler. Belirli bir
  // standardın pim dizilimini birebir göstermez.
  const yuva = new Mesh(new CylinderGeometry(0.075, 0.08, 0.08, 32), mz.soketGovde);
  yuva.rotation.x = Math.PI / 2;
  const halka = new Mesh(new TorusGeometry(0.072, 0.008, 8, 36), mz.soketHalka);
  halka.position.z = -0.041;
  kutu.add(yuva, halka);
  const pinler: [number, number, number][] = [
    [0, 0.035, 0.012],
    [-0.032, 0.012, 0.012],
    [0.032, 0.012, 0.012],
    [-0.022, -0.022, 0.009],
    [0.022, -0.022, 0.009],
  ];
  for (const [x, y, r] of pinler) {
    const pin = new Mesh(new CylinderGeometry(r, r, 0.02, 10), mz.pin);
    pin.rotation.x = Math.PI / 2;
    pin.position.set(x, y, -0.045);
    kutu.add(pin);
  }
  // Arka kutu (bağlantı)
  const arka = new Mesh(new BoxGeometry(0.12, 0.12, 0.08), mz.soketGovde);
  arka.position.z = 0.07;
  kutu.add(arka);
  kutu.position.copy(SOKET_P);
  grup.add(kutu);
  hareket.push({ nesne: kutu, yerinde: SOKET_P.clone(), patlak: new Vector3(SOKET_P.x - 0.35, SOKET_P.y + 0.5, SOKET_P.z - 0.55), gecikme: 0 });
  return grup;
}

// ---------------------------------------------------------------------------
// Soğutma: önde ısı eşanjörü + pompa
// ---------------------------------------------------------------------------
const RADYATOR_P = new Vector3(2.08, 0.46, 0);
const POMPA_P = new Vector3(1.72, 0.36, 0.38);

function sogutma(mz: Mz, hareket: Hareketli[]): Group {
  const grup = new Group();
  grup.name = 'parca-sogutma';
  const radyator = new Group();
  const cerceve = new Mesh(new BoxGeometry(0.05, 0.3, 1.0), mz.radyator);
  radyator.add(cerceve);
  for (let i = 0; i < 18; i++) {
    const pt = new Mesh(new BoxGeometry(0.052, 0.27, 0.006), mz.lamine);
    pt.position.z = -0.46 + i * (0.92 / 17);
    radyator.add(pt);
  }
  for (const yon of [1, -1]) {
    const tank = new Mesh(new BoxGeometry(0.06, 0.3, 0.05), mz.siyah);
    tank.position.z = yon * 0.52;
    radyator.add(tank);
  }
  radyator.rotation.z = 0.12;
  radyator.position.copy(RADYATOR_P);
  grup.add(radyator);
  hareket.push({ nesne: radyator, yerinde: RADYATOR_P.clone(), patlak: new Vector3(RADYATOR_P.x + 0.55, RADYATOR_P.y + 0.42, 0), gecikme: 0.05 });

  const pompa = new Group();
  const govde = new Mesh(new CylinderGeometry(0.05, 0.05, 0.12, 20), mz.siyah);
  govde.rotation.z = Math.PI / 2;
  const kapak = new Mesh(new CylinderGeometry(0.055, 0.055, 0.03, 20), mz.radyator);
  kapak.rotation.z = Math.PI / 2;
  kapak.position.x = 0.07;
  pompa.add(govde, kapak);
  pompa.position.copy(POMPA_P);
  grup.add(pompa);
  hareket.push({ nesne: pompa, yerinde: POMPA_P.clone(), patlak: new Vector3(POMPA_P.x + 0.3, POMPA_P.y + 0.42, POMPA_P.z + 0.3), gecikme: 0.1 });
  return grup;
}

/** Patlak konumlar arasında boru/kablo (yalnızca görünüm tamamen açıkken görünür). */
function boru(m: Material, noktalar: Vector3[], r: number): Mesh {
  const egri = new CatmullRomCurve3(noktalar, false, 'centripetal');
  return new Mesh(new TubeGeometry(egri, Math.max(24, noktalar.length * 12), r, 8, false), m);
}

export function bilesenlerOlustur(): Bilesenler {
  const mz = malzemeler();
  const kok = new Group();
  kok.name = 'bilesenler';
  const hareket: Hareketli[] = [];

  const parcalar: Record<ParcaAdi, Group> = {
    batarya: batarya(mz, hareket),
    motor: motor(mz, hareket),
    reduktor: reduktor(mz, hareket),
    inverter: inverter(mz, hareket),
    obc: obc(mz, hareket),
    soket: soket(mz, hareket),
    sogutma: sogutma(mz, hareket),
    kablo: new Group(),
  };
  parcalar.kablo.name = 'parca-kablo';
  for (const g of Object.values(parcalar)) kok.add(g);
  kok.add(aksMilleri(mz));

  // Patlak konumlara göre kablolar ve soğutma hattı
  const patlak = (n: Object3D) => hareket.find((h) => h.nesne === n)?.patlak.clone() ?? new Vector3();
  const batArkaP = new Vector3(BAT.xArka * 1.18 + 0.05, BAT.yUst + 0.28, 0.2);
  const batOnP = new Vector3(BAT.xOn * 1.12, BAT.yUst + 0.26, -0.3);
  const [soketG, obcG, invG] = [parcalar.soket.children[0], parcalar.obc.children[0], parcalar.inverter.children[0]];
  const soketP = patlak(soketG);
  const obcP = patlak(obcG);
  const invP = patlak(invG);
  const statorP = new Vector3(MOTOR.x - 0.55, MOTOR.y + 0.42, MOTOR.z - 0.12);
  // Yüksek gerilim (turuncu): soket → OBC (AC), soket → batarya (DC), OBC → batarya, batarya → inverter → motor
  const k = 0.022;
  parcalar.kablo.add(
    boru(mz.kablo, [soketP.clone().add(new Vector3(0.05, 0, 0.08)), new Vector3(-2.3, 1.25, -0.6), obcP.clone().add(new Vector3(-0.05, 0, -0.1))], k),
    boru(mz.kablo, [soketP.clone().add(new Vector3(0.06, -0.05, 0.08)), new Vector3(-1.75, 0.95, -0.9), batArkaP.clone().add(new Vector3(0, 0, -0.45))], k),
    boru(mz.kablo, [obcP.clone().add(new Vector3(0.12, -0.03, 0)), new Vector3(-1.75, 0.95, 0.3), batArkaP], k),
    boru(mz.kablo, [batArkaP.clone().add(new Vector3(0, 0, 0.12)), new Vector3(-1.5, 1.05, 0.35), invP.clone().add(new Vector3(0.12, 0, 0.1))], k),
    boru(mz.kablo, [invP.clone().add(new Vector3(-0.05, -0.04, -0.12)), new Vector3(-1.95, 1.05, -0.2), statorP.clone().add(new Vector3(0, 0.15, 0))], k * 0.8),
  );
  // Soğutma (camgöbeği): radyatör → pompa → batarya altı → inverter/motor → radyatör
  const radP = patlak(parcalar.sogutma.children[0]);
  const pompaP = patlak(parcalar.sogutma.children[1]);
  const s = 0.018;
  parcalar.sogutma.add(
    boru(mz.sogutma, [radP.clone().add(new Vector3(-0.03, -0.1, 0.4)), new Vector3(2.1, 0.75, 0.6), pompaP.clone().add(new Vector3(0.05, 0, 0))], s),
    boru(mz.sogutma, [pompaP.clone().add(new Vector3(-0.06, 0, 0)), new Vector3(1.3, 0.62, 0.55), batOnP.clone().add(new Vector3(0, -0.05, 0.85))], s),
    boru(mz.sogutma, [batOnP.clone().add(new Vector3(-0.2, -0.05, 0.85)), new Vector3(-0.3, 0.5, 0.86), batArkaP.clone().add(new Vector3(0, -0.08, 0.66))], s),
    boru(mz.sogutma, [batArkaP.clone().add(new Vector3(-0.05, -0.08, 0.66)), new Vector3(-1.75, 1.1, 0.55), invP.clone().add(new Vector3(0.2, 0, 0.07))], s),
    boru(mz.sogutma, [invP.clone().add(new Vector3(0.2, 0, -0.07)), new Vector3(-1.2, 1.25, -0.75), new Vector3(0.6, 1.0, -0.8), radP.clone().add(new Vector3(-0.03, 0.1, -0.4))], s),
  );

  // Patlatma: her parça kendi gecikmesiyle; kablolar/borular sonda belirir
  const yumusat = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const patlat = (t: number) => {
    for (const h of hareket) {
      const u = yumusat(Math.min(Math.max((t - h.gecikme) / (1 - h.gecikme), 0), 1));
      if (h.ara) {
        // İki aşamalı yol (yerinde → ara → patlak), ikinci dereceden Bezier
        const v = 1 - u;
        h.nesne.position
          .copy(h.yerinde)
          .multiplyScalar(v * v)
          .addScaledVector(h.ara, 2 * u * v)
          .addScaledVector(h.patlak, u * u);
      } else h.nesne.position.lerpVectors(h.yerinde, h.patlak, u);
    }
    const gorunurluk = Math.min(Math.max((t - 0.85) / 0.15, 0), 1);
    mz.kablo.opacity = gorunurluk;
    mz.sogutma.opacity = gorunurluk;
    const kabloGorunsun = gorunurluk > 0.001;
    for (const g of [parcalar.kablo, parcalar.sogutma]) {
      for (const c of g.children) if (c instanceof Mesh && c.geometry instanceof TubeGeometry) c.visible = kabloGorunsun;
    }
  };
  patlat(0);

  return { kok, patlat, parcalar, malzemeler: Object.values(mz) };
}
