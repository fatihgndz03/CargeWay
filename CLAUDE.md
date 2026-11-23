# CargeWay — geliştirme kuralları

## Diller (TR / EN / AZ)
- Site üç dilde: Türkçe (önek yok), İngilizce `/en`, Azerbaycanca `/az`. Slug'lar tüm dillerde aynı.
- Arayüzdeki her yeni metin `src/i18n/messages.ts` içine **üç dilde** eklenir (`tr` kaynak; `en`, `az` aynı yapı). Bileşende `const t = useT()` ile kullanılır; sabit Türkçe metin yazılmaz.
- İç bağlantılar için `react-router-dom` yerine `src/components/DilLink` (`Link`, `Navigate`) ve `src/lib/useDilNavigate` kullanılır; aksi halde EN/AZ ziyaretçisi Türkçe sayfaya düşer.
- Türkiye'ye özel içerik (haberler, rehberler, ürün rehberi, iş ortağı, harita/istasyon verisi) yalnızca Türkçe; EN/AZ'de `YalnizTurkceNotu` gösterilir ve menüde listelenmez.
- AZ metinleri Azerbaycan Türkçesi (Latin: ə, ğ, ı, ö, ü, ç, ş, x, q) ile yazılır; yayından önce ana dili AZ olan biri gözden geçirmeli.

## Teklif formu
- `kurulum_talepleri` kayıtları `ulke` (TR/AZ) ve `dil` (tr/en/az) taşır; Azerbaycan talep potansiyeli bu alanlarla ölçülür.
- Yeni sütun = yeni migration dosyası (uygulanmış migration'lar düzenlenmez).

## Genel
- Canlı site bakım modunda (`src/lib/config.ts` → `CANLI_BAKIM_MODU`); kapatma kararı site sahibinindir.
- Her değişiklikten sonra `npm run typecheck`, `npm run lint`, `npm run build`; uydurma veri/istatistik yok.
