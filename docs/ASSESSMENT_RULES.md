# Creator Analytics — Assessment Rules

## 1. Amaç ve kapsam

Bu doküman, Creator Analytics prototipinde içerik üreticileri için üretilecek değerlendirmelerin kurallarını ve eşiklerini tanımlar.

Prototip, 10 içerik üreticisinin iki haftalık mock verisini kullanır. Gerçek platform bağlantısı veya backend geliştirmesi yoktur. Aşağıdaki eşikler sektör standardı değil, case için seçilmiş **prototip varsayımlarıdır**.

Her değerlendirme ölçülebilir kanıt ve somut bir sonraki adım içermelidir. Verilerde bulunmayan nedenler gerçekmiş gibi sunulmamalıdır.

## 2. Kullanılan metrikler

- `plannedStreams`: Haftada planlanan yayın sayısı.
- `completedStreams`: Haftada gerçekleşen yayın sayısı.
- `completionRate`: Yayın tamamlama oranı.
- `completionRateChange`: İki hafta arasındaki tamamlama oranı farkı; yüzde puan (pp) olarak ifade edilir.
- `averageWatchDurationMinutes`: Geçerli ölçümü olan tamamlanmış yayınlardan hesaplanan haftalık ortalama izlenme süresi.
- `averageWatchDurationChange`: Haftalık ortalama izlenme süresindeki değişim.
- `publishedClips`: Haftalık yayımlanan kısa klip sayısı.
- `publishedClipsChange`: İki hafta arasındaki klip sayısı değişimi.

Ham veri modeli ve haftalık metrik hesaplamaları, `API_DESIGN.md` ve yayın başına veri modelini anlatan dokümandaki kararlara dayanır.

## 3. Yayın düzenliliği eşikleri

### Tamamlama oranı

`completionRate = completedStreams / plannedStreams * 100`

| Tamamlama oranı | Yorum                                                        |
| --------------- | ------------------------------------------------------------ |
| ≥ %90           | Planlanan yayınların neredeyse tamamı gerçekleştirilmiş.     |
| ≥ %75 ve < %90  | Genel olarak düzenli; bazı yayınlar gerçekleşmemiş olabilir. |
| < %75           | Yayın tutarlılığı açısından inceleme gerektiren sinyal.      |

**Ana eşik: %75.** Bu, prototip için seçilmiş bir varsayımdır; evrensel bir sektör standardı değildir.

### Haftalar arası düşüş

İkinci haftanın tamamlama oranı, ilk haftaya kıyasla **en az 25 yüzde puan düşerse** bu, tutarlılık sorunu için ek bir sinyal kabul edilir.

Örnek: %100'den %75'e düşüş = -25 yüzde puan. Yüzde puan farkı, iki yüzde oranının çıkarılmasıdır; göreli yüzde değişimiyle aynı değildir.

### Tutarlılık sorunu kuralı

Yeterli veri varsa aşağıdakilerden en az biri gerçekleştiğinde `consistency_issue` değerlendirmesi yapılır:

1. İkinci haftanın tamamlama oranı %75'in altındadır.
2. Tamamlama oranı ilk haftadan ikinci haftaya en az 25 yüzde puan düşmüştür.

Örnek kanıt:

> İkinci hafta planlanan 4 yayının 2'si gerçekleşti. Tamamlama oranı ilk haftadaki %100'den %50'ye düştü (-50 yüzde puan).

Örnek aksiyon:

> Gerçekleşmeyen yayınların nedenlerini içerik üreticisiyle görüşün ve gelecek hafta için uygulanabilir bir yayın planı belirleyin.

Veri bunu göstermiyorsa “planlaması kötüydü” veya “motivasyonu düştü” gibi nedenler ileri sürülmemelidir.

## 4. Yayın kalitesi ve izleyici etkileşimi

`averageWatchDurationMinutes`, izleyicilerin yayını ortalama ne kadar süre izlediğini gösteren bir etkileşim göstergesidir. Tek başına içerik kalitesini kanıtlamaz.

Bu prototipte **sabit bir dakika eşiği kullanılmayacaktır**. Örneğin, ortalama izlenme süresinin 15 dakikayı aşmasını başarı standardı saymak için elimizde yeterli dayanak yoktur.

Bunun yerine iki hafta arasındaki değişim raporlanır:

- Artış: İzleyici etkileşimi açısından olumlu yönde bir sinyal.
- Azalış: Takip edilmesi gereken bir sinyal.
- Değerlerden biri `null` ise değişim hesaplanmaz; eksik değer sıfır sayılmaz.

Örnek:

> Ortalama izlenme süresi 12 dakikadan 16 dakikaya yükseldi (+4 dakika). Bu, olumlu yönde bir etkileşim sinyalidir; tek başına içerik kalitesinin arttığını kanıtlamaz.

Yayın düzenliliği ve izleyici etkileşimi ayrı yorumlanmalıdır. Birindeki iyileşme, diğerindeki gerilemeyi gizlememelidir.

## 5. Kısa klip üretimi

`publishedClips`, yayımlanan kısa kliplerin sayısıdır; yayın süresi veya izleyici sayısı değildir.

- Haftalık değişim `week2 - week1` olarak hesaplanır.
- Artış, daha fazla klip yayımlandığını gösterir; kliplerin daha kaliteli veya daha başarılı olduğunu tek başına kanıtlamaz.
- Şirket tarafından hedef sayı verilmediğinden mutlak başarı eşiği tanımlanmaz.
- Değer bilinmiyorsa `null` korunur; sıfır kabul edilmez.

## 6. Değerlendirme türleri ve öncelik

Kurallar aşağıdaki sırayla değerlendirilir. İlk olarak değerlendirme için gerekli verilerin yeterli olup olmadığı kontrol edilir. Yeterli veri varsa yayın tutarlılığı koşulları değerlendirilir. Bu koşullardan biri sağlanıyorsa `consistency_issue` kategorisi uygulanır. Tutarlılık sorunu yoksa olumlu ilerleme koşulları kontrol edilir. Hiçbir kategoriye uymayan, ancak verileri yeterli olan nötr durumlar `insufficient_data` olarak etiketlenmez; bu durum üç kategorili prototipin kapsam sınırı olarak kabul edilir.

### 1. `insufficient_data` — Değerlendirme için yetersiz veri

Karşılaştırma için gerekli veriler eksikse bu kategori önceliklidir.

Örnekler:

- Haftalardan biri için planlanan yayın veya gerçekleşme verisi eksiktir.
- Bir haftada planlanan yayın sayısı sıfırdır; tamamlama oranı hesaplanamaz.
- İki haftayı karşılaştırmak için gereken temel değerler mevcut değildir.

Bir izlenme süresi ölçümünün eksik olması, yayın tamamlama verisini kendiliğinden geçersiz kılmaz. Mümkün olan metrikler raporlanabilir; yalnızca eksik metriğe dayalı sonuç çıkarılmaz.

Örnek aksiyon:

> Değerlendirmeyi tamamlamak için eksik haftalık yayın veya analitik verilerini doğrulayın.

### Eksik verinin değerlendirmeye etkisi

Eksik veri, yalnızca ilgili değerlendirme için gerekli olan metrikleri etkiler.

- Yayın planı veya gerçekleşme verileri eksikse yayın düzenliliği karşılaştırması yapılmaz.
- Ortalama izlenme süresi eksikse, mevcut yayın düzenliliği verileriyle değerlendirme yapılabilir; ancak izlenme süresindeki değişim hakkında sonuç çıkarılmaz.
- Kısa klip sayısı eksikse diğer geçerli metrikler değerlendirilebilir; klip sayısındaki değişim hakkında sonuç çıkarılmaz.

Bir metriğin eksik olması, tek başına bütün değerlendirmeyi `insufficient_data` olarak sınıflandırmak için yeterli değildir.

### 2. `consistency_issue` — Yayın tutarlılığı sorunu

Yeterli veri bulunduğunda Bölüm 3'teki koşullardan en az biri sağlanıyorsa bu kategori uygulanır.

Aksiyon gözlenen duruma yönelik olmalı; bilinmeyen bir neden gerçekmiş gibi sunulmamalıdır.

### 3. `consistent_positive_progress` — Düzenli ve olumlu yönde ilerliyor

Bu kategori için:

- İki hafta için de gerekli yayın planı ve gerçekleşme verileri bulunmalıdır.
- İkinci haftanın tamamlama oranı en az %75 olmalıdır.
- Tamamlama oranında 25 yüzde puan veya daha büyük bir düşüş olmamalıdır.
- En az bir mevcut gösterge olumlu yönde değişmelidir: tamamlama oranı artışı, ortalama izlenme süresinde artış veya yayımlanan klip sayısında artış.

Bu prototipte “olumlu yönde ilerleme”, gözlenen metriklerden en az birindeki artış olarak tanımlanır. İzlenme süresi veya klip sayısı artışı tek başına içerik kalitesinin arttığını kanıtlamaz.

Örnek kanıt:

> Tamamlama oranı %75'ten %100'e yükseldi (+25 yüzde puan) ve yayımlanan kısa klip sayısı 3'ten 5'e çıktı (+2).

Örnek aksiyon:

> İyileşen yayın düzenini sürdürün ve işe yarayan yayın planını gelecek hafta da uygulayın.

### Kategoriye sığmayan durumlar

Bir içerik üreticisi tutarlılık sorunu yaşamıyor ancak hiçbir mevcut göstergede olumlu değişim de göstermiyorsa onu zorla “olumlu ilerliyor” diye etiketlemeyin. İstenen üç kategorinin dışında kalan bu nötr durum için ek bir `stable` kategorisi en doğru model olurdu. Case yalnızca üç kategoriye izin veriyorsa bu kenar durum açıkça belgelenmeli; demo verisi kurallarla çelişmemelidir.

## 7. Eksik veri ilkeleri

- `null`, ölçümün eksik veya mevcut olmadığını ifade eder.
- `0`, bilinen gerçek sıfır değeridir.
- Eksik değerler sıfır olarak ele alınmaz.
- Geçerli ölçüm yoksa ilgili ortalama veya değişim `null` olur.
- Eksik izlenme süresi, bilinen yayın tamamlama oranını kendiliğinden geçersiz kılmaz.
- `insufficient_data`, yalnızca ilgili değerlendirme için gerekli veriler eksikse uygulanır.

## 8. Değerlendirme çıktısı

Her değerlendirme en az şu alanları içermelidir:

- `category`: Değerlendirme türü.
- `evidence`: Metrik ve değerlerle desteklenen kısa açıklama.
- `nextAction`: Uygulanabilir bir sonraki adım.

### Örneklem büyüklüğünün yorumlanması

Tamamlama oranı, planlanan yayın sayısından etkilenir. Planlanan yayın sayısı az olduğunda tek bir yayının gerçekleşmemesi oranı önemli ölçüde değiştirebilir.

Bu nedenle değerlendirme kanıtlarında yalnızca yüzdelik oranı değil, gerçekleşen ve planlanan yayın sayılarını da gösterin.

Örneğin, "%100'den %50'ye düştü" ifadesi yerine "İlk hafta 2/2 yayın (%100), ikinci hafta 1/2 yayın (%50) gerçekleşti; tamamlama oranı 50 yüzde puan düştü" ifadesini tercih edin.

Bu sonuçlar gözlenen iki haftalık döneme ilişkin sinyallerdir; tek başına uzun vadeli bir davranış örüntüsünü kanıtlamaz.

Örnek:

```json
{
  "category": "consistency_issue",
  "evidence": "İlk hafta 4/4 yayın (%100), ikinci hafta 2/4 yayın (%50) gerçekleşti. Tamamlama oranı 50 yüzde puan düştü.",
  "nextAction": "Gerçekleşmeyen yayınların nedenlerini içerik üreticisiyle görüşün ve gelecek hafta için uygulanabilir bir yayın planı belirleyin."
}
```

## 9. Varsayımların özeti

- İkinci hafta tamamlama oranının %75'in altında olması, tutarlılık sorunu sinyalidir.
- Tamamlama oranında en az 25 yüzde puanlık düşüş, ek tutarlılık sorunu sinyalidir.
- Ortalama izlenme süresi için sabit bir başarı eşiği yoktur; değişim ve bağlam raporlanır.
- Klip sayısı için şirket hedefi verilmediğinden mutlak başarı eşiği yoktur.
- Olumlu ilerleme, en az bir mevcut göstergedeki artış olarak tanımlanır.
- Değerlendirmeler kanıta dayanır; nedenler uydurulmaz.
- Eşikler prototip varsayımlarıdır ve gerçek kullanım öncesinde ürün/iş paydaşlarıyla doğrulanmalıdır.
