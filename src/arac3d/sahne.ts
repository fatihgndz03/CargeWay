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
  RingGeometry,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { aracOlustur } from './govde';

export type SahneSecenekleri = {
  /** Kullanıcı dokunana kadar yavaşça kendi etrafında dönsün mü? */
  otomatikDonus?: boolean;
  /** Sahne ilk kez çizildiğinde çağrılır (yükleniyor göstergesini kapatmak için). */
  hazir?: () => void;
};

export type Sahne = {
  /** Kamerayı başlangıç açısına döndürür. */
  sifirla: () => void;
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

  // Boyut: kapsayıcıyı izle
  const boyutla = () => {
    const w = Math.max(kap.clientWidth, 1);
    const h = Math.max(kap.clientHeight, 1);
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    kamera.aspect = w / h;
    // Dar (dikey) ekranda aracın tamamı görünsün diye görüş açısını genişlet
    kamera.fov = kamera.aspect < 1 ? 52 : 40;
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
    kontrol.update();
    renderer.render(sahne, kamera);
    if (ilkKare) {
      ilkKare = false;
      sec.hazir?.();
    }
  });

  return {
    sifirla() {
      kamera.position.set(KAMERA_BASLANGIC.x, KAMERA_BASLANGIC.y, KAMERA_BASLANGIC.z);
      kontrol.target.set(0, HEDEF_Y, 0);
      kontrol.update();
    },
    kapat() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      io.disconnect();
      kontrol.removeEventListener('start', dokunuldu);
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
      ortam.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
