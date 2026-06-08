import { images } from './images'

export const company = {
  name: 'Doğan İş Güvenliği',
  shortName: 'DOĞAN',
  slogan: 'Temizlik ve iş güvenliğinde güvenilir çözüm ortağınız',
  tagline: 'Profesyonel temizlik malzemeleri ve iş güvenliği ekipmanları',
  founded: 2017,
  email: 'info@doganisguvenligi.com',
  phone: '+90 (212) 555 00 00',
  phoneRaw: '+902125550000',
  address: 'Organize Sanayi Bölgesi, 4. Cadde No: 12',
  city: 'İstanbul, Türkiye',
  workingHours: 'Pazartesi – Cuma: 08:30 – 18:00',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.278489783!2d28.9784!3d41.0082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzI5LjUiTiAyOMKwNTgnNDIuMiJF!5e0!3m2!1str!2str!4v1700000000000',
}

export const stats = [
  { value: 100, suffix: '+', label: 'Ürün Çeşidi' },
  { value: 9, suffix: '+', label: 'Yıllık Deneyim' },
  { value: 1200, suffix: '+', label: 'Mutlu Müşteri' },
  { value: 48, suffix: ' Saat', label: 'Hızlı Tedarik' },
]

export const services = [
  {
    title: 'Temizlik Malzemeleri',
    description:
      'Endüstriyel ve profesyonel temizlik için geniş ürün yelpazesi. Deterjanlardan hijyen ekipmanlarına kadar her ihtiyaca uygun çözümler.',
    icon: 'Sparkles' as const,
  },
  {
    title: 'İş Güvenliği Ekipmanları',
    description:
      'OSGB standartlarına uygun kişisel koruyucu donanımlar, iş elbiseleri ve saha güvenlik ekipmanları.',
    icon: 'Shield' as const,
  },
  {
    title: 'Kurumsal Tedarik',
    description:
      'Fabrika, hastane, otel ve ofis projeleriniz için toplu tedarik, stok yönetimi ve periyodik sevkiyat hizmetleri.',
    icon: 'Building2' as const,
  },
  {
    title: 'Teknik Danışmanlık',
    description:
      'İş güvenliği mevzuatı ve temizlik standartları konusunda uzman ekibimizle yerinde danışmanlık desteği.',
    icon: 'Headphones' as const,
  },
]

export const aboutContent = {
  intro:
    'Doğan İş Güvenliği, 2017 yılından bu yana temizlik malzemeleri ve iş güvenliği ekipmanları alanında kurumsal müşterilere hizmet vermektedir. Güvenilir tedarik zinciri, kaliteli ürün portföyü ve müşteri odaklı yaklaşımımızla sektörün tercih edilen markalarından biri haline geldik.',
  mission:
    'İşletmelerin çalışan sağlığını korumak ve hijyen standartlarını yükseltmek için en uygun, en güvenilir ve en sürdürülebilir çözümleri sunmak temel misyonumuzdur.',
  vision:
    'Türkiye genelinde iş güvenliği ve temizlik tedarikinde referans gösterilen, dijital dönüşümü tamamlamış lider bir kurumsal tedarikçi olmak.',
  values: [
    { title: 'Güvenilirlik', description: 'Söz verdiğimiz zamanda, söz verdiğimiz kalitede teslimat.' },
    { title: 'Kalite', description: 'Uluslararası standartlara uygun, sertifikalı ürün portföyü.' },
    { title: 'Sürdürülebilirlik', description: 'Çevreye duyarlı ürünler ve sorumlu tedarik zinciri.' },
    { title: 'İnovasyon', description: 'Sektördeki yenilikleri takip eden dinamik ürün gamı.' },
  ],
  timeline: [
    { year: '2017', title: 'Kuruluş', description: 'İstanbul merkezli olarak faaliyete başladık.' },
    { year: '2019', title: 'Genişleme', description: 'İş güvenliği ekipmanları portföyünü ekledik.' },
    { year: '2023', title: 'Kurumsal Büyüme', description: '100+ ürün çeşidine ulaştık.' },
    { year: '2026', title: 'Dijital Dönüşüm', description: 'Kurumsal web sitesi ve e-katalog platformunu hayata geçirdik.' },
  ],
}

export const navLinks = [
  { label: 'Ana Sayfa', href: '/' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'E-Katalog', href: '/e-katalog' },
  { label: 'Blog', href: '/blog' },
  { label: 'İletişim', href: '/iletisim' },
]

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string[]
  image: string
  category: string
  publishedAt: string
  readTime: number
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'is-guvenligi-ekipmanlarinda-dogru-secim',
    title: 'İş Güvenliği Ekipmanlarında Doğru Seçim Nasıl Yapılır?',
    excerpt:
      'Saha koşullarına uygun KKD seçimi, hem yasal uyumluluk hem de çalışan güvenliği için kritik öneme sahiptir.',
    category: 'İş Güvenliği',
    publishedAt: '2025-11-12',
    readTime: 5,
    image: images.hero.ppe,
    content: [
      'İş güvenliği ekipmanları seçilirken öncelikle çalışma ortamının risk analizi yapılmalıdır. Açık saha, kapalı alan veya üretim hattı gibi farklı ortamlar farklı koruma gereksinimleri doğurur.',
      'Baret, eldiven, iş ayakkabısı ve yüksek görünürlük yeleği gibi temel ekipmanların CE ve ilgili EN standartlarına uygun olması zorunludur. Sertifikasız ürünler kısa vadede maliyet avantajı sunsa da uzun vadede ciddi risk taşır.',
      'Kurumsal tedarik süreçlerinde tek tip değil, departman bazlı ihtiyaç analizi yapılması önerilir. Depo personeli ile saha ekibinin gereksinimleri farklılaşır; bu nedenle ürün gamının esnek olması önemlidir.',
      'Doğan İş Güvenliği olarak müşterilerimize standart uyumluluk, stok sürekliliği ve teknik danışmanlık ile destek sunuyoruz. Ekipman seçiminde yardıma ihtiyaç duyarsanız ekibimizle iletişime geçebilirsiniz.',
    ],
  },
  {
    slug: 'endustriyel-temizlikte-verimlilik',
    title: 'Endüstriyel Temizlikte Verimliliği Artıran 4 Adım',
    excerpt:
      'Doğru ürün, doğru dozaj ve planlı uygulama ile temizlik maliyetlerini düşürürken hijyen standartlarını koruyabilirsiniz.',
    category: 'Temizlik',
    publishedAt: '2025-10-28',
    readTime: 4,
    image: images.services.cleaning,
    content: [
      'Endüstriyel tesislerde temizlik yalnızca görünür hijyen değil, üretim sürekliliği ve iş güvenliği ile de doğrudan ilişkilidir. Yağlı zeminler veya biriken toz, kaza riskini artırır.',
      'İlk adım, yüzey tipine uygun kimyasal seçimidir. Genel amaçlı deterjan her alanda yeterli sonuç vermez; yağ sökücü, dezenfektan ve zemin bakım ürünleri ayrı değerlendirilmelidir.',
      'İkinci adım doğru dozajdır. Konsantre ürünlerde aşırı kullanım hem maliyeti artırır hem yüzeyde kalıntı bırakır. Üretici talimatlarına uyum kritiktir.',
      'Üçüncü adım ekipman standardizasyonudur. Mikrofiber mop, uygun aparat ve renk kodlu bez sistemleri çapraz kontaminasyonu azaltır. Son olarak periyodik denetim ile süreç sürdürülebilir hale getirilir.',
    ],
  },
  {
    slug: 'hastane-hijyeninde-tedarik-standartlari',
    title: 'Hastane Hijyeninde Tedarik Standartları',
    excerpt:
      'Sağlık kuruluşlarında kullanılan temizlik ve dezenfeksiyon ürünlerinde dikkat edilmesi gereken temel kriterler.',
    category: 'Sağlık',
    publishedAt: '2025-09-15',
    readTime: 6,
    image: images.products.disinfectant,
    content: [
      'Hastane ve klinik ortamlarında hijyen ürünleri seçimi, hasta ve personel güvenliği açısından sıradan ticari ürünlerden farklı kriterlere tabidir.',
      'Dezenfektanların etkinlik spektrumu ve temas süresi ürün etiketinde açıkça belirtilmelidir. Yüksek riskli alanlarda (ameliyathane, yoğun bakım) kullanılan ürünlerin log kayıtları tutulmalıdır.',
      'Temizlik personelinin eğitimi, ürün tedariki kadar önemlidir. Yanlış seyreltme veya uyumsuz kimyasal karışımı hem etkinliği düşürür hem yüzeye zarar verebilir.',
      'Kurumsal tedarikçi seçerken ürün çeşitliliği, hızlı sevkiyat ve lot takibi sunan firmalarla çalışmak operasyonel süreklilik sağlar.',
    ],
  },
  {
    slug: 'depo-ve-lojistikte-is-guvenligi',
    title: 'Depo ve Lojistik Merkezlerinde İş Güvenliği',
    excerpt:
      'Forklift trafiği, yüksek raflar ve kaygan zeminler — depo ortamlarında en sık karşılaşılan riskler ve önlemler.',
    category: 'Lojistik',
    publishedAt: '2025-08-02',
    readTime: 5,
    image: images.cta,
    content: [
      'Depo ve lojistik tesisleri, yoğun hareketlilik nedeniyle iş kazalarının sık görüldüğü alanlardır. Zemin kayması, düşme ve ezilme riskleri öncelikli değerlendirilmelidir.',
      'Kaymaz tabanlı iş ayakkabısı, reflektörlü yelek ve koruyucu eldiven temel KKD setinin parçasıdır. Ayrıca yük kaldırma eğitimi ve ergonomik ekipman kullanımı önemlidir.',
      'Zemin temizliği depo güvenliğinin ayrılmaz parçasıdır. Yağ ve toz birikimi forklift fren mesafesini uzatır. Endüstriyel zemin temizleyiciler düzenli programla uygulanmalıdır.',
      'Periyodik risk değerlendirmesi sonrası eksik ekipmanlar tamamlanmalı, acil durum yolları işaretlenmeli ve personel bilgilendirilmelidir.',
    ],
  },
]

export const defaultCategories = [
  { name: 'Temizlik Malzemeleri', slug: 'temizlik-malzemeleri' },
  { name: 'İş Güvenliği Ekipmanları', slug: 'is-guvenligi-ekipmanlari' },
]

export const industries = [
  {
    title: 'Üretim & Fabrika',
    description:
      'Fabrika ve üretim tesislerinde endüstriyel temizlik, yağ sökücü ürünler ve saha güvenliği ekipmanları.',
  },
  {
    title: 'Sağlık & Hastane',
    description:
      'Hastane, klinik ve poliklinikler için hijyen standartlarına uygun dezenfektan ve temizlik tedariki.',
  },
  {
    title: 'Okul & Eğitim',
    description:
      'Okul, üniversite ve eğitim kurumlarında güvenli temizlik malzemeleri ve koruyucu ekipmanlar.',
  },
  {
    title: 'Otel & Konaklama',
    description:
      'Otel ve konaklama tesislerinde oda, mutfak ve ortak alanlar için profesyonel temizlik çözümleri.',
  },
  {
    title: 'İnşaat & Saha',
    description:
      'Şantiye ve açık saha çalışmalarında baret, yelek, eldiven ve yüksek görünürlük ekipmanları.',
  },
  {
    title: 'Ofis & Ticari',
    description:
      'Ofis, plaza ve ticari alanlarda günlük hijyen, zemin bakımı ve temizlik malzemesi tedariki.',
  },
  {
    title: 'Lojistik & Depo',
    description:
      'Depo ve lojistik merkezlerinde zemin temizliği, depo güvenliği ve personel koruma ürünleri.',
  },
]

export const whyUsPoints = [
  'Geniş stok ve hızlı sevkiyat altyapısı',
  'CE / TSE uyumlu, sertifikalı ürün gamı',
  'Kurumsal müşterilere özel fiyatlandırma',
  'Teknik danışmanlık ve yerinde destek',
]

export const demoProducts = [
  {
    name: 'Endüstriyel Yüzey Temizleyici 5L',
    slug: 'endustriyel-yuzey-temizleyici-5l',
    description:
      'Ağır kir ve yağ lekelerine karşı etkili, konsantre formül. Fabrika ve depo zeminleri için ideal.',
    categorySlug: 'temizlik-malzemeleri',
    image_url: images.products.surfaceCleaner,
    price: 289.9,
  },
  {
    name: 'Profesyonel Cam Temizleme Seti',
    slug: 'profesyonel-cam-temizleme-seti',
    description: 'Cam, ayna ve vitrin yüzeyleri için iz bırakmayan profesyonel temizlik seti.',
    categorySlug: 'temizlik-malzemeleri',
    image_url: images.products.windowSet,
    price: 349,
  },
  {
    name: 'Antibakteriyel El Dezenfektanı 1L',
    slug: 'antibakteriyel-el-dezenfektani-1l',
    description: '%70 alkol bazlı, hızlı etkili el hijyeni ürünü. Kurumsal kullanıma uygun.',
    categorySlug: 'temizlik-malzemeleri',
    image_url: images.products.disinfectant,
    price: 129.5,
  },
  {
    name: 'Endüstriyel Zemin Paspası',
    slug: 'endustriyel-zemin-paspasi',
    description: 'Yoğun trafikli alanlar için dayanıklı mikrofiber zemin paspası.',
    categorySlug: 'temizlik-malzemeleri',
    image_url: images.products.floorMop,
    price: 199,
  },
  {
    name: 'CE Onaylı Baret',
    slug: 'ce-onayli-baret',
    description: 'EN 397 standardına uygun, darbe emici endüstriyel güvenlik bareti.',
    categorySlug: 'is-guvenligi-ekipmanlari',
    image_url: images.products.helmet,
    price: 185,
  },
  {
    name: 'İş Güvenliği Ayakkabısı S3',
    slug: 'is-guvenligi-ayakkabisi-s3',
    description: 'Çelik burunlu, kaymaz tabanlı, su geçirmez iş ayakkabısı. S3 koruma sınıfı.',
    categorySlug: 'is-guvenligi-ekipmanlari',
    image_url: images.products.safetyBoots,
    price: 1249,
  },
  {
    name: 'Reflektörlü Yüksek Görünürlük Yeleği',
    slug: 'reflektorlu-yuksek-gorunurluk-yelegi',
    description: 'Gece ve gündüz saha çalışmaları için EN ISO 20471 uyumlu yelek.',
    categorySlug: 'is-guvenligi-ekipmanlari',
    image_url: images.products.hiVisVest,
    price: 95,
  },
  {
    name: 'Koruyucu İş Eldiveni',
    slug: 'koruyucu-is-eldiveni',
    description: 'Kesilmeye ve aşınmaya karşı dayanıklı, ergonomik iş eldiveni.',
    categorySlug: 'is-guvenligi-ekipmanlari',
    image_url: images.products.workGloves,
    price: 78.5,
  },
]
