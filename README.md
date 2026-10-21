# RoadSense

Expo mobil uygulaması, React yönetim paneli ve platformdan bağımsız TypeScript sözleşmeleri içeren npm workspaces deposu.

## Yapı

```text
apps/mobile       Expo SDK 57 / React Native
apps/admin        React / Vite yönetim paneli
packages/shared   Ortak tipler, etiketler, doğrulama ve API sözleşmeleri
package-lock.json Tek etkin npm kilit dosyası
```

Node.js 24.22.0 ve npm 11.19.1 ile doğrulandı. PowerShell'de `npm.cmd` kullanın; yürütme politikasını değiştirmek gerekmez.

## Geliştirme

Komutları depo kökünde, sunucuları ayrı terminallerde çalıştırın:

```powershell
npm.cmd run dev:mobile
npm.cmd run dev:admin
```

Mobil 8081 portunda Expo Go/LAN; panel http://127.0.0.1:5173 adresinde çalışır. Aynı portta mevcut sunucu varsa ikinci kopya başlatmayın. Mobil ve web kendi React sürümlerini kullanır; ortak paket React içermez.

## Doğrulama

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build:admin
npm.cmd exec --workspace=mobile -- expo install --check
npm.cmd audit --workspace=mobile
npm.cmd audit --workspace=admin
```

Expo Doctor ayrıca çalıştırılmalıdır. Telefon açılışı ve Fast Refresh, terminal kontrollerinden ayrı gerçek cihaz testleridir. Android gerçek cihaz testi bekliyor.

## Bağımlılık yönetimi

Tek etkin lockfile köktedir; uygulama klasörlerinde bağımsız kurulum yapmayın. Mevcut doğrudan bağımlılıklar çalışan sürümlere sabitlendi. Normal yeni kurulum komutu kökte `npm.cmd install --ignore-scripts --strict-peer-deps` şeklindedir. Bu geçişte uygulama bağımlılıklarının hiçbiri yeniden kurulmadı; yalnızca üç workspace bağlantısı ve kurulum betiği olmayan TypeScript 6.0.3 eklendi. Gelecekte lifecycle betiği gerektiren bir paket eklenirse `--ignore-scripts` kararı yeniden değerlendirilmelidir.

Mobil audit'te bilinen 15 yüksek / 7 orta bulgu sürüyor; panel sonucu 0. Zorlayıcı düzeltme veya Expo yükseltmesi uygulanmadı. [Görev 5 raporu](docs/task5-migration-report.md) önce/sonra kanıtlarını açıklar.

## Yerel geçiş yedekleri

`.migration-backups/task5-20261021/` Git dışında tutulur. Başlangıç dosyaları ve SHA-256 listesi, arşivlenmiş eski iki lockfile, kurulum günlükleri ve karşılaştırma sonuçları burada saklanır. Başka bir makineye Git ile gelmez.

`scripts/workspace-lock.mjs` ve `scripts/verify-demo.mjs` bu yerel yedeklere dayanan geçiş denetimleridir. `npm.cmd run verify:migration` lockfile karşılaştırmasını tekrarlar; temiz bir checkout'ta yerel yedek olmadan kullanılamaz. `seed` işlemi tamamlanmış geçişte tekrar çalıştırılmamalıdır.

Geri dönüş için önce değiştirilen kaynak/manifest dosyaları ve eski lockfile'lar yedekten geri alınır; yalnızca bu görevde oluşturulan workspace dosyaları/bağlantıları arşivlenir. Bağımlılık temizliği veya yeniden kurulum gerekirse ayrıca değerlendirilir. Mevcut çalışma Git reset ile silinmez.

## Demo kapsamı

Webdeki sekiz bildirim kurgusaldır; gerçek saha kaydı veya koordinat içermez. Ortak domain tipleri gelecekteki backend için başlangıç sözleşmesidir. HTTP taşıma katmanı, gerçek endpoint, kimlik doğrulama, harita ve AI hizmeti uygulanmamıştır.
