# Doğan İş Güvenliği — Kurumsal Web Sitesi

Temizlik malzemeleri ve iş güvenliği ekipmanları satan kurumsal şirket web sitesi. Vite + React + TypeScript + Supabase.

## Özellikler

- **Ana Sayfa** — Animasyonlu hero, hizmetler, istatistikler, öne çıkan ürünler
- **Hakkımızda** — Kurumsal bilgi, değerler, tarihçe
- **E-Katalog** — Kategori filtresi, arama, ürün detay (e-ticaret yok)
- **İletişim** — İletişim formu ve harita
- **Admin Panel** — `/admin/giris` — Ürün CRUD, görsel yükleme

## Kurulum

### 1. Bağımlılıkları yükleyin

```bash
npm install
```

### 2. Supabase projesi oluşturun

1. [supabase.com](https://supabase.com) üzerinde yeni proje oluşturun
2. SQL Editor'de `supabase/migrations/001_initial.sql` dosyasını çalıştırın
3. Authentication > Users bölümünden admin kullanıcı oluşturun

### 3. Ortam değişkenlerini ayarlayın

```bash
cp .env.example .env
```

`.env` dosyasına Supabase URL ve anon key değerlerini girin:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 4. Geliştirme sunucusunu başlatın

```bash
npm run dev
```

Site `http://localhost:5173` adresinde açılır.

## Admin Panel

- Giriş: `http://localhost:5173/admin/giris`
- Supabase kuruluysa: panelde oluşturduğunuz e-posta ve şifre ile giriş yapın
- Navbar'da admin linki görünmez (gizli panel)

## Supabase yapılandırılmadan

`.env` dosyası olmadan site demo modda çalışır — örnek ürünler gösterilir.

Admin paneli de demo modda açılır:

- **E-posta:** `admin@demo.com`
- **Şifre:** `demo123`

Bu modda paneli gezebilirsiniz; veritabanına kayıt işlemleri Supabase kurulunca aktif olur.

## Teknoloji

- Vite 6 + React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion
- React Router v7
- Supabase (Auth, PostgreSQL, Storage)
- Lucide React

## İçerik Düzenleme

Şirket bilgileri, hakkımızda metni ve iletişim bilgileri `src/data/placeholder.ts` dosyasında merkezi olarak tutulur.

## Build

```bash
npm run build
npm run preview
```
