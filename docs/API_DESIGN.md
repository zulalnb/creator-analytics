# Creator Analytics — API Design Notes

## 1. Projenin Veri İhtiyacı

Öncelikle sistemin hangi sorulara cevap vermesi gerektiğini belirleyelim.

Operasyon ekibi şunları öğrenmek istiyor:

1. İçerik üreticisi kaç yayın yapmayı planladı?
2. Kaç yayın gerçekleştirdi?
3. İzleyiciler yayınları ortalama ne kadar süre izledi?
4. Kaç kısa kesit yayımlandı?
5. Bu metrikler iki hafta arasında nasıl değişti?
6. İçerik üreticisi için hangi değerlendirme ve aksiyon öneriliyor?

**Tasarım kararı:** Veri modelimiz bu soruları cevaplayabilecek bilgileri içermeli, ancak gereksiz ayrıntılarla büyümemeli.

---

## 2. Ham Veri mi, Hesaplanmış Veri mi?

API tasarımında önemli bir ayrım var.

### Ham Veri (Raw Data)

- Planlanan yayınlar
- Gerçekleşen yayınlar
- Ortalama izlenme süreleri
- Yayımlanan kısa kesitler

### Türetilmiş Veri (Derived Data)

- Yayın tamamlama oranı
- İki hafta arasındaki değişim
- Performans değerlendirmesi
- Önerilen aksiyon

Tamamlama oranını ham veri olarak saklamamıza gerek yok. Gerçekleşen ve planlanan yayın sayısından hesaplayabiliriz.

**Tasarım kararı:** Ham verileri saklayacağız, hesaplanmış metrikleri TypeScript fonksiyonlarıyla üreteceğiz. Böylece kaynak veriler değiştiğinde sonuçları yeniden hesaplayabiliriz.

---

## 3. Veri Modelini Nasıl Kuracağız?

İki farklı yaklaşımı değerlendirelim.

### Seçenek A — Haftalık Özet

```json
{
  "creatorId": "creator-001",
  "week": 1,
  "plannedStreams": 4,
  "completedStreams": 3,
  "averageWatchDurationMinutes": 18.5,
  "publishedClips": 5
}
```

**Avantajları:**

- Basit.
- İstenen bütün metrikleri içeriyor.
- İki haftayı karşılaştırmak kolay.

**Dezavantajları:**

- Tek tek yayınların tarihlerini ve sonuçlarını göremiyoruz.
- Gerçekleşmeyen yayınların hangi tarihte planlandığını inceleyemiyoruz.

### Seçenek B — Yayın Bazında Veri

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

**Avantajları:**

- Her yayının tarihi ve durumu ayrı tutulur.
- Haftalık metrikler bu kayıtlardan hesaplanabilir.
- İleride günlük veya yayın bazında analiz yapılabilir.

**Dezavantajları:**

- Planlanan ama gerçekleşmeyen yayınları temsil etmek için de kayıt oluşturmak gerekir.
- Veri modellemesi ve hesaplama biraz daha karmaşıktır.

### Tasarım Kararı

Yayın bazında veri modelini tercih edeceğiz.

Çünkü şirket yalnızca sonuçları göstermemizi değil, yayın düzenini analiz etmemizi de istiyor. Ayrıca planlanan ama gerçekleşmeyen yayınların hangi tarihlerde olduğunu bilmek, önerilerimizi daha somut hâle getirebilir.

Bununla birlikte, iki haftalık özetleri ayrıca JSON'a yazmayacağız. Onları ham kayıtlardan hesaplayacağız.

---

## 4. Eksik Veriyi Nasıl Temsil Edeceğiz?

Bu, özellikle dikkat çekilen bir gereksinim.

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

Burada:

- `null`: İzlenme süresi ölçülmedi veya mevcut değil.
- `0`: Ölçülen gerçek değer sıfır.
- `missed`: Planlanan yayın gerçekleşmedi.

**Tasarım kararı:** Eksik değerleri sıfırla değiştirmeyeceğiz. Bir ölçümün eksik olmasıyla ölçüm sonucunun sıfır olması farklı anlamlara gelir.

Ayrıca `missed` durumundaki bir yayının izlenme süresi ortalamaya katılmayacak.

---

## 5. Mimari Karar: Haftalık Analiz Endpoint'i

### Karar

Dashboard, yayın kayıtlarının tamamını doğrudan tüketmek yerine haftalık analiz endpoint'inden hesaplanmış özetleri alıyormuş gibi tasarlanacak.

### Gerçek Projedeki Yaklaşım

- Backend, yayın kayıtlarını ve ilgili planlama verilerini değerlendirir.
- Haftalık metrikleri ve iki hafta arasındaki değişimleri hesaplar.
- Dashboard'un ihtiyaç duyduğu özet verileri API yanıtında döndürür.
- Frontend, hesaplama mantığını yeniden uygulamak yerine gelen sonuçları görüntüler.

### Bu Case'deki Uygulama

- Gerçek backend ve API geliştirmeyeceğiz.
- Haftalık analiz endpoint'inin döndüreceği veri yapısını temsil eden bir TypeScript fonksiyonu oluşturacağız.
- Bu fonksiyon mock JSON verisini işleyecek ve API yanıtına benzer bir nesne döndürecek.
- Dashboard yalnızca bu nesneyi tüketecek.

**Önemli ayrım:** Bu, gerçek bir API entegrasyonu değil; ileride backend ile değiştirilebilecek bir prototip katmanı olacak.
