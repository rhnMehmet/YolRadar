# Görev 5 — npm workspaces ve ortak TypeScript geçiş raporu

Tarih: 21 Ekim 2026. Sonuç: AŞAMA C–G tamamlandı. iPhone yeniden açılışı ve Fast Refresh kullanıcı tarafından doğrulandı. Android gerçek cihaz testi bekliyor. Görev 6 başlatılmadı.

## 1. Başlangıç ve son durum

| Kontrol | Önce | Sonra |
| --- | --- | --- |
| Node.js / npm | 24.22.0 / 11.19.1 | Aynı |
| Mobil React | 19.2.3 | 19.2.3 |
| Web React / React DOM | 19.3.1 / 19.3.1 | Aynı |
| Expo / React Native | 57.0.30 / 0.86.3 | Aynı |
| Vite / TypeScript | 8.3.5 / 6.0.3 | Aynı |
| Mobil TypeScript / Expo uyumu | Başarılı | Başarılı |
| Web TypeScript / build | Başarılı | Başarılı |
| Expo Doctor | 21/21 | 21/21 |
| Etkin lockfile | İki uygulamada ayrı | Kökte tek lockfile v3 |
| Mobil audit | 15 yüksek + 7 orta | Aynı |
| Web audit | 0 | 0 |
| Ortak paket testleri | Paket yoktu | 8/8 geçti |

## 2. Onaylanan plan ve güvenlik sınırları

Kullanıcı AŞAMA C–G'yi; dosya yedekleme, sürüm/çözümleme koruması, önce lockfile/dry-run denetimi ve yalnızca projeye ait Metro/Vite süreçlerinin aynı portlarda yeniden başlatılması koşullarıyla onayladı. Beklenmeyen sürüm veya peer çakışması olmadı. `--force`, `--legacy-peer-deps`, audit fix, dedupe veya node_modules temizliği kullanılmadı.

## 3. Yedekler ve dosya değişiklikleri

Önce kök `.gitignore` oluşturuldu; `.migration-backups/probe.txt` için `git check-ignore -v` başarılı oldu. Sonra 31 mevcut dosya ve yeni `.gitignore` olmak üzere 32 dosya kopyalanıp SHA-256 değerleri eşleştirildi.

Yerel yedek dizini: `.migration-backups/task5-20261021/`. Git tarafından dışlanır. `original/`, `sha256-before.json`, arşivlenmiş iki lockfile ve karşılaştırma/kurulum günlükleri burada tutulur. Eski kilitlerin arşiv kopyaları başlangıç SHA-256 değerleriyle aynıdır.

Değişen mevcut kaynak/manifest dosyaları (7):

- `apps/mobile/package.json`: mevcut sürümler sabitlendi, shared bağımlılığı eklendi.
- `apps/mobile/App.tsx`: başlık metni aynı değerli ortak `APP_NAME` sabitinden geliyor.
- `apps/mobile/tsconfig.json`: kaynak paketin `.ts` içe aktarımları için `allowImportingTsExtensions` eklendi; Expo base ve strict korundu.
- `apps/admin/package.json`: mevcut sürümler sabitlendi, shared bağımlılığı eklendi.
- `apps/admin/src/data/reports.ts`: shared kodları ve görüntüleme modeli kullanılıyor.
- `apps/admin/src/App.tsx`: etiketleme, arama, filtre ve istatistikler shared kodlarıyla çalışıyor.
- `apps/admin/README.md`: kökten workspace komutları belgelendi.

İki eski lockfile silinmeden `archived-locks/` içine taşındı. Başlangıç anlık görüntüsündeki diğer 23 dosya değişmedi; bunlardan biri başlangıçta yeni oluşturulmuş kök `.gitignore` dosyasıdır. Mobil varlıklar, app.json, index.ts, web CSS ve Vite yapılandırması değişmedi.

Yeni dosyalar: kök `package.json`, `package-lock.json`, `.gitignore`, `README.md`; `packages/shared` kaynakları/yapılandırması/testleri; `scripts/workspace-lock.mjs`, `scripts/verify-demo.mjs` ve bu rapor.

## 4. Workspace ve lockfile geçişi

Kök paket `private: true`; workspace listesi `apps/mobile`, `apps/admin`, `packages/shared`. Ortak paket adı `@roadsense/shared`, sürümü 0.1.0. Uygulamalar bu sürümü standart npm bağımlılığı olarak bildirir; npm yerel workspace bağlantısını kullanır.

Eski iki kilitte 480 mobil ve 70 web bağımlılık kaydı vardı. Mevcut paket yollarını workspace altına taşıyan bir kök aday üretildi; paketlerin version/resolved/integrity değerleri korundu. npm'nin lockfile-only işlemi ile aday doğrulandı. Bu bir npm güncellemesi değildir; mevcut lock verisinin kontrollü dönüşümüdür.

| Denetim | Sonuç |
| --- | --- |
| Eski kayıt karşılaştırması | 550/550, version/resolved/integrity farkı 0 |
| Dry-run kaldırılan/değiştirilen paket | 0 / 0 |
| Dry-run eklenen | Üç yerel workspace bağlantısı + TypeScript 6.0.3 |
| Gerçek kurulum | Aynı dört ekleme; mevcut uygulama bağımlılıkları yeniden kurulmadı |
| Diskte sürümü doğrulanan paket | 498; fark 0 |
| Platform nedeniyle diskte bulunmayan optional paket | 53; Windows/CPU uyumsuzluğu beklenen durum |
| `npm ls --all --json` | Çıkış 0; problems yok |

Kurulum öncesi incelenen kök lockfile ile kurulum sonrası dosyanın SHA-256 değeri aynıdır:

`DA2C10FA5C05FD26A30CE3EEB03478684AAC998A17E72B56F942A85E2E369A1A`

Doğrudan sürüm aralıklarının çalışan kesin sürümlere çevrilmesi ve shared 0.1.0 bağımlılığı manifestlerdeki amaçlı değişikliklerdir. Mevcut dolaylı paket çözümlemelerinde fark yoktur. TypeScript'in kökteki kopyası da uygulamalarda zaten kullanılan 6.0.3 sürümüdür. Uygulama node_modules dizinleri yerlerinde kaldı.

`--ignore-scripts` değerlendirmesi: yeni TypeScript ve workspace paketlerinde preinstall/install/postinstall yok. Kurulu uygulama paketlerinde lifecycle betiği veya binding.gyp bulunmadı; lockfile'da görülen fsevents kurulum betiği yalnızca macOS optional paketine aittir. Bu Windows geçişinde gerekli kurulum işleminin atlandığına dair bulgu yok. Bu karar gelecekteki paket eklemeleri için otomatik olarak geçerli sayılmaz.

## 5. Ortak paket

React, React Native veya Node çalışma zamanı bağımlılığı yok. `src/index.ts` ESM kaynak girişidir. Strict TypeScript; cihaz dili/yerel saat varsayımı olmayan yardımcılar içerir.

Türler: UserRole, DamageType, ReportStatus, Coordinates, DamageReport, ReportPhoto, AiPrediction, ApiError. Beş hasar kodu ve üç durum kodu Türkçe etiketlere eşlenir. DamageReport koordinat, açıklama, zaman, durum, fotoğraflar, isteğe bağlı şerit ve AI tahminlerini tanımlar. Bu alanlar backend için kesinleşmiş sözleşme değildir.

Koordinat doğrulaması dünya sınırları, sonlu sayılar ve eksik/geçersiz alanları kontrol eder; Isparta sınırı uygulamaz. Tarih biçimlendirme yalnız `YYYY-MM-DD` veya açık UTC zaman damgası kabul eder. America/Los_Angeles ve Pacific/Auckland ortamlarında aynı UTC anı `21 Eki 2026` olarak doğrulandı.

## 6. API sözleşmesi ve uygulama entegrasyonu

API seçenekleri dışarıdan baseUrl/tokenProvider/timeoutMs alır. Hata türleri, sonuç ve istemci arayüzü dışa aktarılır. Ayar doğrulaması token sağlayıcısını çağırmaz; gerçek HTTP transportu, endpoint veya depolama geliştirilmedi. Zaman aşımı/iptal davranışının gelecekteki transport tarafından uygulanması belgelendi.

Web demo kaydı, `Pick<DamageReport, 'id' | 'damageType' | 'status'>` üzerine konum adı/tarih içeren görüntüleme modelidir. Koordinatları bilinmediğinden tam DamageReport olarak gösterilmez. Eski sekiz kaydın ID, hasar etiketi, konum, tarih ve durum görüntüleme değerleri birebir karşılaştırıldı; hepsi aynı. Dağılım 8 toplam / 3 yeni / 2 inceleniyor / 3 çözüldü. Koordinat uydurulmadı.

Mobil ekranın başlığı aynı metni ortak paketten alır. Fast Refresh sırasında footer geçici 03 yapıldı; kullanıcı otomatik değişimi doğruladı. Son durumda footer eski `TypeScript ile geliştiriliyor. • 02` metnine geri alındı.

## 7. TypeScript ve ortak testler

Kök `npm.cmd run typecheck`: mobile, admin ve shared başarılı. Sekiz test grubu; dışa aktarımlar, tüm etiketler, geçerli/geçersiz koordinatlar, UTC/takvim tarihleri ve API ayarlarının davranışını doğruladı. 8 geçti, 0 başarısız. Ek test kütüphanesi kurulmadı; Node 24 yerleşik çalıştırıcısı kullanıldı.

## 8. Web build ve gerçek tarayıcı testi

Vite 8.3.5 build başarılı: 22 modül; JS 234.47 kB (gzip 72.98), CSS 14.92 kB (gzip 4.03). Önceki JS 233.62 kB idi; ortak etiket/tarih kodunun eklenmesiyle yaklaşık 0.85 kB arttı. Bu artış bağımlılık sürümü değişimi değildir.

Gerçek uygulama içi tarayıcıda 1440×1000, 820×1180, 390×844 görünümleri doğrulandı. Sayfa yatay taşmıyor; dar ekranda 640 px tablo kendi 337 px bölgesinde kayıyor. Menü geçişleri, harita açıklaması ve listeye dönüş, klavye ile menü kullanımı başarılı.

ÇÜNÜR araması 2 kayıt; Yeni filtresiyle birlikte 1 kayıt. ÇUKUR araması 3 kayıt. İnceleniyor 2, Çözüldü 3 kayıt. Eşleşmeyen arama boş sonuç açıklamasını gösteriyor. İstatistikler 3/2/1/2 hasar dağılımı ve yuvarlanmış %38 çözüm oranını koruyor. Konsol error/warn listesi boş; Vite terminalinde hata yok. Ekran görüntüleri yerel görselleştirme klasörüne kaydedildi.

## 9. Expo, Metro ve React çözümlemesi

Yalnız komut satırı/portu doğrulanan bu projeye ait eski Metro (PID 23348) ve Vite (PID 12384) durduruldu. Metro 8081'de bir kez `--clear`, Vite 127.0.0.1:5173'te yeniden başlatıldı. Başka süreçler ve OneDrive ayarları değiştirilmedi.

Expo uyumu başarılı; alt lockfile'lar arşivlendikten sonra da Doctor 21/21 geçti. Varsayılan Expo Metro yapılandırması kök node_modules ve üç workspace klasörünü algıladı. Özel resolver/alias eklenmedi.

Node çözümlemesinde hem mobil App hem react-native kendi mobile/node_modules/react 19.2.3 kopyasını; web ve react-dom admin/node_modules/react 19.3.1 kopyasını kullanıyor.

| Üretim JS kaynak grafiği | Önce | Sonra | Yanlış React / sorunlu npm paketi |
| --- | ---: | ---: | --- |
| iOS | 589 | 593 | 0 / 0 |
| Android | 587 | 591 | 0 / 0 |

Artan dört kaynak shared/src altındaki index, types, helpers ve api dosyalarıdır. Her iki grafikte React yollarının tamamı apps/mobile/node_modules/react altındadır; web React'i görünmez. Bu, native ikili dosyalar veya gelecekteki özellikler için genel güvenlik garantisi değildir.

## 10. iPhone testi

Kullanıcı Expo Go ile yeniden açılışı aynı ekran olarak doğruladı. Ardından uygulama açıkken footer'ın otomatik 03'e değiştiğini doğruladı; Fast Refresh başarılı. Son durumda geçici metin geri alındı. Terminalde iOS geliştirme paketi 711 modülle başarıyla üretildi.

## 11. Android testi

Metro Android JavaScript grafiğini başarıyla üretti; gerçek Android cihaz testi hâlâ bekliyor. Kaynak grafiği fiziksel cihaz testi yerine sayılmadı.

## 12. Güvenlik önce/sonra

Mobil workspace audit 15 yüksek / 7 orta, web workspace 0; kök toplam 22. Başlangıçla aynı üç temel duyuru ve aynı etkilenen paket listesi görüldü; yeni güvenlik bulgusu yok. Audit'in çıkış kodu 1, mevcut mobil bulguları bildirmesinden kaynaklanır.

- [braces duyurusu](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- [node-forge duyurusu](https://github.com/advisories/GHSA-86w9-cpqp-85rv)
- [uuid duyurusu](https://github.com/advisories/GHSA-w5hq-g745-h8pq)

Bu riskler giderilmiş veya önemsiz sayılmadı. Ayrıntılı çağrı/risk değerlendirmesi önceki [güvenlik raporunda](../apps/admin/docs/security-audit-2026-10-21.md). Güvenlik düzeltmesi bu geçişe karıştırılmadı.

## 13. Git durumu

Kök Git korundu; main dalında hâlâ commit yok. Remote `https://github.com/rhnMehmet/yolRadar.git`. Kaynaklar yeni/untracked durumda; staged değişiklik, commit veya push yok. Uygulamalarda ve shared altında ayrı .git yok. node_modules, .expo, dist, önbellek, .env ve yedekler ignore kurallarıyla dışlanıyor.

## 14. Karşılaşılan sorunlar ve çözümleri

- İlk mobil typecheck TS5097 verdi: kaynak paketin `.ts` uzantılı içe aktarımlarına izin gerekiyordu. Mobil tsconfig'e yalnız `allowImportingTsExtensions: true` eklendi; sonra tüm kontroller geçti. Paket/sürüm müdahalesi yapılmadı.
- Eski `/index.ts.map` test adresi monorepo kökünden index aradı ve çözümleme hatası verdi. Test URL'si yeni `/apps/mobile/index.ts.map` girişine düzeltildi; iki grafik de HTTP 200 döndü. Çalışan uygulamada çözümleme sorunu kalmadı.
- İlk satır içi demo karşılaştırma komutunda PowerShell tırnak ayrıştırma hatası oluştu; kontrol dosya tabanlı `verify-demo.mjs` olarak çalıştırıldı ve geçti. Kaynak veriler bu hatadan etkilenmedi.
- Metro'nun NO_COLOR/FORCE_COLOR uyarısı terminal renk ortamıyla ilgiliydi; derleme başarısızlığına yol açmadı. Temiz önbellek uyarısı onaylanan `--clear` işleminin beklenen sonucuydu.
- Başarısız npm kurulumu, peer çakışması veya beklenmeyen paket çözümleme değişikliği olmadı; geri dönüş gerekmedi.

## 15. Sonuç ve çalışma komutları

Görev 5'in tamamlanma ölçütleri sağlandı; Android fiziksel testinin bekleyen durumu korunuyor. Görev 6 için altyapı hazır, ancak bu görev kapsamında başlatılmadı.

Kökten `npm.cmd run dev:mobile`, `npm.cmd run dev:admin`, `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build:admin` kullanılır. Sunucular kullanıcı önizlemesi için açık bırakıldı.
