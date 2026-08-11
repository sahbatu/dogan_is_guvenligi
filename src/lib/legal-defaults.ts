import { company } from '@/data/placeholder'
import type { LegalPage } from '@/types/cms'

export const LEGAL_SLUGS = {
  kvkk: 'kvkk',
  cookie: 'cerez-politikasi',
  returns: 'iade-politikasi',
} as const

export const LEGAL_PATHS = {
  kvkk: '/kvkk',
  cookie: '/cerez-politikasi',
  returns: '/iade-politikasi',
} as const

export interface LegalContact {
  name: string
  email: string
  address: string
}

function kvkkTemplate(name: string, email: string, address: string): string {
  return `<h2>1. Veri Sorumlusu</h2>
<p>6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu sıfatıyla <strong>${name}</strong> (&quot;Şirket&quot;) olarak kişisel verilerinizin işlenmesine ilişkin sizi bilgilendirmek isteriz.</p>
<p><strong>Adres:</strong> ${address}</p>
<p><strong>E-posta:</strong> ${email}</p>

<h2>2. İşlenen Kişisel Veriler</h2>
<p>Web sitemiz ve iletişim kanallarımız aracılığıyla aşağıdaki kişisel verileriniz işlenebilmektedir:</p>
<ul>
<li>Kimlik ve iletişim bilgileri (ad soyad, e-posta, telefon)</li>
<li>Talep ve mesaj içeriği</li>
<li>Çerezler ve benzeri teknolojiler aracılığıyla elde edilen kullanım verileri</li>
<li>IP adresi, tarayıcı bilgisi, oturum kayıtları</li>
</ul>

<h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
<p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
<ul>
<li>İletişim taleplerinin alınması ve yanıtlanması</li>
<li>Ürün ve hizmetlerimize ilişkin bilgilendirme yapılması</li>
<li>Sözleşme süreçlerinin yürütülmesi</li>
<li>Yasal yükümlülüklerin yerine getirilmesi</li>
<li>Web sitesi güvenliğinin ve performansının sağlanması</li>
<li>İstatistiksel analiz ve pazarlama faaliyetlerinin yürütülmesi (açık rızanız veya meşru menfaat kapsamında)</li>
</ul>

<h2>4. Hukuki Sebepler</h2>
<p>Kişisel verileriniz KVKK&apos;nın 5. ve 6. maddelerinde belirtilen hukuki sebeplere dayanılarak işlenmektedir: açık rıza, sözleşmenin kurulması veya ifası, hukuki yükümlülük, bir hakkın tesisi/kullanılması/korunması ve meşru menfaat.</p>

<h2>5. Kişisel Verilerin Aktarılması</h2>
<p>Verileriniz; barındırma hizmeti sağlayıcıları, e-posta hizmetleri, analitik araçları (Google Analytics vb.) ve yasal zorunluluk halinde yetkili kamu kurumları ile paylaşılabilir. Yurt dışına aktarım söz konusu olduğunda KVKK&apos;nın 9. maddesine uygun önlemler alınır.</p>

<h2>6. Saklama Süresi</h2>
<p>Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen zamanaşımı süreleri kadar saklanır; sürenin sona ermesi halinde silinir, yok edilir veya anonim hale getirilir.</p>

<h2>7. KVKK Kapsamındaki Haklarınız</h2>
<p>KVKK&apos;nın 11. maddesi uyarınca veri sorumlusuna başvurarak;</p>
<ul>
<li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
<li>İşlenmişse buna ilişkin bilgi talep etme,</li>
<li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme,</li>
<li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
<li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
<li>KVKK&apos;da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
<li>Düzeltme/silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
<li>Münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
<li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
</ul>
<p>haklarına sahipsiniz. Başvurularınızı yukarıdaki iletişim bilgileri üzerinden iletebilirsiniz.</p>

<h2>8. Güncellemeler</h2>
<p>İşbu aydınlatma metni güncellenebilir. Güncel metin her zaman web sitemizde yayımlanır.</p>
<p><em>Son güncelleme: ${new Date().toLocaleDateString('tr-TR')}</em></p>`
}

function cookieTemplate(name: string): string {
  return `<h2>1. Çerez Nedir?</h2>
<p>Çerezler, ziyaret ettiğiniz web siteleri tarafından tarayıcınıza kaydedilen küçük metin dosyalarıdır. Site deneyiminizi iyileştirmek, tercihlerinizi hatırlamak ve istatistiksel analiz yapmak için kullanılabilir.</p>

<h2>2. Kullandığımız Çerez Türleri</h2>
<h3>Zorunlu Çerezler</h3>
<p>Sitenin temel işlevleri için gereklidir. Oturum yönetimi, güvenlik ve çerez tercihlerinizin saklanması bu kapsamdadır. Bu çerezler olmadan site düzgün çalışmayabilir.</p>
<h3>Analitik / Performans Çerezleri</h3>
<p>Ziyaretçi sayısı, sayfa görüntüleme ve trafik kaynaklarını anlamamıza yardımcı olur. Google Analytics (GA4) veya Google Tag Manager kullanıldığında bu çerezler devreye girebilir. Yalnızca &quot;Tümünü kabul et&quot; seçeneği ile onay vermeniz halinde yüklenir.</p>
<h3>İşlevsel Çerezler</h3>
<p>Dil tercihi veya form bilgileri gibi seçimlerinizi hatırlamak için kullanılabilir.</p>

<h2>3. Çerez Tercihlerinizi Yönetme</h2>
<p>Siteye ilk girişinizde görünen çerez banner&apos;ı üzerinden tercihlerinizi belirleyebilirsiniz:</p>
<ul>
<li><strong>Tümünü kabul et:</strong> Zorunlu ve analitik çerezlerin kullanımına izin verir.</li>
<li><strong>Sadece gerekli:</strong> Yalnızca zorunlu çerezler kullanılır; analitik araçlar yüklenmez.</li>
</ul>
<p>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Bu durumda bazı site özellikleri kısıtlanabilir.</p>

<h2>4. Üçüncü Taraf Çerezleri</h2>
<p>Google Analytics ve Google Tag Manager gibi üçüncü taraf hizmetler kendi çerezlerini kullanabilir. Bu hizmetlerin gizlilik politikaları için ilgili sağlayıcıların web sitelerini inceleyebilirsiniz.</p>

<h2>5. İletişim</h2>
<p>Çerez politikamız hakkında sorularınız için <strong>${name}</strong> ile iletişime geçebilirsiniz. Kişisel verilerinizin işlenmesine ilişkin detaylar için <a href="/kvkk">KVKK Aydınlatma Metni</a>&apos;ni inceleyiniz.</p>
<p><em>Son güncelleme: ${new Date().toLocaleDateString('tr-TR')}</em></p>`
}

function returnPolicyTemplate({ name, email, address }: LegalContact): string {
  const updatedAt = new Date().toLocaleDateString('tr-TR')

  return `<p>Bu İade ve Cayma Politikası, <strong>${name}</strong> tarafından tüketicilere yapılan mesafeli mal satışları için uygulanır. Tüketici sıfatıyla yapılan satışlarda 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri saklıdır.</p>

<h2>1. 14 Günlük Cayma Hakkı</h2>
<p>Tüketici, ürünün kendisine veya belirlediği üçüncü kişiye teslim edildiği tarihten itibaren <strong>14 gün</strong> içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkını kullanabilir. Teslimden önce de cayma bildirimi yapılabilir.</p>
<p>Cayma hakkını kullanmak için bu süre içinde açık bir beyanı yazılı veya kalıcı veri saklayıcısı ile iletmeniz yeterlidir. E-posta ile bildirim için: <a href="mailto:${email}">${email}</a>.</p>

<h2>2. İade Süreci</h2>
<ol>
<li>Cayma talebinizi sipariş numarası, ürün adı ve iletişim bilgilerinizle birlikte e-posta yoluyla iletin.</li>
<li>Talebiniz alındıktan sonra iade gönderimi için gerekli yönlendirme tarafınıza iletilir.</li>
<li>Cayma bildiriminizi gönderdiğiniz tarihten itibaren en geç <strong>10 gün</strong> içinde ürünü, varsa tüm aksesuarları ve teslim edilen belgeleriyle birlikte gönderin.</li>
<li>Ürünü sadece niteliğini, özelliklerini ve çalışmasını belirlemek için gerekli olduğu ölçüde inceleyebilirsiniz. Bu kapsamı aşan kullanım nedeniyle meydana gelen değer kaybından sorumluluk doğabilir.</li>
</ol>

<h2>3. İade Kargo Ücreti</h2>
<p>İade için bildirilen anlaşmalı taşıyıcı kullanıldığında tüketiciden iade kargo bedeli talep edilmez. İade için taşıyıcı belirtilmemişse veya belirtilen taşıyıcının tüketicinin bulunduğu yerde şubesi yoksa, iade gönderiminin alınması ek masraf istenmeden sağlanır.</p>
<p>Ürünün ayıplı, hasarlı veya yanlış gönderilmiş olması hâlinde iade ile ilgili masraflar tüketiciye yüklenmez.</p>

<h2>4. Bedel İadesi</h2>
<p>Cayma bildiriminizin bize ulaşmasından itibaren en geç <strong>14 gün</strong> içinde, ürün bedeli ve varsa tüketiciden tahsil edilen standart teslimat bedeli, satın alırken kullandığınız ödeme aracına uygun şekilde ve ek masraf doğurmadan iade edilir. Mal satışlarında, ürünün geri ulaştığı veya gönderildiğini gösteren belgenin sunulduğu tarihten hangisi önceyse o tarihe kadar geri ödeme bekletilebilir.</p>
<p>Ek teslimat seçeneği nedeniyle doğan ilave teslimat farkları, mevzuatın izin verdiği ölçüde geri ödeme kapsamı dışındadır.</p>

<h2>5. Cayma Hakkının Kullanılamadığı Durumlar</h2>
<p>Mevzuatta öngörülen istisnalar saklı kalmak üzere aşağıdaki ürün veya hizmetlerde cayma hakkı kullanılamayabilir:</p>
<ul>
<li>Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda özel olarak hazırlanan ürünler,</li>
<li>Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler,</li>
<li>Tesliminden sonra ambalajı, bandı, mührü veya koruyucu unsuru açılmış; iadesi sağlık ve hijyen açısından uygun olmayan ürünler,</li>
<li>Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan ürünler,</li>
<li>Ambalajı açılmış ses veya görüntü kayıtları, kitap, dijital içerik ya da bilgisayar sarf malzemeleri,</li>
<li>Abonelik sözleşmesi kapsamı dışındaki süreli yayınlar,</li>
<li>Tüketicinin önceden açık onayıyla cayma süresi bitmeden ifasına başlanan hizmetler ile anında ifa edilen elektronik hizmetler veya anında teslim edilen gayrimaddi mallar.</li>
</ul>

<h2>6. Ayıplı veya Hasarlı Ürünler</h2>
<p>Teslim aldığınız üründe hasar, eksiklik veya siparişinizden farklılık varsa, ürünü kullanmadan mümkünse teslim anında kargo görevlisine tutanak tutturun ve durumu gecikmeden bize bildirin. Cayma hakkından bağımsız olarak ayıplı mal hâlinde kanundan doğan seçimlik haklarınız saklıdır.</p>

<h2>7. İletişim ve İade Adresi</h2>
<p><strong>Satıcı:</strong> ${name}<br />
<strong>E-posta:</strong> <a href="mailto:${email}">${email}</a><br />
<strong>Adres:</strong> ${address}</p>
<p>İade gönderimi yapmadan önce bizimle iletişime geçmeniz, doğru gönderim bilgisi ve süreç takibi için gereklidir.</p>

<h2>8. Uyuşmazlık Çözümü</h2>
<p>Tüketici işlemlerinden doğabilecek uyuşmazlıklarda, tüketicinin yerleşim yerindeki veya işlemin yapıldığı yerdeki tüketici hakem heyeti ya da tüketici mahkemesine başvuru yapılabilir. Parasal sınırlar, başvuru tarihinde yürürlükte bulunan mevzuata göre uygulanır.</p>

<p><em>Son güncelleme: ${updatedAt}</em></p>`
}

export function getDefaultLegalPages(contact: LegalContact = {
  name: company.name,
  email: company.email,
  address: `${company.address}, ${company.city}`,
}): LegalPage[] {
  const now = new Date().toISOString()

  return [
    {
      slug: LEGAL_SLUGS.kvkk,
      title: 'KVKK Aydınlatma Metni',
      content: kvkkTemplate(contact.name, contact.email, contact.address),
      updated_at: now,
    },
    {
      slug: LEGAL_SLUGS.cookie,
      title: 'Çerez Politikası',
      content: cookieTemplate(contact.name),
      updated_at: now,
    },
    {
      slug: LEGAL_SLUGS.returns,
      title: 'İade ve Cayma Politikası',
      content: returnPolicyTemplate(contact),
      updated_at: now,
    },
  ]
}

export function getDefaultLegalPage(slug: string, contact?: LegalContact): LegalPage | undefined {
  return getDefaultLegalPages(contact).find((p) => p.slug === slug)
}
