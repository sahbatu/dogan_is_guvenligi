-- 014_categories_parent_id.sql
-- E-Katalog kategori dağınıklığını gidermek için: 11 ana kategori seed edilir,
-- mevcut 78 kategori parent_id ile bu ana kategorilere bağlanır.
-- Idempotent: birden fazla çalıştırılabilir.

BEGIN;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON public.categories (parent_id);

-- Basit döngü koruması: kategori kendisine parent olamaz
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_no_self_parent;
ALTER TABLE public.categories
  ADD CONSTRAINT categories_no_self_parent CHECK (parent_id IS NULL OR parent_id <> id);

-- Ana kategorileri seed et (idempotent — slug UNIQUE'e dayanır)
INSERT INTO public.categories (name, slug, sort_order)
VALUES
  ('Trafik & Yol Güvenliği',        'trafik-yol-guvenligi',      10),
  ('Hız Kesici & Kasis Sistemleri', 'hiz-kesici-kasis',          20),
  ('Bariyerler',                    'bariyerler',                30),
  ('Otopark & Çarpma Koruma',       'otopark-carpma-koruma',     40),
  ('Güvenlik Aynaları',             'guvenlik-aynalari-ana',     50),
  ('Zemin Güvenliği',               'zemin-guvenligi',           60),
  ('Temizlik Kimyasalları',         'temizlik-kimyasallari',     70),
  ('Kişisel Bakım & Hijyen',        'kisisel-bakim-hijyen',      80),
  ('Hijyen Aparatları',             'hijyen-aparatlari',         90),
  ('Çöp & Atık Poşetleri',          'cop-atik-posetleri',       100),
  ('Paspas & Perdeler',             'paspas-perdeler',          110)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      sort_order = EXCLUDED.sort_order;

-- Alt kategorileri parent'larına bağla
-- (mevcut kategorilerin isimleri değişmez; sadece parent_id set edilir)
WITH parents AS (
  SELECT id, slug FROM public.categories
  WHERE slug IN (
    'trafik-yol-guvenligi','hiz-kesici-kasis','bariyerler','otopark-carpma-koruma',
    'guvenlik-aynalari-ana','zemin-guvenligi','temizlik-kimyasallari','kisisel-bakim-hijyen',
    'hijyen-aparatlari','cop-atik-posetleri','paspas-perdeler'
  )
),
mapping (child_slug, parent_slug) AS (
  VALUES
    -- 1) Trafik & Yol Güvenliği
    ('trafik-konileri',                            'trafik-yol-guvenligi'),
    ('trafik-konisi-aksesuarlari',                 'trafik-yol-guvenligi'),
    ('delinatorler',                               'trafik-yol-guvenligi'),
    ('delinator-aksesuarlari',                     'trafik-yol-guvenligi'),
    ('uyari-dikmeleri',                            'trafik-yol-guvenligi'),
    ('uyari-dikmesi-aksesuarlari',                 'trafik-yol-guvenligi'),
    ('yol-kenar-dikmeleri',                        'trafik-yol-guvenligi'),
    ('flasorler',                                  'trafik-yol-guvenligi'),
    ('solar-flasorler',                            'trafik-yol-guvenligi'),
    ('solar-trafik-levhalari',                     'trafik-yol-guvenligi'),
    ('uyari-ve-yonlendirme-tabelalari',            'trafik-yol-guvenligi'),
    ('trafik-levhasi-direkleri',                   'trafik-yol-guvenligi'),
    ('reflektif-bantlar',                          'trafik-yol-guvenligi'),
    ('reflektif-folyolar',                         'trafik-yol-guvenligi'),
    ('yer-isaretleme-bantlari',                    'trafik-yol-guvenligi'),
    ('ikaz-seritleri',                             'trafik-yol-guvenligi'),
    ('reklam-ve-uyari-dubalari',                   'trafik-yol-guvenligi'),
    ('yol-butonlari-ve-serit-ayiricilar',          'trafik-yol-guvenligi'),
    ('refuj-baslari',                              'trafik-yol-guvenligi'),
    ('yapistiricilar-ve-bantlar',                  'trafik-yol-guvenligi'),
    ('montaj-aksesuarlari',                        'trafik-yol-guvenligi'),

    -- 2) Hız Kesici & Kasis Sistemleri
    ('hiz-kesiciler-ve-yol-kasisleri',             'hiz-kesici-kasis'),
    ('hiz-kesiciler-ve-yol-kasisi-aksesuarlari',   'hiz-kesici-kasis'),
    ('kapan-kasisler',                             'hiz-kesici-kasis'),
    ('kapan-kasis-aksesuarlari',                   'hiz-kesici-kasis'),

    -- 3) Bariyerler
    ('akordiyon-bariyerler',                       'bariyerler'),
    ('dikme-bariyerler',                           'bariyerler'),
    ('panel-bariyerler',                           'bariyerler'),
    ('serit-bariyerler',                           'bariyerler'),
    ('su-bariyerleri',                             'bariyerler'),
    ('otopark-koruma-bariyerleri',                 'bariyerler'),
    ('bariyer-zincirleri',                         'bariyerler'),

    -- 4) Otopark & Çarpma Koruma
    ('otopark-arac-stoperleri',                    'otopark-carpma-koruma'),
    ('kolon-ve-kose-koruyucular',                  'otopark-carpma-koruma'),
    ('kablo-koruyucular',                          'otopark-carpma-koruma'),

    -- 5) Güvenlik Aynaları
    ('guvenlik-aynalari',                          'guvenlik-aynalari-ana'),
    ('guvenlik-aynasi-aksesuarlari',               'guvenlik-aynalari-ana'),
    ('arac-alti-kontrol-aynalari',                 'guvenlik-aynalari-ana'),

    -- 6) Zemin Güvenliği
    ('kaydirmaz-bantlar',                          'zemin-guvenligi'),
    ('hissedilebilir-yurume-yuzeyleri',            'zemin-guvenligi'),

    -- 7) Temizlik Kimyasalları
    ('genel-yuzey-temizlik-urunleri',              'temizlik-kimyasallari'),
    ('bulasik-yikama-ve-yardimci-urunleri',        'temizlik-kimyasallari'),
    ('mutfak-yag-ve-kir-sokuculer',                'temizlik-kimyasallari'),
    ('mutfak-hijyen-urunleri',                     'temizlik-kimyasallari'),
    ('gida-hijyen-kimyasallari',                   'temizlik-kimyasallari'),
    ('tuvalet-banyo-temizlik-ve-hijyen-urunleri',  'temizlik-kimyasallari'),
    ('hali-ve-doseme-temizlik-urunleri',           'temizlik-kimyasallari'),
    ('cila-ve-cila-bakim-urunleri',                'temizlik-kimyasallari'),
    ('sivi-sistem-camasir-yikama-urunleri',        'temizlik-kimyasallari'),
    ('toz-camasir-yikama-urunleri',                'temizlik-kimyasallari'),
    ('konsantre-housekeeping-urunleri',            'temizlik-kimyasallari'),
    ('konsantre-mutfak-hijyen-sistem-urunleri',    'temizlik-kimyasallari'),
    ('dezenfektanlar-ve-antiseptikler',            'temizlik-kimyasallari'),
    ('universal-temizlik-urunleri',                'temizlik-kimyasallari'),
    ('endustriyel-cozuculer',                      'temizlik-kimyasallari'),
    ('kahve-makinasi-temizlik-ve-bakim-urunleri',  'temizlik-kimyasallari'),
    ('havuz-kimyasallari',                         'temizlik-kimyasallari'),
    ('metal-kimyasallari',                         'temizlik-kimyasallari'),

    -- 8) Kişisel Bakım & Hijyen
    ('kisisel-bakim-ve-hijyen-urunleri',           'kisisel-bakim-hijyen'),
    ('oda-parfumleri',                             'kisisel-bakim-hijyen'),
    ('lateks-eldivenler',                          'kisisel-bakim-hijyen'),
    ('nitril-eldivenler',                          'kisisel-bakim-hijyen'),

    -- 9) Hijyen Aparatları
    ('otomatik-havlu-dispenserleri-21-cm',         'hijyen-aparatlari'),
    ('prestij-otomatik-havlu-dispenserleri-21-cm', 'hijyen-aparatlari'),
    ('still-otomatik-havlu-dispenserleri-21-cm',   'hijyen-aparatlari'),
    ('still-autocut-havlu-dispenseri',             'hijyen-aparatlari'),
    ('standart-z-katli-kagit-havlu-dispenserleri', 'hijyen-aparatlari'),
    ('z-katli-kagit-havlu-dispenserleri',          'hijyen-aparatlari'),
    ('icten-cekme-kagit-havlu-dispenserleri',      'hijyen-aparatlari'),
    ('pratik-tuvalet-kagidi-dispenserleri',        'hijyen-aparatlari'),
    ('mini-pratik-tuvalet-kagidi-dispenserleri',   'hijyen-aparatlari'),
    ('sabunluk-ve-banyo-aparatlari',               'hijyen-aparatlari'),
    ('refil-sistem-aparatlari',                    'hijyen-aparatlari'),
    ('dozaj-pompasi-ve-seyreltme-aparatlari',      'hijyen-aparatlari'),

    -- 10) Çöp & Atık Poşetleri
    ('cop-posetleri',                              'cop-atik-posetleri'),
    ('tibbi-atik-posetleri',                       'cop-atik-posetleri'),

    -- 11) Paspas & Perdeler
    ('paspas',                                     'paspas-perdeler'),
    ('alan-perdeleri',                             'paspas-perdeler')
)
UPDATE public.categories AS c
   SET parent_id = p.id
  FROM mapping m
  JOIN parents p ON p.slug = m.parent_slug
 WHERE c.slug = m.child_slug
   AND (c.parent_id IS DISTINCT FROM p.id);

COMMIT;
