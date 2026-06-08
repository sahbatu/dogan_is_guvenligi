import { company } from '@/data/placeholder'
import type { LegalPage } from '@/types/cms'

export const LEGAL_SLUGS = {
  kvkk: 'kvkk',
  cookie: 'cerez-politikasi',
} as const

export const LEGAL_PATHS = {
  kvkk: '/kvkk',
  cookie: '/cerez-politikasi',
} as const

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

export function getDefaultLegalPages(): LegalPage[] {
  const now = new Date().toISOString()
  const address = `${company.address}, ${company.city}`

  return [
    {
      slug: LEGAL_SLUGS.kvkk,
      title: 'KVKK Aydınlatma Metni',
      content: kvkkTemplate(company.name, company.email, address),
      updated_at: now,
    },
    {
      slug: LEGAL_SLUGS.cookie,
      title: 'Çerez Politikası',
      content: cookieTemplate(company.name),
      updated_at: now,
    },
  ]
}

export function getDefaultLegalPage(slug: string): LegalPage | undefined {
  return getDefaultLegalPages().find((p) => p.slug === slug)
}
