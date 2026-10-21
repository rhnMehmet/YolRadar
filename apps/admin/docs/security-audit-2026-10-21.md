# RoadSense bağımlılık güvenliği değerlendirmesi

Tarih: 21 Ekim 2026. Bu rapor kurulu kilit dosyaları, `npm audit --json`, yerel bağımlılık kaynakları ve aşağıdaki güvenlik duyurularına dayanır. Mobil bağımlılıklarda veya kilit dosyasında değişiklik yapılmadı.

## Sonuçlar

| Proje | Kritik | Yüksek | Orta | Düşük | Toplam |
| --- | ---: | ---: | ---: | ---: | ---: |
| `apps/admin` | 0 | 0 | 0 | 0 | 0 |
| `apps/mobile` | 0 | 15 | 7 | 0 | 22 |

Mobil sonuçtaki 22, birbirinden bağımsız 22 açık anlamına gelmez. Üç temel duyuru, bunları taşıyan üst paketlere de yansımıştır. Uygulamanın doğrudan bağımlılıkları olan `expo` ve `react-native` bu nedenle işaretlenir; aşağıdaki üç sorunlu paket ise dolaylı bağımlılıktır.

## Üç temel bulgu

| Kurulu paket | Düzey ve kaynak | Bağımlılık yolu ve kullanım | Değerlendirme |
| --- | --- | --- | --- |
| `braces@3.0.3` | Yüksek — [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | Expo/React Native araçları → Metro → `metro-file-map@0.84.5` → `micromatch@4.0.8` → braces. Dosya deseni işleme. | Çok derin, güvenilmeyen brace desenleri Node sürecini durdurabilir. İncelenen kullanım geliştirme/derleme araçlarına aittir. Duyuruda yamalı sürüm belirtilmiyor. |
| `node-forge@1.4.0` | Yüksek — [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) | Expo → `@expo/cli@57.0.31` ve `@expo/code-signing-certificates@0.0.6` → node-forge. Sertifika ve imza işlemleri. | Belirli RSA PKCS#1 v1.5 doğrulamalarında hatalı imzanın kabul edilmesi söz konusu. Araç kaynaklarında sertifika/CSR ve imza doğrulama çağrıları var; bu nedenle yalnızca geliştirme aracı diye risksiz sayılmamalı. Güvenilmeyen sertifika veya imza işlenen akışlar ayrıca değerlendirilmelidir. Duyuruda yamalı sürüm belirtilmiyor. |
| `uuid@7.0.3` | Orta — [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) | Expo → `@expo/config-plugins` → `xcode@3.0.1` → uuid. Yerel iOS proje kimlikleri. | Sorun, dış tampon verilen `v3/v5/v6` çağrılarındaki sınır kontrolüyle ilgili. Kurulu xcode kaynağında görülen çağrı `uuid.v4()`; bu çağrıda duyurudaki etki gösterilmedi. Yamalı sürümler arasında 11.1.1 var, ancak 7 → 11 geçişi üst paketin sürüm aralığı dışında. |

Bu değerlendirme duyurular ve mevcut çağrı noktalarından çıkarımdır; istismar testi yapılmadı. Bir duyurunun uygulanabilirliği girdilere ve çalıştırılan akışa bağlıdır.

## Etkilenen paketlerin tamamı

Yüksek (15): `@expo/cli`, `@expo/code-signing-certificates`, `@expo/metro`, `@expo/metro-config`, `@react-native/community-cli-plugin`, `@react-native/virtualized-lists`, `braces`, `expo`, `metro`, `metro-config`, `metro-file-map`, `metro-transform-worker`, `micromatch`, `node-forge`, `react-native`.

Orta (7): `@expo/config`, `@expo/config-plugins`, `@expo/inline-modules`, `@expo/local-build-cache-provider`, `@expo/prebuild-config`, `uuid`, `xcode`.

Paketlerin npm tarafından production bağımlılığı sayılması, her dosyanın telefonda çalıştığı anlamına gelmez. Expo kendi CLI ve derleme araçlarını da bağımlılık ağacında taşır. Bu nedenle yalnızca `npm audit --omit=dev` kullanmak mobil çalışma zamanı etkisini ayırmak için yeterli değildir.

## Mobil çalışma zamanına erişilebilirlik

Mevcut Metro üzerinden `index.ts.map` kaynak grafikleri, her iki platform için `dev=false`, `hot=false`, `lazy=false`, Hermes dönüşüm seçenekleriyle alındı:

| Platform | HTTP | Kaynak sayısı | Sorunlu npm paketlerinin eşleşmesi |
| --- | ---: | ---: | ---: |
| iOS | 200 | 589 | 0 |
| Android | 200 | 587 | 0 |

Tam `node_modules/{braces,micromatch,node-forge,uuid,xcode}/` paket yolları arandı. `expo-modules-core/src/uuid` farklı bir modüldür; npm uuid paketi olarak sayılmadı.

Mevcut başlangıç uygulamasının JavaScript grafiğinde bu paketler görünmüyor. Telefon ekranından bu üç açığa ulaşılabildiğine dair kanıt bulunmadı. Bu kontrol native ikili dosya, Expo Go'nun kendi kodu, gelecekte eklenecek özellikler veya tüm derleme/OTA imzalama akışları için güvenlik garantisi değildir. Android grafiğinin üretilmesi, Android gerçek cihaz testi yerine geçmez; o test hâlâ bekliyor.

Yerel kaynak kanıtları:

- `@expo/code-signing-certificates/build/main.js`: node-forge içe aktarımı (satır 8), sertifika doğrulama (176), imza doğrulama (203), CSR doğrulama (246).
- `xcode/lib/pbxProject.js`: `uuid.v4()` kullanımı (satır 90).
- Kilit dosyasında `metro-file-map` → micromatch → braces sürüm ve bağımlılık aralıkları.

## Expo uyumluluğunu koruyan çözüm önerisi

Şu an doğrulanmış, tüm uyarıları gideren uyumlu otomatik düzeltme yok. Audit, Expo için `44.0.6`, React Native için `0.72.17` öneriyor; bunlar mevcut SDK 57 / RN 0.86.3 kurulumundan geriye gidiş ve uyumlu bir bakım güncellemesi değil.

1. Expo SDK 57 ile uyumlu üst paket yamaları yayımlandığında ayrı onayla değerlendirin; `expo install --check`, Expo Doctor, TypeScript ve iki cihaz testiyle doğrulayın.
2. braces ve node-forge için önce upstream yama/üst paket çözümünü bekleyin veya izole bir çalışmada bakımcı yamasını değerlendirin. Mevcut duyurulara göre yalnızca sürüm artırarak uygulanabilecek yayımlanmış güvenli sürüm doğrulanmadı.
3. uuid için tercihen xcode/config-plugins'in desteklenen güncellemesini kullanın. Zorla `overrides` ile ana sürüm atlatmayı uyumluluk testi olmadan uygulamayın.
4. Düzeltme beklerken dış girdileri dosya deseni veya imza/sertifika doğrulama araçlarına aktaran yeni akışlar eklemeden önce bu bulguları yeniden ele alın.

Bu görevde `npm audit fix`, `--force`, `overrides`, Expo/RN sürüm değişikliği veya toplu güncelleme uygulanmadı. Güvenlik düzeltmesi için ayrıca kullanıcı onayı beklenecek.

## Mobil dosya koruması

Görev öncesi ve sonrası 14 kaynak, varlık ve yapılandırma dosyasının SHA-256 özetleri aynı. Buna `App.tsx`, `package.json`, `package-lock.json`, `app.json` ve `tsconfig.json` dahil. `node_modules` ile `.expo` çalışma önbellekleri bu karşılaştırmanın dışında tutuldu. Metro 8081 portunda çalışmaya devam ediyor; yönetim paneli yalnızca 127.0.0.1:5173 üzerinden sunuluyor.
