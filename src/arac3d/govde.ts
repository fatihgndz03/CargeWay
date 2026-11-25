/**
 * Temsili, markasız ve stilize elektrikli araç gövdesi (adım 2).
 *
 * Tamamen kodla üretilir (dış 3D dosyası ya da doku yok). Gövde ve cam ev, boy boyunca dizilmiş
 * yuvarlatılmış dikdörtgen kesitlerin birleştirilmesiyle ("loft") oluşturulur; böylece omuzlar
 * yuvarlak, yan yüzler hafif bombeli ve üstte içe eğimli olur. Çamurluk kavisleri gövde
 * malzemesinin gölgelendiricisinde kesilir; far/stop şeritleri ve marşpiyel vurgusu da
 * gölgelendiricide yüzeye çizilir. Bilerek genel bir "crossover" silüeti seçildi; ızgara, far
 * imzası, logo gibi bir markayı çağrıştırabilecek ayrıntı YOKTUR (docs/arac-3d-plan.md).
 *
 * Parçalar ayrı nesnedir (sonraki adımlar için):
 *  - govde: alt gövde (kaporta)
 *  - kabin: cam ev (ön/arka cam, yan camlar) + tavan (aynı geometride iki malzeme grubu)
 *  - kapilar: 4 kapı; her biri menteşe (ön kenar) etrafında dönebilen bir Group,
 *    içinde gövde yüzeyini izleyen kapı sacı, kapı camı ve derz çizgileri. Adım 3'te açılacak.
 *  - tekerlekler: 4 tekerlek (lastik + jant); `donder()` ile döndürülebilir.
 *
 * Koordinatlar: +x aracın önü, +y yukarı, z genişlik (sol taraf +z). Birim ≈ metre.
 */
import {
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SplineCurve,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';

/** Ölçüler (yaklaşık, genel bir kompakt crossover; hiçbir modelin ölçüsü değildir). */
export const OLCU = {
  genislik: 1.84,
  dingilArasi: 2.75,
  tekerYaricap: 0.385,
  tekerGenislik: 0.24,
  /** Çamurluk kavisi yarıçapı */
  kavis: 0.465,
  /** Yerden yükseklik (alt gövde tabanı) */
  taban: 0.24,
  /** Bel çizgisi (kapı camının alt kenarı), ön kapıda */
  bel: 1.0,
  /** Gövdenin arka ve ön uçlarının x'i */
  arkaUc: -2.24,
  onUc: 2.25,
} as const;

const ON_AKS = OLCU.dingilArasi / 2;
const ARKA_AKS = -OLCU.dingilArasi / 2;
const TEKER_Y = OLCU.tekerYaricap;
const YARIM_W = OLCU.genislik / 2;

export type AracParcalari = {
  kok: Group;
  govde: Mesh;
  kabin: Mesh;
  kapilar: { onSol: Group; arkaSol: Group; onSag: Group; arkaSag: Group };
  tekerlekler: Group[];
  /** Tekerlekleri ileri yönde verilen açı (radyan) kadar çevirir (adım 6 animasyonları için). */
  donder: (aci: number) => void;
};

// ---------------------------------------------------------------------------
// Yardımcı matematik
// ---------------------------------------------------------------------------

const sinirla = (v: number, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const yumusak = (a: number, b: number, x: number) => {
  const t = sinirla((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** Uçlarda kapanma eğrisi: t≤0 → 1, t=1 → 0; p büyüdükçe uç küt olur. */
const kapanma = (t: number, p: number) => Math.pow(1 - Math.pow(sinirla(t), p), 1 / p);

/** Bir kesit: yarım genişlik, alt/üst y, üst/alt köşe yarıçapı ve yan yüz çarpanı. */
type Kesit = {
  hw: number;
  yb: number;
  yt: number;
  rU: number;
  rA: number;
  /** Yüksekliğe göre z çarpanı (içe eğim / bombe) */
  carpan: (y: number) => number;
};

function yaricaplar(k: Kesit): { rU: number; rA: number } {
  const h = Math.max(k.yt - k.yb, 1e-4);
  return { rU: Math.min(k.rU, k.hw * 0.95, h * 0.6), rA: Math.min(k.rA, k.hw * 0.95, h * 0.35) };
}

/** Yüzey z'si (sol taraf, pozitif). Kapılar ve camlar bu fonksiyonla gövdeye oturtulur. */
function yuzeyZ(k: Kesit, y: number): number {
  const { hw, yb, yt } = k;
  const { rU, rA } = yaricaplar(k);
  let z = hw;
  if (y > yt - rU) {
    const d = y - (yt - rU);
    z = hw - rU + Math.sqrt(Math.max(rU * rU - d * d, 0));
  } else if (y < yb + rA) {
    const d = yb + rA - y;
    z = hw - rA + Math.sqrt(Math.max(rA * rA - d * d, 0));
  }
  return z * k.carpan(y);
}

/**
 * Kesitin çevresini sabit nokta sayısıyla örnekler (tüm kesitlerde aynı sayı → loft).
 * Dönen noktalar alt ortadan başlayıp sağ yandan yukarı, üstten sola ve sol yandan aşağı tam tur atar.
 * `ust` dizisi, noktanın tavan bölgesinde (üst köşe + üst düzlük) olup olmadığını söyler.
 */
const N_ALT = 4;
const N_ALT_KOSE = 5;
const N_YAN = 8;
const N_UST_KOSE = 8;
const N_UST = 5;
function kesitNoktalari(k: Kesit): { p: [number, number][]; ust: boolean[] } {
  const { hw, yb, yt } = k;
  const { rU, rA } = yaricaplar(k);
  const h = Math.max(yt - yb, 1e-4);
  const sag: [number, number, boolean][] = [];
  for (let i = 0; i < N_ALT; i++) sag.push([((hw - rA) * i) / N_ALT, yb, false]);
  for (let i = 0; i < N_ALT_KOSE; i++) {
    const a = -Math.PI / 2 + (Math.PI / 2) * (i / N_ALT_KOSE);
    sag.push([hw - rA + rA * Math.cos(a), yb + rA + rA * Math.sin(a), false]);
  }
  for (let i = 0; i < N_YAN; i++) sag.push([hw, yb + rA + ((h - rA - rU) * i) / N_YAN, false]);
  for (let i = 0; i < N_UST_KOSE; i++) {
    const a = (Math.PI / 2) * (i / N_UST_KOSE);
    sag.push([hw - rU + rU * Math.cos(a), yt - rU + rU * Math.sin(a), true]);
  }
  for (let i = 0; i < N_UST; i++) sag.push([(hw - rU) * (1 - i / N_UST), yt, true]);
  sag.push([0, yt, true]);

  const p: [number, number][] = [];
  const ust: boolean[] = [];
  for (const [z, y, u] of sag) {
    p.push([z * k.carpan(y), y]);
    ust.push(u);
  }
  // Sol yarı: ayna (üst ortadan alt ortaya; uç noktalar tekrar edilmez)
  for (let i = sag.length - 2; i >= 1; i--) {
    const [z, y, u] = sag[i];
    p.push([-z * k.carpan(y), y]);
    ust.push(u);
  }
  return { p, ust };
}

/**
 * Loft: x istasyonlarındaki kesitleri dörtgen ızgarayla birleştirir.
 * `tavanMi` verilirse tavan bölgesindeki üçgenler ikinci malzeme grubuna alınır.
 */
function loft(xler: number[], kesitAl: (x: number) => Kesit, tavanMi?: (x: number) => boolean): BufferGeometry {
  const konum: number[] = [];
  const ustBayrak: boolean[][] = [];
  let P = 0;
  for (const x of xler) {
    const { p, ust } = kesitNoktalari(kesitAl(x));
    P = p.length;
    for (const [z, y] of p) konum.push(x, y, z);
    ustBayrak.push(ust);
  }
  const govdeIndis: number[] = [];
  const tavanIndis: number[] = [];
  for (let s = 0; s < xler.length - 1; s++) {
    const tavanIstasyon = !!tavanMi && tavanMi((xler[s] + xler[s + 1]) / 2);
    for (let i = 0; i < P; i++) {
      const i2 = (i + 1) % P;
      const a = s * P + i;
      const b = s * P + i2;
      const c = (s + 1) * P + i;
      const d = (s + 1) * P + i2;
      const tavan =
        tavanIstasyon && ustBayrak[s][i] && ustBayrak[s][i2] && ustBayrak[s + 1][i] && ustBayrak[s + 1][i2];
      (tavan ? tavanIndis : govdeIndis).push(a, c, b, b, c, d);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(konum, 3));
  g.setIndex([...govdeIndis, ...tavanIndis]);
  g.addGroup(0, govdeIndis.length, 0);
  if (tavanIndis.length) g.addGroup(govdeIndis.length, tavanIndis.length, 1);
  g.computeVertexNormals();
  return g;
}

/** Uçlarda sık, ortada seyrek x örneklemesi. */
function istasyonlar(x0: number, x1: number, n: number): number[] {
  const xs: number[] = [];
  for (let i = 0; i <= n; i++) xs.push(x0 + (x1 - x0) * (0.5 - 0.5 * Math.cos((Math.PI * i) / n)));
  return xs;
}

// ---------------------------------------------------------------------------
// Alt gövde biçimi
// ---------------------------------------------------------------------------

/** Bel çizgisinin x'e göre yüksekliği: arkaya doğru hafifçe yükselir. */
function belY(x: number): number {
  return OLCU.bel + 0.045 * yumusak(1.0, -1.75, x);
}

function altGovdeKesiti(x: number): Kesit {
  const { arkaUc, onUc, taban } = OLCU;
  // Üst hat: kaput öne doğru alçalır
  let ytTaban = belY(x);
  if (x > 1.0) ytTaban -= 0.18 * Math.pow(yumusak(1.0, 2.15, x), 0.9);
  // Uçlarda kapanma (yan görünüş): ön burun yuvarlak, arka daha küt
  const fYan =
    x > 0 ? kapanma((x - 1.98) / (onUc - 1.98), 4.2) : kapanma((-x - 2.04) / (-arkaUc - 2.04), 5);
  const ycUc = x > 0 ? 0.6 : 0.68;
  const yt = ycUc + (ytTaban - ycUc) * fYan;
  const yb = ycUc + (taban - ycUc) * fYan;
  // Üstten görünüş: uçlarda köşeler yuvarlanır
  const fPlan =
    x > 0 ? kapanma((x - 1.72) / (onUc - 1.72), 4.2) : kapanma((-x - 1.86) / (-arkaUc - 1.86), 5);
  return {
    hw: YARIM_W * fPlan,
    yb,
    yt,
    rU: 0.17,
    rA: 0.09,
    carpan: (y) => {
      const s = sinirla((y - yb) / Math.max(yt - yb, 1e-4));
      // üstte içe eğim, ortada hafif bombe, altta hafif içe kıvrım
      return (1 - 0.07 * s * s) * (1 + 0.02 * Math.sin(Math.PI * s)) * (1 - 0.035 * Math.pow(1 - s, 3));
    },
  };
}

// ---------------------------------------------------------------------------
// Cam ev biçimi
// ---------------------------------------------------------------------------

const KABIN_ON = 1.08;
const KABIN_ARKA = -1.9;
/** Cam ev tavan hattı: ön cam → tavan → arka cam (yan görünüş). */
const tavanTablo = new SplineCurve([
  new Vector2(KABIN_ON, OLCU.bel - 0.04),
  new Vector2(0.82, 1.16),
  new Vector2(0.46, 1.39),
  new Vector2(0.1, 1.53),
  new Vector2(-0.45, 1.575),
  new Vector2(-1.05, 1.565),
  new Vector2(-1.45, 1.51),
  new Vector2(-1.74, 1.3),
  new Vector2(KABIN_ARKA, OLCU.bel),
]).getSpacedPoints(600);

function tavanY(x: number): number {
  for (let i = 0; i < tavanTablo.length - 1; i++) {
    const a = tavanTablo[i];
    const b = tavanTablo[i + 1];
    if ((x <= a.x && x >= b.x) || (x >= a.x && x <= b.x)) {
      const t = (x - a.x) / (b.x - a.x || 1);
      return a.y + (b.y - a.y) * t;
    }
  }
  return OLCU.bel - 0.05;
}

const KABIN_ALT_HW = 0.69;
const KABIN_UST_HW = 0.585;
function kabinKesiti(x: number): Kesit {
  const yb = belY(x) - 0.07;
  const yt = Math.max(tavanY(x), yb + 0.001);
  // A ve C direkleri öne/arkaya doğru hafifçe içe toplanır
  const daralma = 1 - 0.05 * yumusak(0.4, KABIN_ON, x) - 0.04 * yumusak(-1.2, KABIN_ARKA, x);
  const ustOran = KABIN_UST_HW / KABIN_ALT_HW;
  return {
    hw: KABIN_ALT_HW * daralma,
    yb,
    yt,
    rU: 0.15,
    rA: 0.02,
    carpan: (y) => 1 - (1 - ustOran) * sinirla((y - yb) / 0.56),
  };
}

// ---------------------------------------------------------------------------
// Malzemeler
// ---------------------------------------------------------------------------

function boyaMalzemesi() {
  return new MeshPhysicalMaterial({
    color: 0xc3c8cd, // nötr açık gri — marka rengi değil
    metalness: 0.55,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });
}

/**
 * Alt gövde malzemesi: boya + gölgelendiricide (yerel koordinatla)
 *  - çamurluk kavislerini keser (discard),
 *  - ön beyaz / arka kırmızı ışık şeridini ve marşpiyeldeki yeşil (#22c55e) vurguyu çizer.
 * Böylece eğri yüzeye tam oturan, ek geometri gerektirmeyen ayrıntılar elde edilir.
 */
function govdeMalzemesi() {
  const m = boyaMalzemesi();
  m.side = DoubleSide; // kavis kesiklerinden gövdenin içi görünürse boş kalmasın
  const f = (n: number) => n.toFixed(4);
  const k2 = f(OLCU.kavis * OLCU.kavis);
  m.onBeforeCompile = (sh) => {
    sh.vertexShader =
      'varying vec3 vYerel;\nvarying vec3 vYerelN;\n' +
      sh.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\n  vYerel = position;\n  vYerelN = normal;',
      );
    sh.fragmentShader =
      'varying vec3 vYerel;\nvarying vec3 vYerelN;\n' +
      sh.fragmentShader
        .replace(
          '#include <clipping_planes_fragment>',
          `#include <clipping_planes_fragment>
  {
    vec2 d1 = vYerel.xy - vec2(${f(ON_AKS)}, ${f(TEKER_Y)});
    vec2 d2 = vYerel.xy - vec2(${f(ARKA_AKS)}, ${f(TEKER_Y)});
    if (dot(d1, d1) < ${k2} || dot(d2, d2) < ${k2}) discard;
  }`,
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
  {
    // Işık şeritleri: koyu bir bant içinde parlak çekirdek (beyaz boyada okunur olsun diye)
    float onOn = step(0.45, vYerelN.x) * step(abs(vYerel.z), 0.74);
    float onKoyu = onOn * step(0.64, vYerel.y) * step(vYerel.y, 0.725);
    float onB = onOn * step(0.672, vYerel.y) * step(vYerel.y, 0.692) * step(abs(vYerel.z), 0.71);
    float arka = step(0.3, -vYerelN.x) * step(abs(vYerel.z), 0.74);
    float arkaKoyu = arka * step(0.885, vYerel.y) * step(vYerel.y, 0.965);
    float arkaB = arka * step(0.912, vYerel.y) * step(vYerel.y, 0.936) * step(abs(vYerel.z), 0.71);
    // Alt kaplama (mat siyah plastik) ve çamurluk kavisi çerçevesi: yan yüzü inceltir, crossover duruşu verir
    float kd1 = length(vYerel.xy - vec2(${f(ON_AKS)}, ${f(TEKER_Y)}));
    float kd2 = length(vYerel.xy - vec2(${f(ARKA_AKS)}, ${f(TEKER_Y)}));
    float kavisCerceve = 1.0 - step(${f(OLCU.kavis + 0.06)}, min(kd1, kd2));
    float kaplama = max(1.0 - step(${f(OLCU.taban + 0.13)}, vYerel.y), kavisCerceve);
    float yanB = step(0.6, abs(vYerelN.z)) * step(${f(OLCU.taban + 0.075)}, vYerel.y) * step(vYerel.y, ${f(OLCU.taban + 0.09)}) * step(abs(vYerel.x), 0.8);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.035), max(kaplama, max(onKoyu, arkaKoyu)));
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.02), yanB);
    totalEmissiveRadiance += vec3(1.0, 0.99, 0.95) * 2.2 * onB;
    totalEmissiveRadiance += vec3(1.0, 0.06, 0.05) * 1.8 * arkaB;
    totalEmissiveRadiance += vec3(0.133, 0.773, 0.369) * 1.2 * yanB;
  }`,
        );
  };
  m.customProgramCacheKey = () => 'cargeway-arac-govde-v2';
  return m;
}

function malzemeler() {
  return {
    govde: govdeMalzemesi(),
    boya: boyaMalzemesi(),
    cam: new MeshPhysicalMaterial({
      color: 0x060908,
      metalness: 0.3,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
    }),
    tavan: new MeshPhysicalMaterial({ color: 0x0c0d0e, metalness: 0.3, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.35 }),
    siyah: new MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.75, metalness: 0.1, side: DoubleSide }),
    lastik: new MeshStandardMaterial({ color: 0x121212, roughness: 0.92, metalness: 0 }),
    jant: new MeshStandardMaterial({ color: 0x9aa1a8, roughness: 0.28, metalness: 0.85 }),
    jantIc: new MeshStandardMaterial({ color: 0x1a1d20, roughness: 0.5, metalness: 0.5 }),
    derz: new LineBasicMaterial({ color: 0x24282c }),
  };
}

type Malzemeler = ReturnType<typeof malzemeler>;

// ---------------------------------------------------------------------------
// Parçalar
// ---------------------------------------------------------------------------

/** Tekerlek: lastik (silindir + yanak simitleri), jant tası ve 5 genel kol. */
function tekerlek(mz: Malzemeler, solTaraf: boolean): Group {
  const { tekerYaricap: r, tekerGenislik: w } = OLCU;
  const grup = new Group();
  const ic = new Group(); // dönen kısım
  grup.add(ic);

  const lastik = new Mesh(new CylinderGeometry(r - 0.02, r - 0.02, w * 0.8, 40, 1, true), mz.lastik);
  lastik.rotation.x = Math.PI / 2;
  ic.add(lastik);
  for (const yon of [1, -1]) {
    const yanak = new Mesh(new TorusGeometry(r - 0.06, 0.06, 12, 44), mz.lastik);
    yanak.position.z = yon * w * 0.38;
    ic.add(yanak);
  }
  const dis = solTaraf ? 1 : -1;
  const tas = new Mesh(new CylinderGeometry(r * 0.72, r * 0.72, w * 0.7, 36), mz.jantIc);
  tas.rotation.x = Math.PI / 2;
  ic.add(tas);
  for (let i = 0; i < 5; i++) {
    const kol = new Mesh(new BoxGeometry(r * 0.13, r * 1.36, 0.03), mz.jant);
    kol.rotation.z = (i / 5) * Math.PI * 2;
    kol.position.z = dis * w * 0.36;
    ic.add(kol);
  }
  const gobek = new Mesh(new CylinderGeometry(r * 0.17, r * 0.17, 0.05, 24), mz.jant);
  gobek.rotation.x = Math.PI / 2;
  gobek.position.z = dis * w * 0.37;
  ic.add(gobek);
  const halka = new Mesh(new TorusGeometry(r * 0.7, 0.02, 8, 48), mz.jant);
  halka.position.z = dis * w * 0.36;
  ic.add(halka);

  grup.userData.ic = ic;
  return grup;
}

/** Dört köşeli bölgeyi (ön-alt, ön-üst, arka-üst, arka-alt) çift doğrusal eşler. */
function dortgenNokta(k: [number, number][], u: number, v: number): [number, number] {
  const [a, b, c, d] = k;
  const altX = a[0] + (d[0] - a[0]) * u;
  const altY = a[1] + (d[1] - a[1]) * u;
  const ustX = b[0] + (c[0] - b[0]) * u;
  const ustY = b[1] + (c[1] - b[1]) * u;
  return [altX + (ustX - altX) * v, altY + (ustY - altY) * v];
}

type ZFn = (x: number, y: number) => number;

/** Yüzeye (zFn) oturan, kenarları dörtgen olan ızgara geometri. */
function yuzeyIzgarasi(dortgen: [number, number][], zFn: ZFn, ofsetX: number, isaret: number, nu = 14, nv = 18) {
  const konum: number[] = [];
  const indis: number[] = [];
  for (let j = 0; j <= nv; j++) {
    for (let i = 0; i <= nu; i++) {
      const [x, y] = dortgenNokta(dortgen, i / nu, j / nv);
      konum.push(x - ofsetX, y, isaret * zFn(x, y));
    }
  }
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i;
      const b = a + 1;
      const c = a + nu + 1;
      const d = c + 1;
      if (isaret > 0) indis.push(a, c, b, b, c, d);
      else indis.push(a, b, c, b, d, c);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(konum, 3));
  g.setIndex(indis);
  g.computeVertexNormals();
  return g;
}

/** Dörtgen kenarı boyunca yüzeyi izleyen kapalı çizgi. */
function kenarCizgisi(dortgen: [number, number][], zFn: ZFn, ofsetX: number, isaret: number, mz: Malzemeler) {
  const noktalar: Vector3[] = [];
  const kenar = [...dortgen, dortgen[0]];
  for (let k = 0; k < kenar.length - 1; k++) {
    const [x0, y0] = kenar[k];
    const [x1, y1] = kenar[k + 1];
    for (let n = 0; n < 16; n++) {
      const t = n / 16;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      noktalar.push(new Vector3(x - ofsetX, y, isaret * zFn(x, y)));
    }
  }
  noktalar.push(noktalar[0].clone());
  return new Line(new BufferGeometry().setFromPoints(noktalar), mz.derz);
}

const govdeZ: ZFn = (x, y) => yuzeyZ(altGovdeKesiti(x), y);
const kabinZ: ZFn = (x, y) => yuzeyZ(kabinKesiti(x), y);

/**
 * Kapı: menteşe (ön kenar) etrafında dönen Group. Sac gövde yüzeyini, cam cam evin
 * yüzeyini birkaç milimetre dışarıdan izler. `solTaraf` false ise sağ tarafa aynalanır.
 */
function kapi(mz: Malzemeler, ad: string, sac: [number, number][], cam: [number, number][], solTaraf: boolean): Group {
  const menteseX = Math.max(sac[0][0], sac[1][0]);
  const isaret = solTaraf ? 1 : -1;
  const grup = new Group();
  grup.name = ad;
  grup.position.set(menteseX, 0, 0);

  const sacMesh = new Mesh(yuzeyIzgarasi(sac, (x, y) => govdeZ(x, y) + 0.004, menteseX, isaret), mz.boya);
  sacMesh.name = 'kapi-saci';
  const derz = kenarCizgisi(sac, (x, y) => govdeZ(x, y) + 0.007, menteseX, isaret, mz);

  const camMesh = new Mesh(yuzeyIzgarasi(cam, (x, y) => kabinZ(x, y) + 0.004, menteseX, isaret, 8, 8), mz.cam);
  camMesh.name = 'kapi-cami';
  const cerceve = kenarCizgisi(cam, (x, y) => kabinZ(x, y) + 0.006, menteseX, isaret, mz);

  // Kapı kolu: gömme tip, ince siyah çubuk (genel)
  const kolX = menteseX - 0.27;
  const kolY = belY(kolX) - 0.13;
  const kol = new Mesh(new BoxGeometry(0.16, 0.024, 0.01), mz.siyah);
  kol.position.set(-0.27, kolY, isaret * (govdeZ(kolX, kolY) + 0.008));

  grup.add(sacMesh, derz, camMesh, cerceve, kol);
  grup.userData.solTaraf = solTaraf;
  return grup;
}

export function aracOlustur(): AracParcalari & { malzemeler: Malzemeler } {
  const mz = malzemeler();
  const kok = new Group();
  kok.name = 'arac';

  // Alt gövde
  const govde = new Mesh(loft(istasyonlar(OLCU.arkaUc, OLCU.onUc, 110), altGovdeKesiti), mz.govde);
  govde.name = 'govde';
  kok.add(govde);

  // Cam ev + tavan (tavan bölgesi ikinci malzeme grubu → parlak siyah "yüzen tavan")
  const kabin = new Mesh(
    loft(istasyonlar(KABIN_ARKA, KABIN_ON, 70), kabinKesiti, (x) => x < 0.02 && x > -1.32),
    [mz.cam, mz.tavan],
  );
  kabin.name = 'kabin';
  kok.add(kabin);

  // Kapı hatları — sıra: ön-alt, ön-üst, arka-üst, arka-alt (menteşe ön kenarda)
  const ust = (x: number) => belY(x) - 0.01;
  // Kapılar alt kaplamanın (taban + 0,13) ve kavis çerçevelerinin dışında kalır
  const alt = OLCU.taban + 0.135;
  const onSac: [number, number][] = [
    [0.83, alt],
    [0.86, ust(0.86)],
    [0.0, ust(0)],
    [0.0, alt],
  ];
  const onCam: [number, number][] = [
    [0.8, belY(0.8)],
    [0.3, 1.405],
    [0.03, 1.44],
    [0.03, belY(0.03)],
  ];
  const arkaSac: [number, number][] = [
    [-0.03, alt],
    [-0.03, ust(-0.03)],
    [-0.9, ust(-0.9)],
    [-0.84, alt],
  ];
  const arkaCam: [number, number][] = [
    [-0.05, belY(-0.05)],
    [-0.05, 1.44],
    [-0.8, 1.43],
    [-1.02, belY(-1.02)],
  ];
  const kapilar = {
    onSol: kapi(mz, 'kapi-on-sol', onSac, onCam, true),
    arkaSol: kapi(mz, 'kapi-arka-sol', arkaSac, arkaCam, true),
    onSag: kapi(mz, 'kapi-on-sag', onSac, onCam, false),
    arkaSag: kapi(mz, 'kapi-arka-sag', arkaSac, arkaCam, false),
  };
  kok.add(kapilar.onSol, kapilar.arkaSol, kapilar.onSag, kapilar.arkaSag);

  // Çamurluk içi: tekerleğin üstünde koyu yarım silindir astar + iç tarafta kapatma diski
  for (const x of [ON_AKS, ARKA_AKS]) {
    const astar = new Mesh(
      new CylinderGeometry(OLCU.kavis - 0.005, OLCU.kavis - 0.005, OLCU.genislik - 0.1, 36, 1, true, Math.PI / 2, Math.PI),
      mz.siyah,
    );
    // x ekseninde 90° çevrilince θ∈[π/2, 3π/2] aralığı üst yarıya denk gelir
    astar.rotation.x = Math.PI / 2;
    astar.position.set(x, TEKER_Y, 0);
    kok.add(astar);
    for (const yon of [1, -1]) {
      const disk = new Mesh(new CircleGeometry(OLCU.kavis, 36), mz.siyah);
      disk.position.set(x, TEKER_Y, yon * 0.42);
      kok.add(disk);
    }
  }

  // Tekerlekler
  const tekerlekler: Group[] = [];
  const tekerZ = YARIM_W - OLCU.tekerGenislik / 2 - 0.012;
  for (const x of [ON_AKS, ARKA_AKS]) {
    for (const sol of [true, false]) {
      const t = tekerlek(mz, sol);
      t.position.set(x, TEKER_Y, sol ? tekerZ : -tekerZ);
      t.name = `teker-${x > 0 ? 'on' : 'arka'}-${sol ? 'sol' : 'sag'}`;
      tekerlekler.push(t);
      kok.add(t);
    }
  }

  const donder = (aci: number) => {
    for (const t of tekerlekler) (t.userData.ic as Group).rotation.z -= aci;
  };

  return { kok, govde, kabin, kapilar, tekerlekler, donder, malzemeler: mz };
}
