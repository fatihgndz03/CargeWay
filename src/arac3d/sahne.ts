/**
 * Temsili 3D araç sahnesi (adım 1: altyapı, adım 2: stilize gövde → govde.ts).
 *
 * Bu dosya ve three.js YALNIZCA /deneme/arac-3d sayfasında, sayfa açıldıktan sonra
 * dinamik import ile yüklenir; ana pakete girmez.
 *
 * Kurallar (docs/arac-3d-plan.md): geometri kodla üretilir, dış 3D dosyası / telifli doku yok,
 * gerçek bir aracın tasarımı ya da logosu taklit edilmez.
 */
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Line,
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

export type SahneSecenekleri = {
  /** Kullanıcı dokunana kadar yavaşça kendi etrafında dönsün mü? */
  otomatikDonus?: boolean;
  /** Sahne ilk kez çizildiğinde çağrılır (yükleniyor göstergesini kapatmak için). */
  hazir?: () => void;
  /** Dışarıda / geçişte / içeride durumu değişince çağrılır (düğmeleri göstermek için). */
  modDegisti?: (mod: Mod) => void;
};

export type Mod = 'dis' | 'gecis' | 'ic';
export type { KapiAdi };

export type Sahne = {
  /** Kamerayı başlangıç açısına döndürür. */
  sifirla: () => void;
  /** Kapıyı açıp kamerayı o koltuğa götürür (varsayılan: sürücü kapısı). */
  iceriGir: (kapi?: KapiAdi) => void;
  /** Kamerayı dışarı alır ve kapıyı kapatır. */
  disariCik: () => void;
  /** Sahneyi ve GPU kaynaklarını temizler. */
  kapat: () => void;
};

const YESIL = 0x22c55e;
const KAMERA_BASLANGIC = { x: 5.4, y: 2.5, z: 6.6 };
const HEDEF_Y = 0.72;

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
    new MeshStandardMaterial({ color: 0x161a17, roughness: 0.95, metalness: 0 }),
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
  const renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
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
  sahne.add(platform(), zeminGolgesi(), arac.kok);

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

  type Gecis = { bas: number; sure: number; adim: (t: number) => void; bitti?: () => void };
  let gecisler: Gecis[] = [];
  const gecisEkle = (sure: number, adim: (t: number) => void, bitti?: () => void, gecikme = 0) => {
    gecisler.push({ bas: performance.now() + gecikme * 1000, sure: (azHareket ? 0.25 : 1) * sure * 1000, adim, bitti });
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

  // Tıklama / dokunma: sürükleme ile karışmasın diye yalnızca kısa ve az hareketli basışlar sayılır
  const isin = new Raycaster();
  const fareNokta = new Vector2();
  const kapiBul = (ox: number, oy: number): KapiBilgisi | null => {
    const r = renderer.domElement.getBoundingClientRect();
    fareNokta.set(((ox - r.left) / r.width) * 2 - 1, -((oy - r.top) / r.height) * 2 + 1);
    isin.setFromCamera(fareNokta, kamera);
    const vuruslar = isin.intersectObject(arac.kok, true).filter((v) => v.object instanceof Mesh);
    const ilk = vuruslar[0]?.object;
    if (!ilk) return null;
    for (let n: typeof ilk | null = ilk; n; n = n.parent) {
      const k = arac.kapiBilgileri.find((b) => b.grup === n);
      if (k) return k;
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
    if (!b || mod !== 'dis') return;
    if (Math.hypot(e.clientX - b.x, e.clientY - b.y) > 8 || performance.now() - b.z > 600) return;
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
    if (mod !== 'gecis') kontrol.update();
    if (fareKonum) {
      const k = mod === 'dis' ? kapiBul(fareKonum.x, fareKonum.y) : null;
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
    sifirla() {
      if (mod !== 'dis') return;
      kamera.position.set(KAMERA_BASLANGIC.x, KAMERA_BASLANGIC.y, KAMERA_BASLANGIC.z);
      kontrol.target.set(0, HEDEF_Y, 0);
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
