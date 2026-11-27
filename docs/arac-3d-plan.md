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
- [x] 3. Kapı tıklama → kapı açılır, kamera içeri yumuşak geçiş; basit iç mekân (koltuklar, direksiyon, orta ekran, konsol); "Dışarı çık" düğmesi.
- [x] 4. Patlatılmış görünüm: gövde saydamlaşır/ayrılır; batarya paketi (modül/hücre), motor (stator/rotor), inverter, araç içi şarj cihazı (OBC), şarj soketi, redüktör, soğutma hattı.
- [x] 5. Parça bilgi kartları (tıkla/dokun), "Temsili görsel" etiketi, klavye ile gezinme.
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


### 2026-11-26 — Adım 3: kapıyı açıp içeri girme, basit iç mekân
**Durum:** SORULAR.md'de 22 ve 23'e yanıt yok → adım 2b görünümüyle devam edildi.

**Yapılan:**
- **Kapı tıklama:** fareyle tıklama / parmakla dokunma (8 px'ten az hareket, 600 ms'den kısa basış → sürükleme ile karışmaz). `Raycaster` ile ilk vurulan nesne bir kapıysa o kapı ön kenardaki menteşe etrafında ≈66° açılır. Fareyle kapının üstüne gelince imleç el olur (her karede en fazla bir ışın).
- **Kamera geçişi:** `CatmullRomCurve3` ile 4 noktalı eğri (mevcut konum → kapının dışı → kapı aralığı → koltuktaki göz noktası), bakış noktası da ayrı bir eğriyle; görüş açısı 40° → 62° (dikeyde 52° → 74°). Süre 2,4 sn, `prefers-reduced-motion` açıksa ¼. Oturunca kapı kapanır (yanda dış sac yerine kapı döşemesi görünür). Dışarı çıkarken kapı açılır, kamera aynı taraftan dışarı ve başlangıç açısına döner, sonra kapı kapanır.
- **İçeride bakınma:** OrbitControls hedefi göz noktasının 12 cm önüne alınır, mesafe sabit → sürüklemek "başını çevirmek" gibi. Yakınlaştırma kapalı; içeride "Görünümü sıfırla" gizli.
- **Hangi koltuk:** tıklanan kapıya göre (ön sol = sürücü, ön sağ = yolcu, arkalar = arka sıra). "İçeri gir" düğmesi (klavye/ekran okuyucu ve keşfedilebilirlik için) sürücü koltuğuna götürür; içeride "Dışarı çık" düğmesi + Esc.
- **Gövdede kapı açıklığı:** gövde ve cam ev gölgelendiricide kapı dörtgenleriyle (kapının 1 cm içi) kesiliyor (`cgIcinde` — dışbükey dörtgen testi); cam evin tabanı ve cam evin altındaki gövde "kapağı" da kesildi → iç mekân tek hacim. Gövdenin iç yüzü (arka yüz) koyu kaplama rengi; tavanın iç yüzü açık gri tavan döşemesi.
- **Kapı kalınlığı:** her kapıya gövdenin 5 cm içinde döşeme + iki yüzü birleştiren kenar şeridi; döşemede ince yeşil (#22c55e) ortam ışığı çizgisi.
- **İç mekân (`src/arac3d/ic.ts`):** taban, iki ön koltuk (minder, yatık sırt, baş desteği), arka sıra, bagaj rafı, orta konsol + kol dayama, gösterge paneli (alt geniş, üst cam eve sığacak kadar dar) + panel boyunca yeşil ışık şeridi, orta ekran (tuvalde çizilmiş genel arayüz: üstten araç silüeti + şarj çubuğu + şimşek; **rakam/yazı yok**), sürücü göstergesi, 3 kollu direksiyon, tavan lambası (nokta ışık). Hepsi `RoundedBoxGeometry` / temel geometri; markasız.
- **Cam** yarı saydam füme (opaklık 0,62) → dışarıdan iç mekân seçiliyor, içeriden dışarısı görünüyor.
- **Bel hattı:** cam evin dibindeki omuz üstü mat siyah.

**Denenen yaklaşımlar / düzeltmeler:**
1. *Opak cam (adım 2'deki gibi):* içeri girince her yön simsiyah; dışarıdan iç mekân hiç görünmüyor → yarı saydam cama geçildi.
2. *Kapı içeride açık kalsın:* yanda kocaman beyaz kapı sacı görünüyordu (ekran: ilk deneme) → oturunca kapı kapanıyor.
3. *Bel omzu gövde renginde:* cam ev gövdeden ~12 cm içeride olduğu için içeriden bakınca camın ardında beyaz bir raf görünüyordu → omuz üstü mat siyah (dışarıdan da cam ev "yüzer" görünüyor, siyah tavanla uyumlu).
4. *Koordinat hatası düzeltildi:* adım 2'de "+z sol" yazılmıştı; +x'e bakan biri için +z sağdır. İlk denemede direksiyon sağda çıktı (sağdan direksiyonlu araç). Kapı/teker adları düzeltildi; sürücü artık solda (−z).
5. *Tavan lambası olmadan* iç mekân neredeyse siyahtı (dış ışıklar yukarıdan vuruyor, tavan gölgelemiyor ama koltuk önleri karanlık) → tek nokta ışık.
6. *Test:* swiftshader yavaş olduğu için geçişin ara kareleri, `performance.now` 8 kat yavaşlatılarak yakalandı (yalnızca test betiğinde).

**Paket boyutu:** ana paket 274,72 → 274,96 kB (yalnızca yeni metinler; three.js ana pakete girmedi). `sahne` parçası 578 → 594 kB (gzip 145,6 → 151,4 kB), yalnızca bu sayfada.

**Kontroller:** typecheck, lint, build sorunsuz; sitemap 25 adres. Playwright (swiftshader) 1366 ve 390 px, TR ve EN: kapıya tıklayınca / dokununca yolcu koltuğuna giriş, "Dışarı çık" ile çıkış, "İçeri gir" ile sürücü koltuğu, içeride sürükleyerek bakınma, Esc ile çıkış; konsol hatası yok, yatay taşma 0.
Ekran: `arac-3d-ekran/2026-11-26-adim3-kapi-acik.webp`, `…-ic-surucu.webp`, `…-ic-bakis.webp`, `…-mobil-dis.webp`, `…-mobil-ic.webp`.

**Bilinen kusurlar:** iç mekân sade ve biraz karanlık; ön camın üst kısmı içeriden koyu gri bir perde gibi; arka sıradan bakınca bagaj boşluğu boş. Kapı menteşe tarafında gövde ile kapı arasında birkaç mm aralık seçilebiliyor.

**Sıradaki:** Adım 4 — patlatılmış görünüm (gövde saydamlaşır; batarya paketi, motor, inverter, OBC, soket, redüktör, soğutma hattı). → Önce 3b (aşağıda).

### 2026-11-26 (2) — Adım 3b: yeni coupe-SUV gövde (kullanıcı geri bildirimi)
Kullanıcı aracı yine "çok kötü" buldu ve tasarım dili için bir referans görsel paylaştı (yapay zekâyla üretilmiş, piyasada olmayan bir konsept SUV). Görsel repoya **eklenmedi**; üzerindeki yazı/logo kullanılmadı. Yalnızca genel tasarım dili kodla yorumlandı; ölçüler ve ayrıntılar özgün.
**Yapılan:**
- Oranlar: boy 4,49 → 4,76 m, genişlik 1,84 → 1,94 m, dingil arası 2,75 → 2,90 m, teker yarıçapı 0,385 → 0,41 m (ince profilli lastik). Uzun ve alçalan kaput, çok yatık ön cam, tavan hattı arkaya doğru akan "fastback" (coupe-SUV), arkaya doğru yükselen cam alt hattı, arka teker üstünde belirgin omuz.
- Ön: üst kenarı keskin, altı geriye çekilen burun; kaputun ön kenarında tam genişlik ince ışık şeridi, köşelerde koyu girinti içinde ">" biçimli dikey ışıklar, altta koyu hava girişi (hepsi gölgelendiricide, `cgParca` doğru parçası uzaklığı). Arkada tam genişlik ince stop şeridi.
- Cam hattı: A direği parlak siyah (opak), tavan gövde renginde ("yüzen tavan"), C direği gövde renginde → yan cam hattı arkada sivri bitiyor. Cam daha koyu (opaklık 0,74).
- Jant: 10 kanatlı "türbin" jant (iki tonlu, `ExtrudeGeometry` ile kıvrık yapraklar), logosuz göbek. Ön kapılarda parlak siyah yan ayna (kapıyla birlikte açılıyor).
- Boya: saten titanyum gri. Çamurluk kavislerinde daha geniş mat siyah çerçeve (yalnızca yan yüzlerde; ilk denemede kaputa da taşıp üstte siyah bant yapıyordu).
- Kapı açıklıkları, iç mekân (koltuklar, panel, direksiyon) yeni ölçülere taşındı; kapıdan giriş/çıkış aynen çalışıyor.
**Denenenler:** burun kapanması 2,2'den başlayınca ön yüz dik bir duvar gibiydi → 2,08'den ve üstten görünüşte daha erken süpürme; bel omzu tamamen siyahken arka çeyrekte büyük siyah leke oluşuyordu → cam dibinde 14 cm'lik ince şerit; kaput dibindeki iç mekân "kapağı" kesiği ön cam dibinde delik açıyordu → kesik x < 0,95 ile sınırlandı.
**Paket:** `sahne` parçası gzip 151,4 → 159,8 kB (yalnızca deneme sayfasında); ana paket değişmedi.
**Kontroller:** typecheck, lint, build sorunsuz; Playwright 1366 / 390 px: dört açıdan görünüm, kapıya tıklayıp giriş, düğmeyle sürücü koltuğu, içeride bakınma; konsol hatası ve taşma yok.
Ekran: `arac-3d-ekran/2026-11-26-adim3b-on-capraz.webp`, `…-on.webp`, `…-yan.webp`, `…-arka-capraz.webp`, `…-ic-surucu.webp`, `…-mobil.webp`.

### 2026-11-26 (3) — Adım 4: patlatılmış görünüm
**Durum:** SORULAR.md'de 22–24'e yanıt yok; `veriler/` içinde yeni veri yok. 3b gövdesinin üzerine kuruldu.

**Yapılan:**
- Yeni `src/arac3d/bilesenler.ts`: kodla üretilen, markasız, temsili bileşenler. Yerleşim genel bir **arkadan itişli, tek motorlu** düzen (adım 7'de varyantlar):
  - *Batarya paketi* (dingiller arası, taban altı): tepsi + orta kiriş, 2×6 modül (üstte yeşil plaka), bir "örnek" modülde üst kapak yok → 6×11 silindirik hücre (`InstancedMesh`, tek çizim çağrısı) ve uç kapakları görünür; paket kapağı.
  - *Elektrik motoru* (arka aks): kanatçıklı döküm gövde + lamine stator + iki uçta bakır sargı başları; ayrı *rotor* (lamine gövde, mil, çubuk izleri).
  - *Redüktör*: döküm kasa + üç dişli (kodla dişli profili, `ExtrudeGeometry`). Aks milleri tekerleklere.
  - *İnverter* (motorun üstünde, mavi vurgu, soğutma rakorları), *OBC* (arka bagaj tabanı altında, mor vurgu, soğutucu kanatçıklar), *şarj soketi* (arka sol çeyrek; genel pim düzeni — belirli bir standardın birebir dizilimi değil).
  - *Soğutma*: önde ısı eşanjörü (radyatör) + pompa; *soğutma hattı* (camgöbeği borular) ve *yüksek gerilim kabloları* (turuncu: soket→OBC (AC), soket→batarya (DC), OBC→batarya, batarya→inverter→motor). Borular patlak konumlar için çizilir ve yalnızca görünüm tamamen açılınca belirir (araç kapalıyken zaten gövde içinde, görünmez).
- `sahne.ts`: yeni `parca` modu ve `parcalar(ac)`; 1,8 sn'lik geçişte gövde (tekerlekler hariç) 0,7 m yükselirken tamamen saydamlaşıp gizlenir, iç mekân gizlenir, parçalar kendi gecikmeleriyle ayrılır (modüller aralanıp yükselir, örnek modül dışarı çıkar, rotor statordan eksen boyunca kayar, redüktör kasası ve dişlileri yana açılır, inverter/OBC/radyatör yükselir, soket dışarı çıkar; batarya kapağı önce kalkıp sonra aracın yanına yere iner). Kamera aynı yanda kalarak biraz yukarı/uzağa geçer; yakınlaştırma sınırı 14. "Aracı birleştir" (ya da Esc) her şeyi geri alır; malzemelerin saydamlık/derinlik ayarları özgün hâline döner (birleştirdikten sonra kapıdan giriş aynen çalışıyor — test edildi).
- Sayfa: "Parçaları göster / Aracı birleştir" düğmesi (`aria-pressed`, Esc), patlatılmış görünümde renk noktalı **parça lejantı** ve "yerleşim genel bir düzeni temsil eder; parça konumu, sayısı ve boyutu araçtan araca değişir" notu. Metinler TR/EN/AZ. Mobilde düğmeler ipucu balonunun üstüne binmesin diye biraz yukarı alındı (önceden de birkaç px biniyordu).

**Denenen yaklaşımlar (gövde ne olsun):**
1. *(b) Gövde 1,55 m yükselir, %16 opaklıkta kalır:* bağlam iyi ama hayalet gövde kadrajın üst yarısını kaplıyor, tepeden bakınca parçaları örtüyor; saydam malzemede yansımalar beyaz lekeler bırakıyor. Ekran: `arac-3d-ekran/2026-11-26-adim4-deneme-b-yukari-saydam.webp`.
2. *(a) Gövde yerinde, %10 opaklık ("röntgen"):* yükselen parçalar gövdenin içinden çıkıyor gibi karışık; A direği/ayna yansımaları yine parlak. Ekran: `…-adim4-deneme-a-yerinde-saydam.webp`.
3. *(c, seçilen) Gövde yükselirken tamamen kaybolur, tekerlekler kalır:* "kaykay" şasi görünümü, en okunaklısı; tekerlekler ölçek/yön bağlamı veriyor.
- *Batarya kapağı:* önce modüllerin üstünde yarı saydam yükseliyordu → modülleri soluklaştırıyordu; sonra açık gri olarak yanda yere indi → çok baskındı; son hâli koyu gri, aracın yanında yerde.

**Paket:** `sahne` parçası gzip 159,8 → 164,4 kB (yalnızca deneme sayfasında); ana paket yalnızca yeni metinler kadar büyüdü (gzip ≈ 91,2 kB); ana sayfa `sahne`/`Arac3dDeneme` parçalarını istemiyor (doğrulandı).

**Kontroller:** typecheck, lint, build sorunsuz; sitemap 25 adres; `robots=noindex`. Playwright (swiftshader) 1366 ve 390 px, TR ve EN: parçaları göster → sürükleyerek çevirme → birleştir (düğme ve Esc) → kapıdan içeri giriş; konsol hatası yok, yatay taşma 0.
Ekran: `arac-3d-ekran/2026-11-26-adim4-masaustu.webp`, `…-adim4-ust-aci.webp`, `…-adim4-mobil.webp`, `…-adim4-birlestir.webp`.

**Bilinen kusurlar:** motor ve redüktör ölçeği küçük, mobilde zor seçiliyor (adım 5'te parçaya tıklayınca kamera yaklaşabilir); kablolar bazı açılardan birbirini kesiyor; parçalara henüz tıklanamıyor (adım 5).

**Sıradaki:** Adım 5 — parçaya tıklayınca/dokununca vurgulama + bilgi kartı (genel çalışma prensibi; araca özel rakam yok), klavye ile parçalar arasında gezinme.

### 2026-11-27 — Adım 5: parça bilgi kartları, vurgulama, klavyeyle gezinme
**Durum:** SORULAR.md'de 22–25'e yanıt yok; `veriler/` içinde yeni veri yok. Adım 4 görünümü üzerine kuruldu.

**Yapılan:**
- **Seçim:** patlatılmış görünümde parçaya tıklama / dokunma (sürükleme ile karışmaz; adım 3'teki kısa basış kuralı). Işının ilk vurduğu görünür ağın atası `parca-*` grubundan parça adı bulunur. Boş alana dokunmak seçimi kaldırır; fareyle parçanın üstüne gelince imleç el olur.
- **Vurgulama:** seçilmeyen parçalar, aks milleri ve tekerlekler tek bir koyu, %13 opak malzemeye geçici olarak takas edilir (asıl malzemeler `Map`'te saklanır, seçim kalkınca/birleştirince/sayfadan çıkınca geri konur).
- **Kamera odağı:** aynı bakış yönünden parçanın sınır kutusunun merkezine 0,9 sn'lik küresel geçiş (kamera aracın içinden geçmez; karşı yana dönerken hafif yukarıdan). Mesafe parçanın boyutuna göre; parçaya özel ayar: soket küçük ve yüzü sola bakıyor → soldan ve yakından; redüktör dişlileri +z'de → o yandan; kablo ve soğutma hattı tüm araca yayıldığı için genel görünüm ve yukarıdan (≈35°). Seçim varken yakınlaştırma sınırı 1,2.
- **Bilgi kartı:** masaüstünde sahnenin sağında (w-80), mobilde sahnenin altında. Parça adı + renk noktası, 1–2 cümlelik özet, 2–3 madde (genel çalışma prensibi; **araca özel rakam yok**), "genel prensiptir, araçtan araca değişir" notu, önceki/sonraki düğmeleri, kapatma. OBC ve soket kartlarında "Ev tipi şarj ünitesi (wallbox) kurulum teklifi al" bağlantısı (`/sarj-unitesi-kurulumu`, dile göre). Masaüstünde kart sahneyi örtmesin diye izdüşüm `setViewOffset` ile kart payının yarısı kadar sola kayar (kamera konumu değişmez, ışın seçimi doğru kalır).
- **Klavye / erişilebilirlik:** lejant satırları artık `aria-pressed` düğmeler (Tab + Enter ile seçim). Patlatılmış görünümde ← → parçalar arasında gezinir; Esc önce kartı kapatır, ikinci Esc aracı birleştirir. Kart `aria-live="polite"`.
- **Metinler:** düğme/ipucu metinleri `messages.ts`'de TR/EN/AZ. Kart içerikleri (uzun metin) `src/data/parcaBilgileri.ts`'de TR/EN/AZ — rehberler gibi veri dosyası; yalnızca deneme sayfasının tembel parçasına girer (ilk denemede `messages.ts`'e konunca ana paket gzip +4,5 kB büyüyordu).
- İçerik notları: Tip 2 / CCS2 yaygınlığı (Türkiye ve Avrupa), turuncu yüksek gerilim kablosu uygulaması, OBC'nin AC şarj gücünü sınırlaması, DC şarjda OBC'nin devre dışı kalması, tek oranlı redüktör ("çoğu araçta") gibi genel ve yerleşik bilgiler; kesin sayı yok. AZ metinleri yayından önce ana dili AZ olan biri gözden geçirmeli.

**Denenen yaklaşımlar (vurgulama):**
1. *'tel' — diğer parçalar tel kafes:* büyük parçalarda (tekerlek, batarya) yoğun çizgi örgüsü, yakın odakta ekranı dolduruyor. Ekran: `arac-3d-ekran/2026-11-27-adim5-deneme-tel.webp`.
2. *'isik' — yalnızca seçilen parça yeşil parlar, diğerleri olduğu gibi:* batarya zaten yeşil → fark az; diğer parçalar soluklaşmadığı için yakın odakta kablolar ve borular önü kapatıyor. Ekran: `…-adim5-deneme-isik.webp`.
3. *'soluk' (seçilen) — diğerleri koyu, yarı saydam:* bağlam kalıyor, seçilen parça net. `VURGU` sabitiyle diğerleri yeniden denenebilir.
- *Kart yerleşimi:* önce kart sahnenin üstüne biniyor, parça kartın altında kalıyordu → `setViewOffset` ile kaydırma. Mobilde kart sahne üstünde yer bırakmadığı için alta alındı.
- *Kamera:* ilk denemede kablo odağında kablolar kadrajın üstünden taşıyordu, soket arkadan (yüzü görünmeden) gösteriliyordu, redüktör kasası dişlileri ve tekerlek önünü kapatıyordu → parçaya özel yön/mesafe + tekerlekler de soluklaşıyor. Mobilde batarya çok uzakta kalıyordu → mesafe çarpanı 1,35 → 1,15.

**Paket:** ana paket değişmedi (gzip ≈ 91,6 kB; yalnızca birkaç kısa düğme metni). `Arac3dDeneme` parçası gzip ≈ 8,5 kB (kart içerikleri dahil), `sahne` gzip 164,4 → 165,4 kB. Ana sayfa `sahne`/`Arac3dDeneme` parçalarını istemiyor (doğrulandı).

**Kontroller:** typecheck, lint, build sorunsuz; sitemap 25 adres. Playwright (swiftshader) 1366 px (TR) ve 390 px (TR/EN/AZ, dokunma): parçaya tıklama/dokunma, ← → ile 8 parçanın tamamı, boş alana dokununca kapanma, Esc ×2, lejant düğmesi, kart açıkken "Aracı birleştir" → "İçeri gir" (iç mekân çalışıyor); konsol hatası yok, yatay taşma 0.
Ekran: `arac-3d-ekran/2026-11-27-adim5-batarya.webp`, `…-motor.webp`, `…-reduktor.webp`, `…-kablo.webp`, `…-mobil.webp`.

**Bilinen kusurlar:** mobilde kart sahnenin altında; okumak için kaydırmak gerekiyor (otomatik kaydırma sahneyi kadrajdan çıkaracağı için yapılmadı). Soluk parçaların ışın seçimi açık: yakın odakta önde kalan soluk parçaya dokunmak onu seçer (bilinçli; "başka parçaya dokun" davranışı).

**Sıradaki:** Adım 6 — animasyonlar: motor/rotor dönüşü; AC şarj akışı (wallbox → soket → OBC → batarya) ve DC hızlı şarj (OBC devre dışı) karşılaştırması.

**Not (bilgisayara ulaşılamadı):** Bu çalışmanın sonunda kullanıcının bilgisayarı bağlı değildi; ILERLEME.md ve SORULAR.md güncellenemedi. Bir sonraki çalışma şu kaydı oraya taşımalı:
- *ILERLEME.md — 2026-11-27, F adım 5:* commit `bb3dc82` (`arac-3d`), PR #5 açıklaması güncellendi, önizleme https://carge-way-git-arac-3d-fatihgndz03-6279s-projects.vercel.app/deneme/arac-3d — ayrıntılar yukarıda.
- *SORULAR.md — Soru 26 (3D araç — parça bilgi kartları):* "Parçaları göster"den sonra bir parçaya dokunun. (1) Kart metinleri anlaşılır mı, çok mu teknik/uzun? (2) Mobilde kartın sahnenin altında açılması uygun mu, yoksa sahnenin üstünde küçük bir kart mı olsun? (3) OBC ve soket kartlarındaki "wallbox kurulum teklifi al" bağlantısı uygun mu, başka kartlara da eklensin mi? Yanıt yoksa adım 6'ya (motor dönüşü, AC/DC şarj akışı animasyonu) geçilir.

