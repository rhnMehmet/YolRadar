# @roadsense/shared

Mobil ve web için React/React Native bağımlılığı olmayan strict TypeScript kaynak paketi. ESM dışa aktarımları Vite ve Expo/Metro tarafından dönüştürülür; ayrı bir dist üretimi gerekmez.

Tipler başlangıç sözleşmesidir; backend henüz kesinleşmedi. Kullanıcı rolleri kimlik doğrulama uygulamaz. AI tahmini ve fotoğraf tipleri mevcut bir AI veya yükleme hizmeti olduğu anlamına gelmez.

`isValidCoordinates` dünya aralıklarını kontrol eder; Isparta sınırı uygulamaz. `formatReportDate` yalnızca `YYYY-MM-DD` veya açık UTC (`Z`) zaman damgası kabul eder; yerel saat dilimini ve cihazın dil verisini kullanmaz. Geçersiz değerlerde RangeError atar.

`createApiClientConfig` yalnızca ayarları doğrular; token sağlayıcısını çağırmaz ve HTTP isteği yapmaz. `ApiClient` gelecekteki taşıma katmanının sözleşmesidir. Gerçek endpoint, token deposu veya transport henüz uygulanmamıştır. Gelecekteki transport zaman aşımında isteği durdurmalı ve ortak hata türlerini kullanmalıdır.

Kökten `npm.cmd run typecheck --workspace=@roadsense/shared` ve `npm.cmd run test --workspace=@roadsense/shared` çalıştırılır. Testler Node.js 24'ün yerleşik test çalıştırıcısını kullanır.
