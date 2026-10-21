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
- Hasar Haritası: harita özelliğinin henüz eklenmediğini açıklayan hazırlık ekranı.
- İstatistikler: örnek kayıtların hasar türlerine ve durumlarına göre dağılımı.

Veri kaynağı `src/data/reports.ts` dosyasıdır. Kayıtların tamamı kurgusaldır; mahalle adları gerçek hasar konumları göstermez. Arama ve filtreleme tarayıcı belleğinde çalışır. Gerçek giriş sistemi, API, veritabanı veya harita bağlantısı bulunmaz.

Mobil uygulama `../mobile` altında ayrı bir workspace olarak kalır. Ortak tipler ve yardımcılar `@roadsense/shared` paketinden gelir. Tek etkin lockfile depo kökündedir. Demo görüntüleme modeli, koordinat toplanmadığı için tam bir `DamageReport` değildir. Yerel ortam dosyaları Git'e alınmaz; gerçek sırları frontend koduna koymayın.

Mobil ve web bağımlılıkları için [21 Ekim 2026 güvenlik değerlendirmesi](docs/security-audit-2026-10-21.md) mevcut bulguları ve ayrı onay gerektiren düzeltme seçeneklerini açıklar.
