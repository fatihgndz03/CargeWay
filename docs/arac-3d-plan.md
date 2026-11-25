# Etkileşimli 3D araç incelemesi — yol haritası

Kullanıcı kararı (24 Kasım 2026): araç incelemeleri **temsili** bir 3D araçla zenginleşecek.
Fareyle/parmakla 360° çevrilir, kapıya tıklayınca içeri girilir, patlatılmış görünümde
batarya, motor ve şarj sistemi incelenir. Ayrıntı isteyen resmi YouTube videosunu izler.
**Acele yok:** her çalışmada bu listeden 1 küçük adım yapılır, denenir, ekran görüntüsüyle kaydedilir.

## Değişmez kurallar
- Model **markasız ve stilize**; gerçek bir aracın tasarımı, logosu, farı/ızgarası taklit edilmez.
- Sahnede sürekli "Temsili görsel — araçtaki gerçek parçaları birebir göstermez" etiketi.
  Açıklama dili: "bu araçtaki sistem benzer prensiple çalışır". "X markası şunu kullanır" gibi kesin iç ayrıntı yalnızca kaynakla.
- Araca özel rakamlar (motor sayısı, çekiş, batarya kWh, AC/DC şarj kW, soket) yalnızca üretici kaynağı + tarih ile; yoksa alan boş kalır.
- Dış 3D dosyası / telifli doku yok; geometri kodla üretilir. three.js yalnızca ilgili sayfada tembel yüklenir (ana paket büyümez).
- Siyah zemin, yeşil #22c55e. Metinler `messages.ts`'de TR/EN/AZ.
- Mobil (390 px) akıcı olmalı; WebGL yoksa statik yedek.

## Adımlar (sırayla, her biri ayrı commit)
- [x] 1. Altyapı: `three` bağımlılığı, `/deneme/arac-3d` (noindex, menüde yok, sitemap'te yok) tembel yüklenen sahne; OrbitControls, ışık, zemin gölgesi; dokunmatik; paket boyutu ölçümü.
- [x] 2. Stilize gövde (prosedürel: gövde, cam, tekerlekler, kapılar ayrı nesne) + 360° sürükle-çevir, yakınlaştırma sınırları, hafif otomatik dönüş.
- [ ] 3. Kapı tıklama → kapı açılır, kamera içeri yumuşak geçiş; basit iç mekân (koltuklar, direksiyon, orta ekran, konsol); "Dışarı çık" düğmesi.
- [ ] 4. Patlatılmış görünüm: gövde saydamlaşır/ayrılır; batarya paketi (modül/hücre), motor (stator/rotor), inverter, araç içi şarj cihazı (OBC), şarj soketi, redüktör, soğutma hattı.
- [ ] 5. Parça bilgi kartları (tıkla/dokun), "Temsili görsel" etiketi, klavye ile gezinme.
- [ ] 6. Animasyonlar: motor dönüşü; AC şarj akışı (wallbox → OBC → batarya) ve DC hızlı şarj (OBC devre dışı) karşılaştırması.
- [ ] 7. Varyantlar: tek/çift motor, önden/arkadan/4x4 çekiş, soket konumu — parametreyle değişen sahne.
- [ ] 8. Kaynaklı araç verisi: `src/data/araclar.ts`'e isteğe bağlı alanlar (motorSayisi, cekis, bataryaKwh, acKw, dcKw, soket, kaynaklar[{ad,url,tarih}]); önce Türkiye'de yaygın 3–5 model.
- [ ] 9. Araç detay sayfası `/araclar/:slug`: temel bilgiler + 3D + "bu araca uygun wallbox → Teklif al" + resmi YouTube videosu (tıklayınca yüklenir, youtube-nocookie; çerez metni güncellenir).
- [ ] 10. Dayanıklılık: WebGL yok → statik SVG; `prefers-reduced-motion`; düşük güçlü cihazda kalite düşürme; Lighthouse ölçümü.
- [ ] 11. (Kullanıcı çekim yaparsa) `veriler/arac-turlari/<slug>/` altındaki kendi 360 fotoğrafları + iç panorama ile gerçek 360° tur görüntüleyici.

## Deneme günlüğü
Her çalışma buraya tarih, ne denendiği, ne işe yaradığı/yaramadığı ve ekran görüntüsü adını yazar.

### 2026-11-24 — Adım 1: altyapı
**Yapılan:** `three@0.187.0` (tam sürüm sabit) + `@types/three`. Sahne `src/arac3d/sahne.ts`; sayfa `src/pages/Arac3dDeneme.tsx` → `/deneme/arac-3d` (ve `/en/…`, `/az/…`). Sayfa `React.lazy` ile, three.js ise sayfa açıldıktan sonra `import()` ile ayrı parçada yüklenir. `noindex` meta + Vercel `vercel.json` ve Netlify `public/_headers` ile `X-Robots-Tag: noindex`; menüde ve sitemap'te yok. Metinler `messages.ts` → `arac3d` (TR/EN/AZ).
- OrbitControls: sönümlü sürükle-çevir, kaydırma kapalı, yakınlaştırma 4–12, zeminin altına inilemez; dokunmatikte tek parmak çevirir, iki parmak yakınlaştırır (`touch-action: none`). Hafif otomatik dönüş; kullanıcı dokununca durur; `prefers-reduced-motion` açıksa hiç dönmez.
- Işık: yarım küre dolgu + beyaz anahtar ışık + arkadan yeşil kontur. ACES ton eşleme, piksel oranı en fazla 2.
- Ekran dışındayken / sekme gizliyken çizim durur (IntersectionObserver). ResizeObserver ile boyut; dikey ekranda görüş açısı 52°.
- WebGL yoksa three.js hiç indirilmez, kutu ikonlu açıklama gösterilir. Sayfadan çıkınca geometri/doku/renderer temizlenir.
- "Temsili görsel" etiketi sahnenin üstünde sürekli; "Görünümü sıfırla" düğmesi (mobilde yalnızca ikon).
- Sahnedeki nesne bilerek araca benzemeyen **yer tutucu** bloktur; adım 2'de stilize gövdeyle değişecek.

**Paket boyutu (vite build):** ana paket 271,44 → 274,53 kB (gzip 89,06 → 90,35 kB; fark yalnızca 3 dildeki yeni metinler). three.js ana pakete girmedi. Ayrı parçalar: `Arac3dDeneme` 3,9 kB (gzip 1,7), `sahne` 550 kB (gzip 137 kB) — yalnızca bu sayfada. Vite'ın "500 kB üzeri parça" uyarısı bu parça için çıkıyor; bilerek bırakıldı (ileride gerekirse adım 10'da ölçülür).
Playwright: ana sayfa açılınca `sahne`/`Arac3dDeneme` parçası istenmiyor (doğrulandı).

**Denenen yaklaşımlar:**
1. *Kütüphane:* düz three.js ↔ @react-three/fiber + drei. Fiber/drei ek ~100 kB+ ve React sürümüne bağımlılık getirir; sahne tek sayfada ve etkileşim sade → **düz three.js seçildi** (tek dosya, kolay temizlik).
2. *Zemin gölgesi:* (a) gölge haritası (PCFSoft, 1024²) ↔ (b) tuvalde çizilen yumuşak radyal doku. Koyu zeminde (a) neredeyse görünmüyor ve kenarı sert; swiftshader'da 60 kare (a) 2914 ms, (b) 2290 ms (~%20 hızlı). **(b) seçildi.** Ekran: `arac-3d-ekran/2026-11-24-adim1-deneme-golge-haritasi.webp`.
3. *Kadraj:* ilk denemede platform (r=3,4) kadrajı taşıyordu ve mobilde etiket ile sıfırla düğmesi üst üste biniyordu → platform r=3,0, kamera geri/yukarı, mobilde düğme yalnızca ikon.

**Kontroller:** typecheck, lint, build sorunsuz; sitemap 25 adres (deneme yok). Playwright (swiftshader) 1366 ve 390 px, TR/EN/AZ: tuval çiziliyor, sürükleyince dönüyor, `robots=noindex`, yatay taşma 0, konsol hatası yok (yalnızca swiftshader'ın ekran görüntüsü alırken verdiği "GPU stall due to ReadPixels" performans uyarısı — test ortamına özgü).
Ekran: `arac-3d-ekran/2026-11-24-adim1-masaustu.webp`, `arac-3d-ekran/2026-11-24-adim1-mobil.webp`.

**Sıradaki:** Adım 2 — stilize gövde (gövde, cam, tekerlekler, kapılar ayrı nesne), yer tutucunun yerine. → 2026-11-25'te yapıldı.

### 2026-11-25 — Adım 2: stilize gövde
**Yapılan:** Yer tutucu blok kaldırıldı; yeni `src/arac3d/govde.ts` markasız, genel bir kompakt crossover üretir (boy ≈4,5 m, dingil arası 2,75 m — hiçbir modelin ölçüsü değil). Parçalar ayrı nesne: `govde` (alt gövde), `kabin` (cam ev + tavan, aynı geometride iki malzeme grubu), `kapilar` (4 kapı; her biri ön kenardaki menteşe noktasında konumlanmış `Group` → adım 3'te `rotation.y` ile açılacak; içinde gövde yüzeyini izleyen sac, kapı camı, derz çizgileri ve gömme kol), `tekerlekler` (4 adet; `donder(aci)` ile dönen iç grup → adım 6). Izgara, far imzası, logo yok; ön/arka ışık genel ince şerit, marşpiyelde site yeşili (#22c55e) vurgu. 360° çevirme, yakınlaştırma sınırları ve hafif otomatik dönüş adım 1'den aynen geçerli.
- Yansımalar için three.js'in kodla ürettiği `RoomEnvironment` ortam haritası (PMREM) eklendi — dış dosya yok. Yeşil kontur ışığı 1,1 → 0,7 (tavanı fazla yeşile boyuyordu).
- Kapatınca tüm geometri/malzeme/ortam dokusu temizleniyor (çizgiler dahil).

**Denenen yaklaşımlar:**
1. *(a) Yan profil + `ExtrudeGeometry`, küçük pah (0,11):* hızlı ve temiz silüet, ama yan yüzler dümdüz levha, arkası kutu gibi; araç "cenaze arabası / station wagon" gibi okunuyordu. Kapı sacları düz levha olarak gövdeden ayrı parlıyordu. Ekran: `arac-3d-ekran/2026-11-25-adim2-deneme-a-ekstruzyon.webp`.
2. *(b) Aynı ekstrüzyon, büyük pah (0,2) + kapıyı pah eğrisine oturtma:* omuzlar biraz yuvarlandı ama yan yüz yine düz, üstten görünüşte burun/kuyruk köşeli; fark küçük. Bırakıldı.
3. *(c) Kesitlerden loft (seçilen):* boy boyunca 111 istasyonda yuvarlatılmış dikdörtgen kesit; kesit parametreleri x'e göre değişiyor (kaput eğimi, bel çizgisi, uçlarda yan ve üst görünüşte yumuşak kapanma). Yan yüzde üstte içe eğim (tumblehome), ortada hafif bombe. Cam ev de aynı yöntemle (ön cam–tavan–arka cam eğrisi + yukarı doğru daralma). Kapı sacı ve camları aynı yüzey fonksiyonuyla hesaplanan ızgaralar olduğu için gövdeye milimetrik oturuyor. **Çamurluk kavisleri** loft'u bozmamak için gövde malzemesinin gölgelendiricisinde (`onBeforeCompile`, yerel koordinatla `discard`) kesiliyor; içerisi koyu yarım silindir astar + iç disklerle kapatıldı. Ön/arka ışık şeritleri ve marşpiyel vurgusu da gölgelendiricide yüzeye çiziliyor (eğri yüzeye tam oturuyor, ek geometri yok). İlk denemede far şeridi beyaz boyada okunmuyordu → koyu bant içinde parlak çekirdek yapıldı.

**Paket boyutu:** ana paket değişmedi (274,7 kB, gzip 90,35 kB; ana sayfa `sahne` parçasını istemiyor — doğrulandı). `sahne` parçası 550 → 578 kB (gzip 137 → 145,6 kB; ortam haritası + spline). Üçgen sayısı ≈ 30 bin.

**Kontroller:** typecheck, lint, build sorunsuz; sitemap 25 adres (deneme yok); sayfa `robots=noindex`. Playwright (swiftshader) 1366 ve 390 px, TR/EN/AZ, farklı açılara sürükleyerek: konsol hatası yok, yatay taşma 0.
Ekran: `arac-3d-ekran/2026-11-25-adim2-masaustu.webp`, `…-adim2-on.webp`, `…-adim2-arka-capraz.webp`, `…-adim2-mobil.webp`.

**Bilinen küçük kusurlar (sonraki adımlarda ele alınacak):** öne bakan alçak açıdan tekerlek tünellerinin içi koyu boşluk olarak görünüyor; cam ev ile kaput birleşiminde A direği dibinde ince açık renkli üçgen kalıyor.


### 2026-11-25 (2) — Adım 2b: görünüm iyileştirme (kullanıcı geri bildirimi)
Kullanıcı modeli "baya kötü" buldu; gerçek araç / hazır 3D model seçenekleri yerine **kodla devam** kararı verdi (marka tasarımı kopyalanmaz, dış 3D dosyası yok kuralı aynen geçerli).
**Yapılan:** burun ve kuyruk daha küt ve dik (kapanma üssü 2,6/3,4 → 4,2/5; üstten görünüşte köşeler daha kare), omuz yarıçapı 0,24 → 0,17 (sabun kalıbı görünümü azaldı); alt kenarda mat siyah kaplama ve çamurluk kavislerinde siyah çerçeve (yan yüzü inceltir, crossover duruşu verir; gölgelendiricide); tekerlek yarıçapı 0,36 → 0,385, tekerlekler gövdeyle aynı hizada; tavan parlak siyah ("yüzen tavan"); kapı alt kenarları kaplamanın üstüne çekildi. Yeşil kontur ışığı nötr renge çevrildi — parlak siyah tavanda ve çamurluklarda yeşil leke yapıyordu (yeşil kimlik platform halkası ve marşpiyel şeridinde duruyor).
**Kontroller:** typecheck, lint, build sorunsuz; Playwright 1366 / 390 px, TR/EN/AZ: konsol hatası ve taşma yok.
Ekran: `arac-3d-ekran/2026-11-25-adim2b-masaustu.webp`, `…-adim2b-on.webp`, `…-adim2b-arka-capraz.webp`, `…-adim2b-mobil.webp`.

**Sıradaki:** Adım 3 — kapıya tıklayınca kapının menteşe etrafında açılması, kameranın içeri yumuşak geçişi, basit iç mekân ve "Dışarı çık" düğmesi. Kullanıcı görünümü hâlâ zayıf bulursa önce görünüm (oran, ayrıntı, ışık) üzerinde bir tur daha.
