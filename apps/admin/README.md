# RoadSense Yönetim Paneli

React + Vite + TypeScript ile hazırlanan yerel demo yönetim paneli.

## Çalıştırma

Depo kökünde PowerShell üzerinden:

```powershell
npm.cmd run dev:admin
```

Tarayıcı adresi: http://127.0.0.1:5173

## Kontroller

```powershell
npm.cmd run typecheck --workspace=admin
npm.cmd run build --workspace=admin
npm.cmd audit --workspace=admin
```

## Demo kapsamı

- Genel Bakış: aynı 8 örnek kayıttan hesaplanan özet kartları ve durum dağılımı.
- Hasar Bildirimleri: ID, hasar türü ve konum araması; durum filtresi.
- Hasar Haritası: Isparta merkezli OpenStreetMap haritası; üç ayrı temsili işaretçi, bilgi pencereleri, yakınlaştırma ve merkeze dönüş.
- İstatistikler: örnek kayıtların hasar türlerine ve durumlarına göre dağılımı.

Bildirimlerin veri kaynağı `src/data/reports.ts` dosyasıdır. Kayıtların tamamı kurgusaldır; mahalle adları gerçek hasar konumları göstermez. Arama ve filtreleme tarayıcı belleğinde çalışır. Gerçek giriş sistemi, bildirim API'si veya veritabanı bulunmaz.

## Demo harita

Harita `src/features/damage-map` altında ayrı bileşen, hata sınırı, veri ve stil dosyalarında tutulur. React Leaflet 5.0.0 ve Leaflet 1.9.4 kullanılır; TypeScript tipleri `@types/leaflet` 1.9.22 ile sağlanır. Harita bölümü ilk açıldığında ayrı bir kod parçası olarak yüklenir.

Başlangıç merkezi **37.7648, 30.5566**, yakınlaştırma düzeyi **14**'tür. Üç işaretçi `demoMapMarkers.ts` içindedir; mevcut sekiz bildirime bağlı değildir. Sekiz kayda koordinat eklenmemiştir; toplam 8 ve durum dağılımı 3 yeni / 2 inceleniyor / 3 çözüldü korunur. Haritada ve bilgi pencerelerinde noktaların gerçek yol hasarı bildirimi olmadığı açıkça yazılır. Hasar ve durum etiketleri ile koordinat doğrulaması `@roadsense/shared` üzerinden alınır.

Standart `https://tile.openstreetmap.org/{z}/{x}/{y}.png` döşemeleri internet bağlantısı gerektirir; tarayıcı bu servise doğrudan istek gönderir. OpenStreetMap atfı görünür tutulur. Toplu indirme, çevrimdışı depolama, ek ön yükleme, rota veya adres arama eklenmemiştir. [OSM döşeme kullanım politikası](https://operations.osmfoundation.org/policies/tiles/) geçerlidir.

Harita yüklenirken durum metni; döşeme hatalarında veya 15 saniyelik bekleme sınırında yeniden deneme düğmesi gösterilir. Bileşen yüklenemezse sayfayı yenileme seçeneği sunulur. Harita alanının boyutu değişince `ResizeObserver` ve `invalidateSize` ile ölçüler yenilenir. Dar ekranlar için 400 px, orta ekranlar için 470 px, masaüstü için 510 px harita yüksekliği tanımlıdır. Bunlar CSS kurallarıdır; gerçek ekran testinin yerine geçmez.

Görev 6A test sonuçları ve bekleyen tarayıcı doğrulamaları [uygulama raporunda](docs/task6a-map-report.md) açıklanır.

Mobil uygulama `../mobile` altında ayrı bir workspace olarak kalır. Ortak tipler ve yardımcılar `@roadsense/shared` paketinden gelir. Tek etkin lockfile depo kökündedir. Demo görüntüleme modeli, koordinat toplanmadığı için tam bir `DamageReport` değildir. Yerel ortam dosyaları Git'e alınmaz; gerçek sırları frontend koduna koymayın.

Mobil ve web bağımlılıkları için [21 Ekim 2026 güvenlik değerlendirmesi](docs/security-audit-2026-10-21.md) mevcut bulguları ve ayrı onay gerektiren düzeltme seçeneklerini açıklar.
