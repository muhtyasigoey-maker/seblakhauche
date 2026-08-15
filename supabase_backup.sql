-- =========================================================
-- BACKUP DATA SEBLAK HAUCHE UNTUK SUPABASE (POSTGRESQL)
-- =========================================================
-- Anda dapat langsung menyalin (copy) seluruh script ini dan
-- menjalankannya di 'SQL Editor' pada Dashboard Supabase Anda.
-- =========================================================

-- 1. TAHAP PEMBUATAN TABEL (SCHEMA DDL)

-- Table: toppings (Data Stok & Menu Topping Seblak)
CREATE TABLE IF NOT EXISTS public.toppings (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    max_stock INT NOT NULL DEFAULT 100,
    image TEXT,
    popular BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: orders (Data Transaksi Pesanan Seblak)
CREATE TABLE IF NOT EXISTS public.orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    service_type VARCHAR(50) NOT NULL, -- 'dine_in' / 'takeaway'
    spice_level INT NOT NULL DEFAULT 0,
    soup_type VARCHAR(255) NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Detail item topping (nama, qty, harga)
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
    service_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'completed', 'cancelled'
    date VARCHAR(100),
    notes TEXT,
    payment_method VARCHAR(50) DEFAULT 'qris', -- 'qris' / 'cashier'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: site_config (Pengaturan Toko & Informasi Kedai)
CREATE TABLE IF NOT EXISTS public.site_config (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'site_config',
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =========================================================
-- 2. TAHAP INSERT DATA (DATA BACKUP SEED)
-- =========================================================

-- Clean existing backup data before re-inserting
TRUNCATE TABLE public.toppings, public.orders, public.site_config;

-- A. DATA TOPPING (public.toppings)
INSERT INTO public.toppings (id, name, category, price, stock, max_stock, image, popular, description) VALUES
('1', 'Kerupuk Orange', 'Kerupuk', 3000, 45, 100, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400', true, 'Kerupuk rante oren renyah gurih khas seblak basah.'),
('2', 'Bakso Sapi Urat', 'Protein', 6000, 32, 60, 'https://images.unsplash.com/photo-1617470703128-26a0fc9af10f?auto=format&fit=crop&q=80&w=400', true, 'Bakso sapi urat jumbo padat dan kaya rasa daging.'),
('3', 'Ceker Jebred', 'Protein', 5000, 8, 40, 'https://images.unsplash.com/photo-1527324688151-0e627063f2b1?auto=format&fit=crop&q=80&w=400', true, 'Ceker ayam empuk dimasak bumbu cabai pedas berlimpah.'),
('4', 'Sosis Bratwurst', 'Premium', 7000, 28, 50, 'https://images.unsplash.com/photo-1532246420281-12595554adc1?auto=format&fit=crop&q=80&w=400', false, 'Sosis premium bratwurst tebal, juicy, dan lezat.'),
('5', 'Makaroni Spiral', 'Kerupuk', 3000, 50, 100, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=400', false, 'Makaroni spiral gurih empuk penyerap kuah seblak.'),
('6', 'Dumpling Keju', 'Premium', 8000, 4, 40, 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&q=80&w=400', true, 'Dumpling kenyal dengan isian keju lumer melimpah.'),
('7', 'Mie Kuning', 'Protein', 4000, 40, 80, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400', false, 'Mie kuning kriting kenyal porsi mantap.'),
('8', 'Pakcoy Segar', 'Sayuran', 3000, 3, 50, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400', false, 'Sayur pakcoy segar renyah bernutrisi.'),
('9', 'Jamur Kuping', 'Sayuran', 4000, 18, 40, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400', false, 'Jamur kuping hitam bertekstur renyah lembut.'),
('10', 'Cuanki Lidah', 'Premium', 5000, 35, 80, 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?auto=format&fit=crop&q=80&w=400', true, 'Cuanki lidah gurih renyah menyerap kuah gurih.');


-- B. DATA TRANSAKSI (public.orders)
INSERT INTO public.orders (id, customer_name, customer_phone, service_type, spice_level, soup_type, items, subtotal, tax, service_fee, total_amount, status, date, notes, payment_method) VALUES
('SH-7892', 'Ahmad Syarif', '081234567890', 'dine_in', 3, 'Kuah Pedas Daun Jeruk', 
 '[{"price": 3000, "name": "Kerupuk Orange", "quantity": 2, "toppingId": "1"}, {"price": 6000, "name": "Bakso Sapi Urat", "quantity": 1, "toppingId": "2"}, {"price": 5000, "name": "Ceker Jebred", "quantity": 2, "toppingId": "3"}, {"price": 3000, "name": "Makaroni Spiral", "quantity": 1, "toppingId": "5"}]'::jsonb,
 25000, 2500, 2000, 29500, 'ready', 'Hari ini, 12:34', 'Kencur agak banyak ya teh!', 'qris'),

('SH-7891', 'Siti Rahma', '085712345678', 'takeaway', 5, 'Kuah Original Hauche', 
 '[{"price": 6000, "name": "Bakso Sapi Urat", "quantity": 2, "toppingId": "2"}, {"price": 8000, "name": "Dumpling Keju", "quantity": 3, "toppingId": "6"}, {"price": 7000, "name": "Sosis Bratwurst", "quantity": 1, "toppingId": "4"}]'::jsonb,
 43000, 4300, 2000, 49300, 'preparing', 'Hari ini, 12:45', 'Kuah dipisah, sendok ga usah.', 'qris'),

('SH-7890', 'Budi Santoso', '082198765432', 'dine_in', 1, 'Kuah Cikur', 
 '[{"price": 3000, "name": "Kerupuk Orange", "quantity": 1, "toppingId": "1"}, {"price": 4000, "name": "Mie Kuning", "quantity": 1, "toppingId": "7"}, {"price": 5000, "name": "Cuanki Lidah", "quantity": 2, "toppingId": "10"}]'::jsonb,
 17000, 1700, 2000, 20700, 'pending', 'Hari ini, 12:52', 'Tidak terlalu asin.', 'cashier'),

('SH-7889', 'Dian Lestari', '081344556677', 'dine_in', 0, 'Kuah Original Hauche', 
 '[{"price": 3000, "name": "Makaroni Spiral", "quantity": 2, "toppingId": "5"}, {"price": 3000, "name": "Pakcoy Segar", "quantity": 2, "toppingId": "8"}, {"price": 4000, "name": "Jamur Kuping", "quantity": 1, "toppingId": "9"}]'::jsonb,
 16000, 1600, 2000, 19600, 'completed', 'Hari ini, 11:20', 'Tidak pakai micin.', 'qris');


-- C. DATA CONFIG TOKO (public.site_config)
INSERT INTO public.site_config (id, config) VALUES
('site_config', '{
  "siteName": "Seblak Hauche",
  "siteLogoText": "Seblak Hauche",
  "siteLogoEmoji": "local_fire_department",
  "siteFavicon": "🌶️",
  "address": "MQHJ+3QJ, RT.02/RW.03, Bendasari, Padangsari, Kec. Majenang, Kabupaten Cilacap, Jawa Tengah 53257",
  "operationalHours": "Setiap Hari: 10:00 - 22:00 WIB",
  "whatsappNumber": "6281234567890",
  "footerText": "© 2026 Seblak Hauche Group. All rights reserved.",
  "heroTitlePrefix": "Seblak Prasmanan",
  "heroDescription": "Nikmati sensasi pedas gurih yang bisa kamu atur sendiri. Ambil mangkokmu, pilih isian favorit sepuasnya, dan tentukan level pedasmu sampai nangis bahagia!",
  "soups": [
    {"id": "soup-1", "type": "Kuah Pedas Daun Jeruk", "desc": "Kuah cabai berpadu kesegaran aroma daun jeruk purut purba.", "icon": "nature", "badge": "Bestseller", "color": "border-red-500 bg-red-50/70 text-red-700"},
    {"id": "soup-2", "type": "Kuah Original Hauche", "desc": "Kuah kaldu kencur gurih khas Bandung tempo dulu yang kental.", "icon": "emoji_food_beverage", "badge": "Classic", "color": "border-amber-500 bg-amber-50/70 text-amber-700"},
    {"id": "soup-3", "type": "Kuah Cikur", "desc": "Ekstra kencur segar melimpah, aroma harum menggugah selera.", "icon": "spa", "badge": "Fragrant", "color": "border-orange-500 bg-orange-50/70 text-orange-700"}
  ]
}'::jsonb);

-- Enable Row Level Security (RLS) - Permissive public access for Supabase
ALTER TABLE public.toppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for toppings" ON public.toppings FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update for toppings" ON public.toppings FOR ALL USING (true);

CREATE POLICY "Allow public read access for orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update for orders" ON public.orders FOR ALL USING (true);

CREATE POLICY "Allow public read access for site_config" ON public.site_config FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update for site_config" ON public.site_config FOR ALL USING (true);
