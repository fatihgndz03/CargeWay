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
- [ ] 1. Altyapı: `three` bağımlılığı, `/deneme/arac-3d` (noindex, menüde yok, sitemap'te yok) tembel yüklenen sahne; OrbitControls, ışık, zemin gölgesi; dokunmatik; paket boyutu ölçümü.
- [ ] 2. Stilize gövde (prosedürel: gövde, cam, tekerlekler, kapılar ayrı nesne) + 360° sürükle-çevir, yakınlaştırma sınırları, hafif otomatik dönüş.
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
