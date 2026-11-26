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
 * Koordinatlar: +x aracın önü, +y yukarı, z genişlik (+x'e bakan birinin solu −z, sağı +z). Birim ≈ metre.
 * Türkiye'de sürücü solda oturur → sürücü kapısı `onSol` (−z).
 */
import {
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  type Material,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Shape,
  SplineCurve,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { icMekanOlustur, KOLTUK } from './ic';

/** Ölçüler (yaklaşık, genel bir kompakt crossover; hiçbir modelin ölçüsü değildir). */
export const OLCU = {
  genislik: 1.94,
  dingilArasi: 2.9,
  tekerYaricap: 0.41,
  tekerGenislik: 0.26,
  /** Çamurluk kavisi yarıçapı */
  kavis: 0.485,
  /** Yerden yükseklik (alt gövde tabanı) */
  taban: 0.22,
  /** Bel çizgisi (kapı camının alt kenarı), ön kapıda */
  bel: 0.98,
  /** Gövdenin arka ve ön uçlarının x'i */
  arkaUc: -2.36,
  onUc: 2.4,
} as const;

const ON_AKS = OLCU.dingilArasi / 2;
const ARKA_AKS = -OLCU.dingilArasi / 2;
const TEKER_Y = OLCU.tekerYaricap;
const YARIM_W = OLCU.genislik / 2;

export type KapiAdi = 'onSol' | 'arkaSol' | 'onSag' | 'arkaSag';

/** Kapının açılınca döneceği açı ve içeri girilince kameranın oturacağı göz noktası. */
export type KapiBilgisi = {
  ad: KapiAdi;
  grup: Group;
  /** Tam açık açısı (rotation.y, radyan) */
  acikAci: number;
  /** Koltuktaki göz noktası (yerel koordinat) */
  goz: Vector3;
};

/** Kapı açılma açısı (≈ 66°) */
const KAPI_ACI = 1.15;

export type AracParcalari = {
  kok: Group;
  govde: Mesh;
  kabin: Mesh;
  ic: Group;
  kapilar: Record<KapiAdi, Group>;
  kapiBilgileri: KapiBilgisi[];
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
  // Coupe-SUV: cam alt hattı arkaya doğru belirgin yükselir
  return OLCU.bel + 0.1 * yumusak(0.7, -1.9, x);
}

function altGovdeKesiti(x: number): Kesit {
  const { arkaUc, onUc, taban } = OLCU;
  // Üst hat: uzun kaput öne doğru alçalır
  let ytTaban = belY(x);
  if (x > 1.0) ytTaban -= 0.14 * Math.pow(yumusak(1.0, 2.3, x), 1.1);
  // Uçlarda kapanma (yan görünüş). Önde üst kenar keskin (ince far şeridi buraya oturur),
  // alt kısım geriye doğru çekilir (çene); arkada kısa, küt kuyruk.
  let yt: number;
  let yb: number;
  if (x > 0) {
    const yc = 0.72;
    yt = yc + (ytTaban - yc) * kapanma((x - 2.08) / (onUc - 2.08), 2.3);
    yb = yc + (taban + 0.04 - yc) * kapanma((x - 1.85) / (onUc - 1.85), 1.6);
  } else {
    const yc = 0.88;
    yt = yc + (ytTaban - yc) * kapanma((-x - 2.12) / (-arkaUc - 2.12), 3);
    yb = yc + (taban + 0.06 - yc) * kapanma((-x - 1.95) / (-arkaUc - 1.95), 2.2);
  }
  // Üstten görünüş: önde köşeler geriye süpürülür, arkada daha küt
  const fPlan =
    x > 0 ? kapanma((x - 1.6) / (onUc - 1.6), 2.4) : kapanma((-x - 1.95) / (-arkaUc - 1.95), 3.5);
  // Çamurluk omuzları: arka teker üstünde belirgin, önde hafif şişkinlik
  const omuz = 0.03 * Math.exp(-(((x - ARKA_AKS) / 0.75) ** 2)) + 0.016 * Math.exp(-(((x - ON_AKS) / 0.6) ** 2));
  return {
    hw: YARIM_W * fPlan,
    yb,
    yt,
    rU: 0.12,
    rA: 0.08,
    carpan: (y) => {
      const s = sinirla((y - yb) / Math.max(yt - yb, 1e-4));
      // üstte içe eğim, ortada bombe + omuzlar, altta içe kıvrım
      return (1 - 0.06 * s * s) * (1 + (0.01 + omuz) * Math.sin(Math.PI * s)) * (1 - 0.03 * Math.pow(1 - s, 3));
    },
  };
}

// ---------------------------------------------------------------------------
// Cam ev biçimi
// ---------------------------------------------------------------------------

const KABIN_ON = 1.2;
const KABIN_ARKA = -2.08;
/** Cam ev tavan hattı: ön cam → tavan → arka cam (yan görünüş). */
const tavanTablo = new SplineCurve([
  new Vector2(KABIN_ON, belY(KABIN_ON) - 0.04),
  new Vector2(0.85, 1.2),
  new Vector2(0.45, 1.415),
  new Vector2(0.0, 1.525),
  new Vector2(-0.6, 1.545),
  new Vector2(-1.2, 1.49),
  new Vector2(-1.65, 1.37),
  new Vector2(-1.95, 1.2),
  new Vector2(KABIN_ARKA, belY(KABIN_ARKA)),
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

const KABIN_ALT_HW = 0.75;
const KABIN_UST_HW = 0.61;
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
// Kapı hatları (yan görünüş, x-y). Sıra: ön-alt, ön-üst, arka-üst, arka-alt (menteşe ön kenarda).
// Gövde ve cam ev, kapı açıklığını gölgelendiricide bu dörtgenlerle keser (adım 3).
// ---------------------------------------------------------------------------

type Dortgen = [number, number][];
const kapiUst = (x: number) => belY(x) - 0.01;
/** Kapılar alt kaplamanın (taban + 0,13) ve kavis çerçevelerinin dışında kalır. */
const KAPI_ALT = OLCU.taban + 0.135;
const ON_SAC: Dortgen = [
  [0.89, KAPI_ALT],
  [0.95, kapiUst(0.95)],
  [0.0, kapiUst(0)],
  [0.0, KAPI_ALT],
];
const ON_CAM: Dortgen = [
  [0.92, belY(0.92)],
  [0.42, 1.37],
  [0.03, 1.445],
  [0.03, belY(0.03)],
];
const ARKA_SAC: Dortgen = [
  [-0.03, KAPI_ALT],
  [-0.03, kapiUst(-0.03)],
  [-0.98, kapiUst(-0.98)],
  [-0.89, KAPI_ALT],
];
const ARKA_CAM: Dortgen = [
  [-0.05, belY(-0.05)],
  [-0.05, 1.445],
  [-0.72, 1.44],
  [-1.0, belY(-1.0)],
];
/**
 * C direği: bu doğrunun arkasında kalan yan cam, gövde renginde boyanır (cam hattı arkada
 * sivri biter; tasarım dili için — adım 3b).
 */
const C_DIREK: [[number, number], [number, number]] = [
  [-1.12, 1.5],
  [-1.82, belY(-1.82)],
];

/** Dörtgeni ağırlık merkezine doğru `pay` kadar küçültür; `altUzat` alt kenarı aşağı indirir. */
function daralt(d: Dortgen, pay: number, altUzat = 0): Dortgen {
  const mx = d.reduce((t, p) => t + p[0], 0) / 4;
  const my = d.reduce((t, p) => t + p[1], 0) / 4;
  return d.map(([x, y], i) => {
    const dx = mx - x;
    const dy = my - y;
    const l = Math.hypot(dx, dy) || 1;
    const alt = i === 0 || i === 3;
    return [x + (dx / l) * pay, y + (dy / l) * pay - (alt ? altUzat : 0)];
  });
}

/** GLSL: p noktası dışbükey dörtgenin içinde mi? (kenar işaretleri aynıysa içeride) */
const ON_ISIK_Y = 0.8;
const ARKA_ISIK_Y = 0.98;

const GLSL_DORTGEN = `
float cgParca(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
float cgKenar(vec2 p, vec2 a, vec2 b) { return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x); }
bool cgIcinde(vec2 p, vec2 a, vec2 b, vec2 c, vec2 d) {
  vec4 s = vec4(cgKenar(p, a, b), cgKenar(p, b, c), cgKenar(p, c, d), cgKenar(p, d, a));
  return all(greaterThanEqual(s, vec4(0.0))) || all(lessThanEqual(s, vec4(0.0)));
}
`;
const glslV = ([x, y]: [number, number]) => `vec2(${x.toFixed(4)}, ${y.toFixed(4)})`;
const glslDortgen = (p: string, d: Dortgen) => `cgIcinde(${p}, ${d.map(glslV).join(', ')})`;

// ---------------------------------------------------------------------------
// Malzemeler
// ---------------------------------------------------------------------------

const BOYA_RENGI = 0xb4b8bc;
/** BOYA_RENGI'nin doğrusal (linear) karşılığı — gölgelendiricide C direğini boyamak için */
const BOYA_GLSL = 'vec3(0.456, 0.479, 0.503)';

function boyaMalzemesi() {
  return new MeshPhysicalMaterial({
    color: BOYA_RENGI, // saten titanyum gri — marka rengi değil
    metalness: 0.7,
    roughness: 0.34,
    clearcoat: 0.7,
    clearcoatRoughness: 0.22,
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
      GLSL_DORTGEN +
      sh.fragmentShader
        .replace(
          '#include <clipping_planes_fragment>',
          `#include <clipping_planes_fragment>
  {
    vec2 d1 = vYerel.xy - vec2(${f(ON_AKS)}, ${f(TEKER_Y)});
    vec2 d2 = vYerel.xy - vec2(${f(ARKA_AKS)}, ${f(TEKER_Y)});
    if (dot(d1, d1) < ${k2} || dot(d2, d2) < ${k2}) discard;
    // Kapı açıklıkları (kapı sacının biraz içi; kapalıyken kapı sacı örter)
    if (abs(vYerel.z) > 0.55 && (${glslDortgen('vYerel.xy', daralt(ON_SAC, 0.012))} || ${glslDortgen('vYerel.xy', daralt(ARKA_SAC, 0.012))})) discard;
    // Cam evin altındaki "kapak": iç mekân aşağıdan yukarıya tek hacim olsun
    if (vYerelN.y > 0.5 && abs(vYerel.z) < 0.68 && vYerel.x > ${f(KABIN_ARKA + 0.12)} && vYerel.x < 0.95) discard;
  }`,
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
  {
    // Ön: kaputun ön kenarında tam genişlik ince ışık şeridi; köşelerde aşağı inen ">" biçimli
    // dikey ışıklar (koyu girinti içinde); altta koyu hava girişi. Arka: tam genişlik ince stop şeridi.
    float onOn = step(0.25, vYerelN.x);
    float az = abs(vYerel.z);
    float onB = onOn * step(abs(vYerel.y - ${f(ON_ISIK_Y)}), 0.0075) * step(az, 0.84);
    float onKoyu = onOn * step(abs(vYerel.y - ${f(ON_ISIK_Y)}), 0.02) * step(az, 0.86);
    float dk = min(cgParca(vec2(az, vYerel.y), vec2(0.84, ${f(ON_ISIK_Y)}), vec2(0.755, 0.6)),
                   cgParca(vec2(az, vYerel.y), vec2(0.755, 0.6), vec2(0.8, 0.49)));
    float onX = step(1.9, vYerel.x) * step(0.1, vYerelN.x);
    onB = max(onB, onX * step(dk, 0.008));
    onKoyu = max(onKoyu, onX * step(dk, 0.035));
    float giris = step(0.45, vYerelN.x) * step(0.3, vYerel.y) * step(vYerel.y, 0.45) * step(az, 0.62);
    onKoyu = max(onKoyu, giris);
    float arka = step(0.3, -vYerelN.x);
    float arkaKoyu = arka * step(abs(vYerel.y - ${f(ARKA_ISIK_Y)}), 0.03) * step(az, 0.86);
    float arkaB = arka * step(abs(vYerel.y - ${f(ARKA_ISIK_Y)}), 0.009) * step(az, 0.83);
    // Alt kaplama (mat siyah plastik) ve çamurluk kavisi çerçevesi: yan yüzü inceltir, crossover duruşu verir
    float kd1 = length(vYerel.xy - vec2(${f(ON_AKS)}, ${f(TEKER_Y)}));
    float kd2 = length(vYerel.xy - vec2(${f(ARKA_AKS)}, ${f(TEKER_Y)}));
    float kavisCerceve = (1.0 - step(${f(OLCU.kavis + 0.085)}, min(kd1, kd2))) * step(vYerelN.y, 0.6);
    float kaplama = max(1.0 - step(${f(OLCU.taban + 0.13)}, vYerel.y), kavisCerceve);
    float yanB = step(0.6, abs(vYerelN.z)) * step(${f(OLCU.taban + 0.075)}, vYerel.y) * step(vYerel.y, ${f(OLCU.taban + 0.09)}) * step(abs(vYerel.x), 0.86);
    // Bel hattı kaplaması: cam evin dibindeki omuz üstü mat siyah (cam ev "yüzer"; içeriden bakınca
    // cam ardında beyaz bir raf görünmesin diye — adım 3 deneme günlüğü)
    float belKaplama = step(0.55, vYerelN.y) * step(0.66, abs(vYerel.z)) * step(abs(vYerel.z), 0.8) * step(${f(KABIN_ARKA + 0.05)}, vYerel.x) * step(vYerel.x, ${f(KABIN_ON + 0.02)});
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.035), max(max(kaplama, belKaplama), max(onKoyu, arkaKoyu)));
    // İçeriden görünen yüz (arka yüz): koyu iç kaplama
    if (!gl_FrontFacing) { diffuseColor.rgb = vec3(0.045, 0.048, 0.05); onB = 0.0; arkaB = 0.0; yanB = 0.0; }
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.02), yanB);
    totalEmissiveRadiance += vec3(1.0, 0.99, 0.95) * 2.6 * onB;
    totalEmissiveRadiance += vec3(1.0, 0.06, 0.05) * 1.8 * arkaB;
    totalEmissiveRadiance += vec3(0.133, 0.773, 0.369) * 1.2 * yanB;
  }`,
        );
  };
  m.customProgramCacheKey = () => 'cargeway-arac-govde-v6';
  return m;
}

/**
 * Cam: koyu füme, yarı saydam (dışarıdan iç mekân seçilir, içeriden dışarısı görünür).
 * Deneme günlüğü (adım 3): opak camla içeri girince dünya simsiyah kalıyordu.
 */
function camMalzemesi() {
  return new MeshPhysicalMaterial({
    color: 0x0a100d,
    metalness: 0.2,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    transparent: true,
    opacity: 0.74,
    depthWrite: false,
    side: DoubleSide,
  });
}

/** Cam evin camı: kapı camlarının arkasını ve cam evin tabanını keser (kapı açılınca boşluk kalsın). */
function kabinCamMalzemesi() {
  const m = camMalzemesi();
  m.onBeforeCompile = (sh) => {
    sh.vertexShader =
      'varying vec3 vYerel;\nvarying vec3 vYerelN;\n' +
      sh.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\n  vYerel = position;\n  vYerelN = normal;',
      );
    sh.fragmentShader =
      'varying vec3 vYerel;\nvarying vec3 vYerelN;\n' +
      GLSL_DORTGEN +
      sh.fragmentShader
        .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
  if (vYerelN.y < -0.5) discard;
  if (abs(vYerelN.z) > 0.3 && (${glslDortgen('vYerel.xy', daralt(ON_CAM, 0.006, 0.12))} || ${glslDortgen('vYerel.xy', daralt(ARKA_CAM, 0.006, 0.12))})) discard;`,
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
  // C direği: çizginin arkasındaki yan cam gövde renginde ve opak (cam hattı arkada sivri biter)
  float cgDirek = step(0.25, abs(vYerelN.z)) * step(cgKenar(vYerel.xy, ${glslV(C_DIREK[0])}, ${glslV(C_DIREK[1])}), 0.0);
  if (!gl_FrontFacing) cgDirek *= 0.0;
  diffuseColor = mix(diffuseColor, vec4(${BOYA_GLSL}, 1.0), cgDirek);
  // A direği: ön kapı camının önündeki yan cam parlak siyah ve opak
  float cgA = step(0.35, abs(vYerelN.z)) * step(cgKenar(vYerel.xy, ${glslV(ON_CAM[0])}, ${glslV(ON_CAM[1])}), 0.0);
  if (!gl_FrontFacing) cgA *= 0.0;
  diffuseColor = mix(diffuseColor, vec4(0.006, 0.007, 0.008, 1.0), cgA);`,
        )
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = mix(roughnessFactor, 0.34, cgDirek);')
        .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\n  metalnessFactor = mix(metalnessFactor, 0.7, cgDirek);');
  };
  m.customProgramCacheKey = () => 'cargeway-arac-kabin-cam-v3';
  return m;
}

/** Tavan: dışarıdan gövde renginde, içeriden (arka yüz) açık gri tavan döşemesi. */
function tavanMalzemesi() {
  const m = new MeshPhysicalMaterial({
    color: BOYA_RENGI, // gövde renginde "yüzen" tavan; A direği ve cam hattı siyah
    metalness: 0.7,
    roughness: 0.34,
    clearcoat: 0.7,
    clearcoatRoughness: 0.22,
    side: DoubleSide,
  });
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      '#include <color_fragment>',
      '#include <color_fragment>\n  if (!gl_FrontFacing) diffuseColor.rgb = vec3(0.16, 0.165, 0.17);',
    );
  };
  m.customProgramCacheKey = () => 'cargeway-arac-tavan-v1';
  return m;
}

function malzemeler() {
  return {
    govde: govdeMalzemesi(),
    boya: boyaMalzemesi(),
    cam: camMalzemesi(),
    kabinCam: kabinCamMalzemesi(),
    tavan: tavanMalzemesi(),
    /** Kapı iç döşemesi ve kapı kenarı */
    doseme: new MeshStandardMaterial({ color: 0x1b1e21, roughness: 0.85, metalness: 0.05, side: DoubleSide }),
    siyah: new MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.75, metalness: 0.1, side: DoubleSide }),
    lastik: new MeshStandardMaterial({ color: 0x121212, roughness: 0.92, metalness: 0 }),
    jant: new MeshStandardMaterial({ color: 0x9aa1a8, roughness: 0.28, metalness: 0.85 }),
    jantIc: new MeshStandardMaterial({ color: 0x1a1d20, roughness: 0.5, metalness: 0.5 }),
    /** Parlak siyah (ayna gövdesi) */
    tavanSiyah: new MeshPhysicalMaterial({ color: 0x0c0d0e, metalness: 0.3, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
    jantKoyu: new MeshStandardMaterial({ color: 0x3b4046, roughness: 0.35, metalness: 0.8 }),
    derz: new LineBasicMaterial({ color: 0x24282c }),
    /** İç mekân ortam ışığı çizgisi (site yeşili #22c55e) */
    icIsik: new LineBasicMaterial({ color: 0x22c55e }),
  };
}

type Malzemeler = ReturnType<typeof malzemeler>;

// ---------------------------------------------------------------------------
// Parçalar
// ---------------------------------------------------------------------------

/**
 * Tekerlek: ince profilli lastik + büyük "türbin" jant (genel desen; hiçbir üreticinin jantı değil).
 * Kanatlar göbekten dışa doğru kıvrılan 10 ince yaprak; ExtrudeGeometry ile kodla üretilir.
 */
function tekerlek(mz: Malzemeler, artiZ: boolean): Group {
  const { tekerYaricap: r, tekerGenislik: w } = OLCU;
  const grup = new Group();
  const ic = new Group(); // dönen kısım
  grup.add(ic);
  const dis = artiZ ? 1 : -1;

  const lastik = new Mesh(new CylinderGeometry(r - 0.015, r - 0.015, w * 0.82, 48, 1, true), mz.lastik);
  lastik.rotation.x = Math.PI / 2;
  ic.add(lastik);
  for (const yon of [1, -1]) {
    const yanak = new Mesh(new TorusGeometry(r - 0.045, 0.045, 12, 56), mz.lastik);
    yanak.position.z = yon * w * 0.37;
    ic.add(yanak);
  }
  const jantR = r * 0.76;
  // Jant içi (koyu) ve dış dudak
  const tas = new Mesh(new CylinderGeometry(jantR, jantR, w * 0.7, 48), mz.jantIc);
  tas.rotation.x = Math.PI / 2;
  ic.add(tas);
  const dudak = new Mesh(new TorusGeometry(jantR, 0.014, 8, 64), mz.jant);
  dudak.position.z = dis * w * 0.36;
  ic.add(dudak);

  // Türbin kanatları
  const N = 10;
  const r0 = r * 0.16;
  const r1 = jantR - 0.01;
  const kanat = new Shape();
  const adim = 10;
  const kenar = (t: number, taraf: number): [number, number] => {
    const rr = r0 + (r1 - r0) * t;
    // dışa doğru kıvrım + uca doğru genişleyen yaprak
    const aci = 0.55 * t * t + taraf * (0.07 + 0.09 * t);
    return [rr * Math.cos(aci), rr * Math.sin(aci)];
  };
  kanat.moveTo(...kenar(0, -1));
  for (let i = 1; i <= adim; i++) kanat.lineTo(...kenar(i / adim, -1));
  for (let i = adim; i >= 0; i--) kanat.lineTo(...kenar(i / adim, 1));
  const kanatGeo = new ExtrudeGeometry(kanat, { depth: 0.022, bevelEnabled: false, curveSegments: 1 });
  for (let i = 0; i < N; i++) {
    const k = new Mesh(kanatGeo, i % 2 ? mz.jant : mz.jantKoyu);
    k.rotation.z = (i / N) * Math.PI * 2;
    k.position.z = dis > 0 ? w * 0.31 : -w * 0.31 - 0.022;
    ic.add(k);
  }
  const gobek = new Mesh(new CylinderGeometry(r0 + 0.01, r0 + 0.01, 0.05, 24), mz.jant);
  gobek.rotation.x = Math.PI / 2;
  gobek.position.z = dis * w * 0.34;
  ic.add(gobek);
  // Göbek kapağı: koyu ve logosuz
  const kapak = new Mesh(new CircleGeometry(r0 * 0.7, 24), mz.jantIc);
  kapak.position.z = dis * (w * 0.34 + 0.026);
  if (!artiZ) kapak.rotation.y = Math.PI;
  ic.add(kapak);

  grup.userData.ic = ic;
  return grup;
}

/** Yan ayna: ince ayak + damla biçimli gövde (kapı ile birlikte açılır). */
function ayna(mz: Malzemeler, isaret: number): Group {
  const g = new Group();
  const ayak = new Mesh(new BoxGeometry(0.07, 0.025, 0.09), mz.siyah);
  ayak.position.set(0, 0, isaret * 0.045);
  const govde = new Mesh(new RoundedBoxGeometry(0.15, 0.08, 0.16, 3, 0.035), mz.tavanSiyah);
  govde.position.set(-0.03, 0.03, isaret * 0.15);
  const cam = new Mesh(new BoxGeometry(0.005, 0.065, 0.14), mz.cam);
  cam.position.set(-0.106, 0.03, isaret * 0.15);
  g.add(ayak, govde, cam);
  return g;
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

/** Dörtgenin kenarı boyunca dış (zDis) ve iç (zIc) yüzeyleri birleştiren şerit (kapı kalınlığı). */
function kenarSeridi(dortgen: [number, number][], zDis: ZFn, zIc: ZFn, ofsetX: number, isaret: number) {
  const konum: number[] = [];
  const indis: number[] = [];
  const kenar = [...dortgen, dortgen[0]];
  let n = 0;
  for (let k = 0; k < kenar.length - 1; k++) {
    const [x0, y0] = kenar[k];
    const [x1, y1] = kenar[k + 1];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      konum.push(x - ofsetX, y, isaret * zDis(x, y), x - ofsetX, y, isaret * zIc(x, y));
      if (i < 12) indis.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
      n += 2;
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(konum, 3));
  g.setIndex(indis);
  g.computeVertexNormals();
  return g;
}

const KAPI_KALINLIK = 0.05;
const govdeZ: ZFn = (x, y) => yuzeyZ(altGovdeKesiti(x), y);
const kabinZ: ZFn = (x, y) => yuzeyZ(kabinKesiti(x), y);

/**
 * Kapı: menteşe (ön kenar) etrafında dönen Group. Sac gövde yüzeyini, cam cam evin
 * yüzeyini birkaç milimetre dışarıdan izler. `artiZ` false ise −z tarafına aynalanır.
 */
function kapi(mz: Malzemeler, ad: string, sac: [number, number][], cam: [number, number][], artiZ: boolean): Group {
  const menteseX = Math.max(sac[0][0], sac[1][0]);
  const isaret = artiZ ? 1 : -1;
  const grup = new Group();
  grup.name = ad;
  grup.position.set(menteseX, 0, 0);

  const sacMesh = new Mesh(yuzeyIzgarasi(sac, (x, y) => govdeZ(x, y) + 0.004, menteseX, isaret), mz.boya);
  sacMesh.name = 'kapi-saci';
  const derz = kenarCizgisi(sac, (x, y) => govdeZ(x, y) + 0.007, menteseX, isaret, mz);

  const camMesh = new Mesh(yuzeyIzgarasi(cam, (x, y) => kabinZ(x, y) + 0.004, menteseX, isaret, 8, 8), mz.cam);
  camMesh.name = 'kapi-cami';
  const cerceve = kenarCizgisi(cam, (x, y) => kabinZ(x, y) + 0.006, menteseX, isaret, mz);

  // İç döşeme (gövde yüzeyinin ~5 cm içinde) ve iki yüzü birleştiren kenar şeridi: kapı açılınca
  // tek kat sac yerine kalınlığı olan bir kapı görünür. Döşeme çift yüzlü; içeriden aydınlatma doğru.
  const icZ: ZFn = (x, y) => govdeZ(x, y) - KAPI_KALINLIK;
  const doseme = new Mesh(yuzeyIzgarasi(sac, icZ, menteseX, isaret, 10, 10), mz.doseme);
  doseme.name = 'kapi-dosemesi';
  const kenar = new Mesh(kenarSeridi(sac, (x, y) => govdeZ(x, y) + 0.003, icZ, menteseX, isaret), mz.doseme);
  // Döşemede ince yeşil ortam ışığı çizgisi (site rengi)
  const isikY = (x: number) => belY(x) - 0.16;
  const [x0, x1] = [Math.max(sac[0][0], sac[1][0]) - 0.08, Math.min(sac[2][0], sac[3][0]) + 0.08];
  const isikNokta: Vector3[] = [];
  for (let n = 0; n <= 12; n++) {
    const x = x0 + ((x1 - x0) * n) / 12;
    isikNokta.push(new Vector3(x - menteseX, isikY(x), isaret * (icZ(x, isikY(x)) - 0.004)));
  }
  const isik = new Line(new BufferGeometry().setFromPoints(isikNokta), mz.icIsik);
  grup.add(doseme, kenar, isik);

  // Kapı kolu: gömme tip, ince siyah çubuk (genel)
  const kolX = menteseX - 0.27;
  const kolY = belY(kolX) - 0.13;
  const kol = new Mesh(new BoxGeometry(0.16, 0.024, 0.01), mz.siyah);
  kol.position.set(-0.27, kolY, isaret * (govdeZ(kolX, kolY) + 0.008));

  grup.add(sacMesh, derz, camMesh, cerceve, kol);
  // Ön kapılarda yan ayna (kapının ön üst köşesi)
  if (ad.startsWith('kapi-on')) {
    const ax = menteseX - 0.1;
    const ay = belY(ax) + 0.02;
    const a = ayna(mz, isaret);
    a.position.set(ax - menteseX, ay, isaret * (govdeZ(ax, belY(ax) - 0.02) - 0.02));
    grup.add(a);
  }
  grup.userData.artiZ = artiZ;
  return grup;
}

export function aracOlustur(): AracParcalari & { malzemeler: Malzemeler; icMalzemeler: Material[] } {
  const mz = malzemeler();
  const kok = new Group();
  kok.name = 'arac';

  // Alt gövde
  const govde = new Mesh(loft(istasyonlar(OLCU.arkaUc, OLCU.onUc, 110), altGovdeKesiti), mz.govde);
  govde.name = 'govde';
  kok.add(govde);

  // Cam ev + tavan (tavan bölgesi ikinci malzeme grubu → parlak siyah "yüzen tavan")
  const kabin = new Mesh(
    loft(istasyonlar(KABIN_ARKA, KABIN_ON, 70), kabinKesiti, (x) => x < 0.22 && x > -1.45),
    [mz.kabinCam, mz.tavan],
  );
  kabin.name = 'kabin';
  kok.add(kabin);

  const kapilar = {
    onSol: kapi(mz, 'kapi-on-sol', ON_SAC, ON_CAM, false),
    arkaSol: kapi(mz, 'kapi-arka-sol', ARKA_SAC, ARKA_CAM, false),
    onSag: kapi(mz, 'kapi-on-sag', ON_SAC, ON_CAM, true),
    arkaSag: kapi(mz, 'kapi-arka-sag', ARKA_SAC, ARKA_CAM, true),
  };
  kok.add(kapilar.onSol, kapilar.arkaSol, kapilar.onSag, kapilar.arkaSag);
  const kapiBilgileri: KapiBilgisi[] = (Object.keys(kapilar) as KapiAdi[]).map((ad) => {
    const sol = ad.endsWith('Sol');
    const on = ad.startsWith('on');
    return {
      ad,
      grup: kapilar[ad],
      // −z tarafındaki kapı dışarı (−z) doğru açılsın diye ters yönde döner
      acikAci: sol ? -KAPI_ACI : KAPI_ACI,
      goz: new Vector3((on ? KOLTUK.onX : KOLTUK.arkaX) - 0.15, KOLTUK.gozY, (sol ? -1 : 1) * KOLTUK.z),
    };
  });

  // İç mekân
  const icMekan = icMekanOlustur();
  kok.add(icMekan.kok);

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
      const t = tekerlek(mz, !sol);
      t.position.set(x, TEKER_Y, sol ? -tekerZ : tekerZ);
      t.name = `teker-${x > 0 ? 'on' : 'arka'}-${sol ? 'sol' : 'sag'}`;
      tekerlekler.push(t);
      kok.add(t);
    }
  }

  const donder = (aci: number) => {
    for (const t of tekerlekler) (t.userData.ic as Group).rotation.z -= aci;
  };

  return {
    kok,
    govde,
    kabin,
    ic: icMekan.kok,
    kapilar,
    kapiBilgileri,
    tekerlekler,
    donder,
    malzemeler: mz,
    icMalzemeler: icMekan.malzemeler,
  };
}
