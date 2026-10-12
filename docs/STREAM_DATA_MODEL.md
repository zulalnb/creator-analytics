# Creator Analytics — Stream-Level Raw Data Notes

## 1. Amaç

Bu not, Creator Analytics prototipinde her bir canlı yayın için hangi ham verilerin tutulacağını ve haftalık ortalama izlenme süresinin nasıl hesaplanacağını tanımlar.

Case'in zorunlu metrikleri:

- Planlanan yayın sayısı
- Gerçekleşen yayın sayısı
- Ortalama izlenme süresi
- Yayımlanan kısa kesit sayısı

Ayrıca iki hafta arasındaki değişimler gösterilecektir. Gerçek platform entegrasyonu veya backend geliştirmesi bu prototipin kapsamında değildir.

## 2. Yayın Kaydı

Her planlanan yayın için bir kayıt tutulur. Böylece gerçekleşmeyen yayınlar da planlanan yayın sayısına dahil edilebilir.

Örnek:

```json
{
  "id": "stream-001",
  "creatorId": "creator-001",
  "scheduledAt": "2026-10-05T19:00:00+03:00",
  "status": "completed",
  "durationMinutes": 60,
  "uniqueViewers": 300,
  "averageWatchDurationMinutes": 18.5,
  "publishedClips": 2
}
```

### Alanların anlamları

- `id`: Yayın kaydının benzersiz kimliği.
- `creatorId`: Yayının ait olduğu içerik üreticisi.
- `scheduledAt`: Yayının planlandığı tarih ve saat. Haftalık gruplama için kullanılır.
- `status`: Yayının gerçekleşme durumu. Prototipte `completed` veya `missed` değerlerini alır.
- `durationMinutes`: Gerçekleşen yayının toplam süresi (dakika).
- `uniqueViewers`: Yayını izleyen benzersiz kişi sayısı. Bu alan ek bağlam içindir; zorunlu case metriği değildir.
- `averageWatchDurationMinutes`: Yayın için ölçülmüş ortalama izlenme süresi (dakika).
- `publishedClips`: Bu yayın kaydıyla ilişkilendirilen ve yayımlanan kısa kesitlerin sayısı. Prototipte klipler, bağlı oldukları yayının `scheduledAt` tarihine göre ilgili haftanın toplamına dahil edilir; klibin fiilî yayımlanma tarihi ayrıca tutulmaz.

`publishedClips`, yayının süresi veya izleyici sayısı değildir. Yayından sonra yayımlanmış kısa videoların adedini ifade eder.

### Gerçekleşmeyen yayın

```json
{
  "id": "stream-002",
  "creatorId": "creator-001",
  "scheduledAt": "2026-10-07T20:00:00+03:00",
  "status": "missed",
  "durationMinutes": null,
  "uniqueViewers": null,
  "averageWatchDurationMinutes": null,
  "publishedClips": 0
}
```

Bu örnekte yayın planlanmış ancak gerçekleşmemiştir. Bu nedenle yayın süresi ve izlenme metrikleri `null` olarak tutulur. `publishedClips: 0`, bu kayıt için yayımlanmış kısa kesit olmadığını belirtir. Eksik veya bilinmeyen bir kesit sayısı varsa onu da `null` olarak temsil etmek gerekir.

## 3. Ortalama İzlenme Süresi Nereden Gelir?

Gerçek bir yayın platformunda ortalama izlenme süresi, platformun izlenme analitiğinden alınır veya izleyici oturumlarına ilişkin verilerden hesaplanır. Örneğin izleyicilerin yayına katılma ve ayrılma zamanları kullanılabilir.

Bu prototipte izleyici başına ham oturum kayıtları oluşturmayacağız. Her yayın için `averageWatchDurationMinutes` alanına temsili, önceden ölçülmüş bir değer koyacağız.

Örnek:

- Yayın süresi: 60 dakika
- Benzersiz izleyici sayısı: 300
- Ortalama izlenme süresi: 18,5 dakika

Bu değerleri birbirinden türetmiyoruz. Yayın süresi ve izleyici sayısı tek başına ortalama izlenme süresini belirlemeye yetmez.

## 4. Haftalık Ortalama İzlenme Süresi Hesabı

### Karar

Haftalık ortalama izlenme süresi, o hafta gerçekleşen ve geçerli izlenme süresi ölçümü bulunan yayınların ortalama izlenme sürelerinin **basit aritmetik ortalaması** olarak hesaplanacaktır.

Formül:

`Haftalık ortalama = Geçerli yayınların ortalama izlenme süreleri toplamı / Geçerli ölçümü bulunan yayın sayısı`

Örnek:

| Yayın | Ortalama izlenme süresi |
|---|---:|
| Yayın A | 10 dakika |
| Yayın B | 20 dakika |

Haftalık ortalama:

`(10 + 20) / 2 = 15 dakika`

### Eksik değerler

- `status` değeri `missed` olan yayınlar ortalamaya dahil edilmez.
- `averageWatchDurationMinutes` değeri `null` olan yayınlar ortalamaya dahil edilmez.
- Eksik değerler sıfır olarak kabul edilmez.
- Geçerli ölçümü olan hiçbir yayın yoksa haftalık ortalama `null` olur; `0` olarak gösterilmez.

### Bu kararın sınırı

Bu yöntem, yayın başına ortalama değerleri eşit ağırlıklandırır. Yayınların izleyici sayıları farklıysa sonuç, bütün izleyicilerin toplam izlenme süresinin toplam izleyici sayısına bölünmesiyle elde edilecek ortalamayla aynı olmayabilir.

İzleyici sayısına göre ağırlıklı ortalama hesaplamak için ölçüm tanımlarının uyumlu olması ve her yayın için uygun izleyici sayısı verisinin bulunması gerekir. Case'in zorunlu kapsamını basit tutmak için prototipte basit aritmetik ortalama kullanılacaktır. Bu varsayım teslim notunda açıkça belirtilecektir.

## 5. Yayın Süresi ve İzleyici Sayısı

`durationMinutes` ve `uniqueViewers` alanları bağlam sağlayabilir ancak case'in zorunlu metrikleri değildir.

Dakika bazında eşzamanlı izleyici sayısı (`viewerSnapshots`) bu prototipe dahil edilmeyecektir. Böyle bir veri, izleyicilerin yayında ne kadar kaldığını tek başına göstermez; yalnızca belirli zamanlardaki eşzamanlı izleyici sayısını gösterir.

## 6. Haftalık Analiz Katmanı

Gerçek bir üründe backend, ham yayın kayıtlarından haftalık metrikleri hesaplayıp dashboard'a özet bir analiz yanıtı döndürebilir.

Bu prototipte gerçek API/backend olmayacaktır. Bunun yerine TypeScript fonksiyonu:

1. Mock yayın kayıtlarını alır.
2. Kayıtları `scheduledAt` tarihine göre haftalara ayırır.
3. Planlanan ve gerçekleşen yayın sayılarını hesaplar.
4. Geçerli yayın ölçümlerinden haftalık ortalama izlenme süresini hesaplar.
5. Yayın kayıtlarındaki `publishedClips` değerlerini toplar; her klip, bağlı olduğu yayının `scheduledAt` tarihine göre haftaya atanır.
6. Hesaplanmış haftalık özetleri API yanıtına benzer bir nesne olarak döndürür.

Dashboard bu özet nesnesini kullanır; ham yayın kayıtlarını doğrudan sunum katmanında yeniden hesaplamaz.

### Kısmi Eksik Klip Sayıları

Haftalık `publishedClips` toplamı hesaplanırken:

- İlgili tüm yayınların klip sayısı biliniyorsa değerler toplanır.
- Yayınlardan herhangi birinde `publishedClips: null` varsa haftalık toplam `null` olur. Çünkü toplam klip sayısı kesin olarak belirlenemez.
- `null` değerler sıfır kabul edilmez ve toplam hesaplanırken göz ardı edilmez.
- İlgili haftada hiçbir yayın kaydı yoksa haftalık toplam `null` olur.
- Tüm değerler biliniyor ve toplamları sıfırsa haftalık toplam `0` olur.

**Örnek:**

| Yayın | `publishedClips` |
|---|---:|
| 1. yayın | 2 |
| 2. yayın | `null` |
| 3. yayın | 3 |

Bu durumda haftalık `publishedClips` toplamı `null` olur. Bilinen değerlerin toplamı olan `5`, haftanın gerçek toplamını göstermeyebilir.

## 7. Kararların Özeti

- Her planlanan yayın için bir kayıt tutulur.
- `scheduledAt`, haftalık gruplama için kullanılır.
- Kısa klipler, fiili yayımlanma tarihine göre değil, ilişkilendirildikleri yayının haftasına göre sayılır; klip yayımlanma tarihi ayrı tutulmaz.
- Gerçekleşme durumu `status` ile belirtilir.
- `null`, eksik ölçümü ifade eder; sıfır yerine kullanılmaz.
- Ortalama izlenme süresi yayın bazında temsili, önceden ölçülmüş veri olarak tutulur.
- Haftalık ortalama, geçerli yayın ölçümlerinin basit aritmetik ortalamasıdır.
- Yayın süresi ve benzersiz izleyici sayısı ek bağlam alanlarıdır.
- Dakika bazında izleyici anlık görüntüleri bu case'in kapsamına dahil değildir.
- Haftalık özetler ham kayıtlardan hesaplanır; JSON içinde ayrıca saklanmaz.
