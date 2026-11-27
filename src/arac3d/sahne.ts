/**
 * Temsili 3D araç sahnesi (adım 1: altyapı, adım 2: stilize gövde → govde.ts, adım 3: içeri girme,
 * adım 4: patlatılmış görünüm → bilesenler.ts).
 *
 * Bu dosya ve three.js YALNIZCA /deneme/arac-3d sayfasında, sayfa açıldıktan sonra
 * dinamik import ile yüklenir; ana pakete girmez.
 *
 * Kurallar (docs/arac-3d-plan.md): geometri kodla üretilir, dış 3D dosyası / telifli doku yok,
 * gerçek bir aracın tasarımı ya da logosu taklit edilmez.
 */
import {
  ACESFilmicToneMapping,
  Box3,
  CanvasTexture,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Line,
  type Material,
  type Object3D,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Raycaster,
  RingGeometry,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { aracOlustur, type KapiAdi, type KapiBilgisi } from './govde';
import { bilesenlerOlustur, PARCA_ADLARI, type ParcaAdi } from './bilesenler';

export type SahneSecenekleri = {
  /** Kullanıcı dokunana kadar yavaşça kendi etrafında dönsün mü? */
  otomatikDonus?: boolean;
  /** Sahne ilk kez çizildiğinde çağrılır (yükleniyor göstergesini kapatmak için). */
  hazir?: () => void;
  /** Dışarıda / geçişte / içeride durumu değişince çağrılır (düğmeleri göstermek için). */
  modDegisti?: (mod: Mod) => void;
  /** Patlatılmış görünümde bir parça seçilince / seçim kalkınca çağrılır (bilgi kartı için). */
  parcaSecildi?: (ad: ParcaAdi | null) => void;
};

export type Mod = 'dis' | 'gecis' | 'ic' | 'parca';
export type { KapiAdi, ParcaAdi };

export type Sahne = {
  /** Kamerayı başlangıç açısına döndürür. */
  sifirla: () => void;
  /** Kapıyı açıp kamerayı o koltuğa götürür (varsayılan: sürücü kapısı). */
  iceriGir: (kapi?: KapiAdi) => void;
  /** Kamerayı dışarı alır ve kapıyı kapatır. */
  disariCik: () => void;
  /** Patlatılmış görünümü açar (true) ya da aracı yeniden birleştirir (false). */
  parcalar: (ac: boolean) => void;
  /** Patlatılmış görünümde parçayı vurgular ve kamerayı ona çevirir; null seçimi kaldırır. */
  parcaSec: (ad: ParcaAdi | null) => void;
  /** Klavyeyle gezinme: +1 sonraki, −1 önceki parça. */
  parcaKaydir: (adim: number) => void;
  /** Sahneyi ve GPU kaynaklarını temizler. */
  kapat: () => void;
};

const YESIL = 0x22c55e;
const KAMERA_BASLANGIC = { x: 5.4, y: 2.5, z: 6.6 };
const HEDEF_Y = 0.72;
/**
 * Patlatılmış görünüm: gövde ne kadar yükselir, ne kadar saydamlaşır; kamera nereden bakar.
 * Deneme günlüğü: yarı saydam gövde (yerinde ya da yükseltilmiş) parçaları örtüyor ve yansımalar
 * parlak lekeler bırakıyordu → gövde yükselirken tamamen kaybolur; tekerlekler bağlam için kalır.
 */
const PATLAT = { kaldir: 0.7, opaklik: 0, sure: 1.8 };
const PARCA_KAMERA = { x: 4.4, y: 3.9, z: 5.6 };
const PARCA_HEDEF_Y = 0.75;
/**
 * Adım 5 — parça seçilince vurgulama yöntemi (deneme günlüğü):
 * 'soluk' = diğer parçalar koyu yarı saydam olur (seçilen), 'tel' = diğerleri tel kafes, 'isik' = yalnızca seçilen parlar.
 */
const VURGU: 'soluk' | 'tel' | 'isik' = 'soluk';
const ODAK_SURE = 0.9;
/** Masaüstünde bilgi kartı sahnenin sağını kaplar (w-80 + boşluk); seçilen parça kalan alanın ortasına kayar. */
const KART_PAYI_PX = (320 + 12) / 2;
/**
 * Parçaya özel kamera ayarı. Soket küçük ve yüzü aracın soluna (−z) bakar → o yandan ve yakından;
 * kablo ve soğutma hattı tüm araca yayılır → genel görünüm (deneme günlüğü: yakın odakta kesiliyordu).
 */
const ODAK: Partial<Record<ParcaAdi, { yon?: [number, number, number]; mesafe?: number; egim?: number }>> = {
  soket: { yon: [-0.45, 0.4, -1], mesafe: 1.5 },
  reduktor: { yon: [0.35, 0.45, 1] },
  kablo: { mesafe: 6.6, egim: 0.62 },
  sogutma: { mesafe: 7.2, egim: 0.62 },
};

/**
 * Zemin gölgesi: gerçek gölge haritası yerine tuvalde çizilen yumuşak radyal leke.
 * Deneme günlüğü: gölge haritası (PCFSoft) mobilde pahalı ve kenarı keskin; bu yöntem
 * tek doku + tek dörtgenle her cihazda aynı görünüyor.
 */
function zeminGolgesi(): Mesh {
  const tuval = document.createElement('canvas');
  tuval.width = tuval.height = 256;
  const ctx = tuval.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
    g.addColorStop(0, 'rgba(0,0,0,0.85)');
    g.addColorStop(0.45, 'rgba(0,0,0,0.45)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  const doku = new CanvasTexture(tuval);
  doku.colorSpace = SRGBColorSpace;
  const golge = new Mesh(
    new CircleGeometry(1, 48),
    new MeshBasicMaterial({ map: doku, transparent: true, depthWrite: false }),
  );
  golge.rotation.x = -Math.PI / 2;
  golge.scale.set(2.85, 1.45, 1);
  golge.position.y = 0.002;
  return golge;
}

/** Döner platform: koyu disk + ince yeşil halka. */
function platform(): Group {
  const grup = new Group();
  const disk = new Mesh(
    new CircleGeometry(3.0, 64),
    new MeshStandardMaterial({
      color: 0x161a17,
      roughness: 0.95,
      metalness: 0,
    }),
  );
  disk.rotation.x = -Math.PI / 2;
  const halka = new Mesh(
    new RingGeometry(2.97, 3.0, 128),
    new MeshBasicMaterial({ color: YESIL, transparent: true, opacity: 0.7 }),
  );
  halka.rotation.x = -Math.PI / 2;
  halka.position.y = 0.001;
  grup.add(disk, halka);
  return grup;
}

export function sahneKur(kap: HTMLElement, sec: SahneSecenekleri = {}): Sahne {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 1);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.touchAction = 'none';
  kap.appendChild(renderer.domElement);

  const sahne = new Scene();
  sahne.background = new Color(0x000000);

  const kamera = new PerspectiveCamera(40, 1, 0.1, 100);
  kamera.position.set(KAMERA_BASLANGIC.x, KAMERA_BASLANGIC.y, KAMERA_BASLANGIC.z);

  // Işık: gökyüzü/zemin dolgu + üstten anahtar ışık + arkadan yeşil kontur ışığı
  sahne.add(new HemisphereLight(0xe5f9ec, 0x0a0a0a, 1.4));
  const anahtar = new DirectionalLight(0xffffff, 2.2);
  anahtar.position.set(4, 7, 5);
  // Kontur ışığı nötr: yeşil kontur parlak siyah tavanda ve çamurluklarda yeşil leke yapıyordu
  const kontur = new DirectionalLight(0xdbe7e0, 0.55);
  kontur.position.set(-5, 3, -6);
  sahne.add(anahtar, kontur);

  // Yansımalar için ortam haritası: three.js'in kodla ürettiği nötr "oda" (dış dosya yok).
  // Deneme günlüğü: ortam haritası olmadan boya ve cam düz/mat görünüyordu.
  const pmrem = new PMREMGenerator(renderer);
  const ortam = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  sahne.environment = ortam;
  sahne.environmentIntensity = 0.55;

  const arac = aracOlustur();
  const bilesen = bilesenlerOlustur();
  sahne.add(platform(), zeminGolgesi(), arac.kok, bilesen.kok);

  const kontrol = new OrbitControls(kamera, renderer.domElement);
  kontrol.target.set(0, HEDEF_Y, 0);
  kontrol.enableDamping = true;
  kontrol.dampingFactor = 0.08;
  kontrol.enablePan = false;
  kontrol.minDistance = 4;
  kontrol.maxDistance = 12;
  kontrol.minPolarAngle = 0.25;
  kontrol.maxPolarAngle = Math.PI / 2 - 0.06; // zeminin altına inilmesin
  kontrol.rotateSpeed = 0.7;
  const azHareket = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  kontrol.autoRotate = (sec.otomatikDonus ?? true) && !azHareket;
  kontrol.autoRotateSpeed = 0.8;
  kontrol.update();
  // Kullanıcı tuttuğu anda otomatik dönüş kalıcı olarak durur
  const dokunuldu = () => {
    kontrol.autoRotate = false;
  };
  kontrol.addEventListener('start', dokunuldu);

  // -------------------------------------------------------------------------
  // Adım 3: kapıya tıklayınca kapı açılır, kamera koltuğa yumuşakça geçer.
  // -------------------------------------------------------------------------
  let mod: Mod = 'dis';
  const modAyarla = (m: Mod) => {
    mod = m;
    sec.modDegisti?.(m);
  };

  type Gecis = {
    bas: number;
    sure: number;
    adim: (t: number) => void;
    bitti?: () => void;
  };
  let gecisler: Gecis[] = [];
  const gecisEkle = (sure: number, adim: (t: number) => void, bitti?: () => void, gecikme = 0) => {
    gecisler.push({
      bas: performance.now() + gecikme * 1000,
      sure: (azHareket ? 0.25 : 1) * sure * 1000,
      adim,
      bitti,
    });
  };
  const yumusat = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const gecisleriIlerlet = () => {
    if (!gecisler.length) return;
    const simdi = performance.now();
    const bitenler: Gecis[] = [];
    for (const g of gecisler) {
      if (simdi < g.bas) continue;
      const t = Math.min((simdi - g.bas) / Math.max(g.sure, 1), 1);
      g.adim(yumusat(t));
      if (t >= 1) bitenler.push(g);
    }
    if (bitenler.length) {
      gecisler = gecisler.filter((g) => !bitenler.includes(g));
      for (const g of bitenler) g.bitti?.();
    }
  };

  const kapiAc = (k: KapiBilgisi, ac: boolean, sure: number, gecikme = 0) => {
    const bas = k.grup.rotation.y;
    const son = ac ? k.acikAci : 0;
    gecisEkle(sure, (t) => (k.grup.rotation.y = bas + (son - bas) * t), undefined, gecikme);
  };

  const disFov = () => (kamera.aspect < 1 ? 52 : 40);
  const icFov = () => (kamera.aspect < 1 ? 74 : 62);
  const icBakis = new Vector3(1, -0.1, 0).normalize();
  let aktifKapi: KapiBilgisi | null = null;

  /** Kamerayı (ve bakış noktasını) eğri boyunca götürür; görüş açısını da yumuşakça değiştirir. */
  const kameraYolu = (konumlar: Vector3[], hedefler: Vector3[], fovSon: number, sure: number, bitti: () => void) => {
    const yol = new CatmullRomCurve3(konumlar, false, 'centripetal');
    const hedefYol = new CatmullRomCurve3(hedefler, false, 'centripetal');
    const fovBas = kamera.fov;
    const h = new Vector3();
    gecisEkle(
      sure,
      (t) => {
        yol.getPoint(t, kamera.position);
        hedefYol.getPoint(t, h);
        kamera.fov = fovBas + (fovSon - fovBas) * t;
        kamera.updateProjectionMatrix();
        kamera.lookAt(h);
      },
      bitti,
    );
  };

  const disAyarlari = () => {
    kontrol.minDistance = 4;
    kontrol.maxDistance = 12;
    kontrol.minPolarAngle = 0.25;
    kontrol.maxPolarAngle = Math.PI / 2 - 0.06;
    kontrol.enableZoom = true;
    kontrol.rotateSpeed = 0.7;
  };
  const icAyarlari = () => {
    // Göz noktasının hemen önündeki hedefin çevresinde dönmek = başını çevirmek
    kontrol.minDistance = 0.12;
    kontrol.maxDistance = 0.12;
    kontrol.minPolarAngle = 0.7;
    kontrol.maxPolarAngle = 2.3;
    kontrol.enableZoom = false;
    kontrol.rotateSpeed = 0.4;
  };

  const iceriGir = (ad: KapiAdi = 'onSol') => {
    if (mod !== 'dis') return;
    const k = arac.kapiBilgileri.find((b) => b.ad === ad);
    if (!k) return;
    aktifKapi = k;
    modAyarla('gecis');
    kontrol.autoRotate = false;
    kontrol.enabled = false;
    const isaret = Math.sign(k.goz.z);
    const kapiOrtaX = k.ad.startsWith('on') ? 0.42 : -0.45;
    kapiAc(k, true, 0.75);
    kameraYolu(
      [
        kamera.position.clone(),
        new Vector3(kapiOrtaX, 1.4, isaret * 3.1),
        new Vector3(kapiOrtaX - 0.05, 1.24, isaret * 0.72),
        k.goz.clone(),
      ],
      [
        kontrol.target.clone(),
        new Vector3(kapiOrtaX, 1.0, 0),
        new Vector3(k.goz.x + 0.6, 1.05, 0),
        k.goz.clone().addScaledVector(icBakis, 1),
      ],
      icFov(),
      2.4,
      () => {
        kontrol.target.copy(k.goz).addScaledVector(icBakis, 0.12);
        icAyarlari();
        kontrol.enabled = true;
        kontrol.update();
        modAyarla('ic');
        // Oturunca kapı kapanır: yanda dış sac yerine kapı döşemesi görünür
        kapiAc(k, false, 0.8);
      },
    );
  };

  const disariCik = () => {
    if (mod !== 'ic' || !aktifKapi) return;
    const k = aktifKapi;
    modAyarla('gecis');
    kontrol.enabled = false;
    const isaret = Math.sign(k.goz.z);
    const kapiOrtaX = k.ad.startsWith('on') ? 0.42 : -0.45;
    const son = new Vector3(KAMERA_BASLANGIC.x, KAMERA_BASLANGIC.y, isaret * KAMERA_BASLANGIC.z);
    // Önce kapı açılır, kamera kapı yarı açıkken yola çıkar
    kapiAc(k, true, 0.6);
    kameraYolu(
      [
        kamera.position.clone(),
        new Vector3(kapiOrtaX - 0.05, 1.24, isaret * 0.72),
        new Vector3(kapiOrtaX + 0.6, 1.6, isaret * 3.4),
        son,
      ],
      [kontrol.target.clone(), new Vector3(kapiOrtaX, 1.0, 0), new Vector3(0, 0.9, 0), new Vector3(0, HEDEF_Y, 0)],
      disFov(),
      2.2,
      () => {
        kontrol.target.set(0, HEDEF_Y, 0);
        kapiAc(k, false, 0.7);
        disAyarlari();
        kontrol.enabled = true;
        kontrol.update();
        aktifKapi = null;
        modAyarla('dis');
      },
    );
  };

  // -------------------------------------------------------------------------
  // Adım 4: patlatılmış görünüm. Gövde (tekerlekler hariç) yükselip saydamlaşır, iç mekân gizlenir;
  // altındaki tahrik ve şarj bileşenleri birbirinden ayrılır (bilesenler.ts).
  // -------------------------------------------------------------------------
  const govdeNesneleri = arac.kok.children.filter((c) => !arac.tekerlekler.includes(c as Group));
  const govdeYlari = govdeNesneleri.map((n) => n.position.y);
  type SaydamBilgi = {
    m: Material;
    opak: number;
    saydam: boolean;
    derinlik: boolean;
  };
  const saydamlar: SaydamBilgi[] = [];
  {
    const goruldu = new Set<unknown>();
    for (const n of govdeNesneleri) {
      if (n === arac.ic) continue;
      n.traverse((c) => {
        if (!(c instanceof Mesh || c instanceof Line)) return;
        for (const m of Array.isArray(c.material) ? c.material : [c.material]) {
          if (goruldu.has(m)) continue;
          goruldu.add(m);
          saydamlar.push({
            m,
            opak: m.opacity,
            saydam: m.transparent,
            derinlik: m.depthWrite,
          });
        }
      });
    }
  }
  let patlatma = 0;
  let saydamMi = false;
  const patlatmaUygula = (t: number) => {
    patlatma = t;
    const kalk = PATLAT.kaldir * yumusat(Math.min(t / 0.8, 1));
    govdeNesneleri.forEach((n, i) => (n.position.y = govdeYlari[i] + kalk));
    const o = 1 - (1 - PATLAT.opaklik) * Math.min(t / 0.5, 1);
    const saydamOlsun = t > 0;
    for (const s of saydamlar) {
      if (saydamOlsun !== saydamMi) {
        s.m.transparent = saydamOlsun || s.saydam;
        s.m.depthWrite = saydamOlsun ? false : s.derinlik;
        s.m.needsUpdate = true;
      }
      s.m.opacity = s.opak * o;
    }
    saydamMi = saydamOlsun;
    arac.ic.visible = t === 0;
    // Tamamen saydamsa çizme (yansımalar ve parlamalar da kaybolsun)
    const govdeGorunsun = o > 0.005;
    for (const n of govdeNesneleri) if (n !== arac.ic) n.visible = govdeGorunsun;
    bilesen.patlat(t);
  };

  const parcalar = (ac: boolean) => {
    if (ac ? mod !== 'dis' : mod !== 'parca') return;
    if (odakta) return;
    if (seciliParca) {
      seciliParca = null;
      vurguKaldir();
      sec.parcaSecildi?.(null);
      kayma = 0;
      kaymaUygula();
    }
    modAyarla('gecis');
    kontrol.autoRotate = false;
    kontrol.enabled = false;
    const bas = patlatma;
    const son = ac ? 1 : 0;
    gecisEkle(PATLAT.sure, (t) => patlatmaUygula(bas + (son - bas) * t));
    // Kamera: patlatınca biraz yukarıdan ve uzaktan, birleştirince başlangıç açısı (aynı yanda kalır)
    const isaret = Math.sign(kamera.position.z) || 1;
    const k = ac ? PARCA_KAMERA : KAMERA_BASLANGIC;
    const hedefY = ac ? PARCA_HEDEF_Y : HEDEF_Y;
    const sonKonum = new Vector3(k.x * Math.sign(kamera.position.x || 1), k.y, isaret * k.z);
    const ara = kamera.position.clone().lerp(sonKonum, 0.5).multiplyScalar(1.04);
    kameraYolu(
      [kamera.position.clone(), ara, sonKonum],
      [kontrol.target.clone(), new Vector3(0, (kontrol.target.y + hedefY) / 2, 0), new Vector3(0, hedefY, 0)],
      disFov(),
      PATLAT.sure,
      () => {
        kontrol.target.set(0, hedefY, 0);
        disAyarlari();
        if (ac) kontrol.maxDistance = 14;
        kontrol.enabled = true;
        kontrol.update();
        modAyarla(ac ? 'parca' : 'dis');
      },
    );
  };

  // -------------------------------------------------------------------------
  // Adım 5: patlatılmış görünümde parçaya tıklayınca / dokununca vurgulama ve kamera odağı.
  // Bilgi kartı sayfada (React) gösterilir; sahne yalnızca hangi parçanın seçildiğini bildirir.
  // -------------------------------------------------------------------------
  const solukMz = new MeshStandardMaterial({
    color: 0x3b4249,
    roughness: 0.85,
    metalness: 0,
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
    wireframe: VURGU === 'tel',
  });
  if (VURGU === 'tel') solukMz.opacity = 0.18;
  const isikMzler = new Map<Material, Material>();
  const takas = new Map<Mesh, Material | Material[]>();
  const meshler = (kok: Object3D) => {
    const l: Mesh[] = [];
    kok.traverse((c) => {
      if (c instanceof Mesh) l.push(c);
    });
    return l;
  };
  const vurguKaldir = () => {
    for (const [m, mat] of takas) m.material = mat;
    takas.clear();
  };
  const vurguUygula = (ad: ParcaAdi) => {
    vurguKaldir();
    const secili = bilesen.parcalar[ad];
    if (VURGU === 'isik') {
      // Seçilen parçanın malzemelerinin parlayan kopyası (paylaşılan malzemeler diğer parçaları etkilemesin)
      for (const m of meshler(secili)) {
        const asil = m.material as Material;
        let k = isikMzler.get(asil);
        if (!k) {
          k = asil.clone();
          if (k instanceof MeshStandardMaterial) {
            k.emissive.set(YESIL);
            k.emissiveIntensity = 0.35;
          }
          isikMzler.set(asil, k);
        }
        takas.set(m, asil);
        m.material = k;
      }
      return;
    }
    // Tekerlekler de soluklaşır: yakın odakta seçilen parçanın önünü kapatıyorlardı
    for (const g of [...bilesen.kok.children, ...arac.tekerlekler]) {
      if (g === secili) continue;
      for (const m of meshler(g)) {
        takas.set(m, m.material);
        m.material = solukMz;
      }
    }
  };

  let seciliParca: ParcaAdi | null = null;
  let odakta = false;
  // Görüntü kaydırma (0 = yok, 1 = kart payı kadar sola): kamera konumunu değil yalnızca izdüşümü kaydırır
  let kayma = 0;
  const kartYanda = () => window.matchMedia?.('(min-width: 640px)').matches ?? true;
  const kaymaUygula = () => {
    const w = Math.max(kap.clientWidth, 1);
    const h = Math.max(kap.clientHeight, 1);
    if (kayma > 0.001) kamera.setViewOffset(w, h, kayma * KART_PAYI_PX, 0, w, h);
    else kamera.clearViewOffset();
  };
  const parcaKutusu = new Box3();
  const parcaSec = (ad: ParcaAdi | null) => {
    if (mod !== 'parca' || odakta || ad === seciliParca) return;
    seciliParca = ad;
    if (ad) vurguUygula(ad);
    else vurguKaldir();
    sec.parcaSecildi?.(ad);
    // Kamera: aynı bakış yönünden parçanın merkezine yaklaş (parçaya özel ayar varsa o yönden)
    const basYon = kamera.position.clone().sub(kontrol.target);
    const basMesafe = basYon.length();
    basYon.normalize();
    let sonYon = basYon.clone();
    let merkez: Vector3;
    let mesafe: number;
    if (ad) {
      parcaKutusu.setFromObject(bilesen.parcalar[ad]);
      merkez = parcaKutusu.getCenter(new Vector3());
      const boyut = parcaKutusu.getSize(new Vector3()).length();
      const ozel = ODAK[ad];
      mesafe = (ozel?.mesafe ?? Math.min(Math.max(boyut * 1.45, 2.1), 7.6)) * (kamera.aspect < 1 ? 1.15 : 1);
      if (ozel?.yon) sonYon = new Vector3(...ozel.yon).normalize();
      else if (ozel?.egim) {
        // Aynı yatay yönden, sabit yükseklik açısıyla (yayılmış sistemlerin tamamı kadraja girsin)
        sonYon.y = 0;
        sonYon.normalize().multiplyScalar(Math.cos(ozel.egim));
        sonYon.y = Math.sin(ozel.egim);
      }
    } else {
      merkez = new Vector3(0, PARCA_HEDEF_Y, 0);
      mesafe = new Vector3(PARCA_KAMERA.x, PARCA_KAMERA.y - PARCA_HEDEF_Y, PARCA_KAMERA.z).length();
    }
    const basHedef = kontrol.target.clone();
    const yon = new Vector3();
    const basKayma = kayma;
    const sonKayma = ad && kartYanda() ? 1 : 0;
    odakta = true;
    kontrol.enabled = false;
    gecisEkle(
      ODAK_SURE,
      (t) => {
        // Hedefin çevresinde küresel geçiş: kamera aracın içinden geçmesin (karşı yana dönerken yukarıdan)
        yon.lerpVectors(basYon, sonYon, t);
        yon.y += Math.sin(Math.PI * t) * 0.6 * (1 - basYon.dot(sonYon)) * 0.5;
        yon.normalize();
        kontrol.target.lerpVectors(basHedef, merkez, t);
        kamera.position.copy(kontrol.target).addScaledVector(yon, basMesafe + (mesafe - basMesafe) * t);
        if (kamera.position.y < 0.25) kamera.position.y = 0.25;
        kamera.lookAt(kontrol.target);
        kayma = basKayma + (sonKayma - basKayma) * t;
        kaymaUygula();
      },
      () => {
        odakta = false;
        kontrol.minDistance = ad ? 1.2 : 4;
        kontrol.enabled = true;
        kontrol.update();
      },
    );
  };
  /** Klavyeyle sıradaki / önceki parça. */
  const parcaKaydir = (adim: number) => {
    const i = seciliParca ? PARCA_ADLARI.indexOf(seciliParca) : adim > 0 ? -1 : 0;
    parcaSec(PARCA_ADLARI[(i + adim + PARCA_ADLARI.length) % PARCA_ADLARI.length]);
  };

  // Tıklama / dokunma: sürükleme ile karışmasın diye yalnızca kısa ve az hareketli basışlar sayılır
  const isin = new Raycaster();
  const fareNokta = new Vector2();
  const isinAyarla = (ox: number, oy: number) => {
    const r = renderer.domElement.getBoundingClientRect();
    fareNokta.set(((ox - r.left) / r.width) * 2 - 1, -((oy - r.top) / r.height) * 2 + 1);
    isin.setFromCamera(fareNokta, kamera);
  };
  const kapiBul = (ox: number, oy: number): KapiBilgisi | null => {
    isinAyarla(ox, oy);
    const vuruslar = isin.intersectObject(arac.kok, true).filter((v) => v.object instanceof Mesh);
    const ilk = vuruslar[0]?.object;
    if (!ilk) return null;
    for (let n: typeof ilk | null = ilk; n; n = n.parent) {
      const k = arac.kapiBilgileri.find((b) => b.grup === n);
      if (k) return k;
    }
    return null;
  };
  /** Patlatılmış görünümde ışının ilk vurduğu görünür parçanın adı. */
  const parcaBul = (ox: number, oy: number): ParcaAdi | null => {
    isinAyarla(ox, oy);
    for (const v of isin.intersectObject(bilesen.kok, true)) {
      if (!(v.object instanceof Mesh) || !v.object.visible) continue;
      for (let n: Object3D | null = v.object; n; n = n.parent) {
        const ad = n.name.startsWith('parca-') ? (n.name.slice(6) as ParcaAdi) : null;
        if (ad && ad in bilesen.parcalar) return ad;
      }
    }
    return null;
  };
  let basis: { x: number; y: number; z: number } | null = null;
  const basildi = (e: PointerEvent) => {
    basis = { x: e.clientX, y: e.clientY, z: performance.now() };
  };
  const birakildi = (e: PointerEvent) => {
    const b = basis;
    basis = null;
    if (!b || (mod !== 'dis' && mod !== 'parca')) return;
    if (Math.hypot(e.clientX - b.x, e.clientY - b.y) > 8 || performance.now() - b.z > 600) return;
    if (mod === 'parca') {
      // Boş alana dokunmak seçimi kaldırır
      parcaSec(parcaBul(e.clientX, e.clientY));
      return;
    }
    const k = kapiBul(e.clientX, e.clientY);
    if (k) iceriGir(k.ad);
  };
  // Fareyle kapının üzerine gelince imleç el olsun (kareye bir kez, son konumla)
  let fareKonum: { x: number; y: number } | null = null;
  const fareGezdi = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.buttons === 0) fareKonum = { x: e.clientX, y: e.clientY };
  };
  const tuval = renderer.domElement;
  tuval.addEventListener('pointerdown', basildi);
  tuval.addEventListener('pointerup', birakildi);
  tuval.addEventListener('pointermove', fareGezdi);

  // Boyut: kapsayıcıyı izle
  const boyutla = () => {
    const w = Math.max(kap.clientWidth, 1);
    const h = Math.max(kap.clientHeight, 1);
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    kamera.aspect = w / h;
    // Dar (dikey) ekranda aracın tamamı görünsün diye görüş açısını genişlet
    kamera.fov = mod === 'ic' ? icFov() : disFov();
    kamera.updateProjectionMatrix();
    // Bilgi kartı payı: kart yalnızca geniş ekranda sahnenin yanında; dar ekranda altta
    if (kayma > 0 && !odakta) kayma = seciliParca && kartYanda() ? 1 : 0;
    kaymaUygula();
  };
  boyutla();
  const ro = new ResizeObserver(boyutla);
  ro.observe(kap);

  // Ekranda değilse çizme (pil/ısı)
  let gorunur = true;
  const io = new IntersectionObserver(([g]) => {
    gorunur = g.isIntersecting;
  });
  io.observe(kap);

  let ilkKare = true;
  renderer.setAnimationLoop(() => {
    if (!gorunur || document.hidden) return;
    gecisleriIlerlet();
    if (mod !== 'gecis' && !odakta) kontrol.update();
    if (fareKonum) {
      const k =
        mod === 'dis' ? kapiBul(fareKonum.x, fareKonum.y) : mod === 'parca' ? parcaBul(fareKonum.x, fareKonum.y) : null;
      tuval.style.cursor = k ? 'pointer' : '';
      fareKonum = null;
    }
    renderer.render(sahne, kamera);
    if (ilkKare) {
      ilkKare = false;
      sec.hazir?.();
    }
  });

  return {
    iceriGir,
    disariCik,
    parcalar,
    parcaSec,
    parcaKaydir,
    sifirla() {
      if (mod !== 'dis' && mod !== 'parca') return;
      if (odakta) return;
      if (seciliParca) {
        seciliParca = null;
        vurguKaldir();
        sec.parcaSecildi?.(null);
        kayma = 0;
        kaymaUygula();
      }
      kontrol.minDistance = 4;
      const k = mod === 'parca' ? PARCA_KAMERA : KAMERA_BASLANGIC;
      kamera.position.set(k.x, k.y, k.z);
      kontrol.target.set(0, mod === 'parca' ? PARCA_HEDEF_Y : HEDEF_Y, 0);
      kontrol.update();
    },
    kapat() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      io.disconnect();
      kontrol.removeEventListener('start', dokunuldu);
      tuval.removeEventListener('pointerdown', basildi);
      tuval.removeEventListener('pointerup', birakildi);
      tuval.removeEventListener('pointermove', fareGezdi);
      gecisler = [];
      kontrol.dispose();
      sahne.traverse((n) => {
        if (n instanceof Mesh || n instanceof Line) {
          n.geometry.dispose();
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          for (const m of mats) {
            (m as MeshBasicMaterial).map?.dispose();
            m.dispose();
          }
        }
      });
      for (const m of Object.values(arac.malzemeler)) m.dispose();
      for (const m of bilesen.malzemeler) m.dispose();
      vurguKaldir();
      solukMz.dispose();
      for (const m of isikMzler.values()) m.dispose();
      for (const m of arac.icMalzemeler) {
        (m as MeshBasicMaterial).map?.dispose();
        m.dispose();
      }
      ortam.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
