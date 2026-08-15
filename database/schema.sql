-- ============================================================
-- DATABASE SCHEMA MYSQL UNTUK SEBLAK HAUCHE PRASMANAN
-- Server Version: MySQL 8.0+ / MariaDB 10.5+
-- Charset: utf8mb4_unicode_ci
-- ============================================================

CREATE DATABASE IF NOT EXISTS `seblak_hauche_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `seblak_hauche_db`;

-- ------------------------------------------------------------
-- 1. TABEL PENGATURAN TOKO / BRANDING (site_config)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `site_config`;
CREATE TABLE `site_config` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `site_name` VARCHAR(255) NOT NULL DEFAULT 'Seblak Hauche Prasmanan',
  `site_logo_text` VARCHAR(255) NOT NULL DEFAULT 'Seblak Hauche',
  `site_logo_emoji` VARCHAR(50) NOT NULL DEFAULT '🔥',
  `site_favicon` VARCHAR(50) NOT NULL DEFAULT '🔥',
  `site_logo_url` TEXT NULL,
  `site_favicon_url` TEXT NULL,
  `qris_image_url` TEXT NULL,
  `address` TEXT NOT NULL,
  `operational_hours` VARCHAR(255) NOT NULL DEFAULT 'Buka Setiap Hari: 10:00 - 21:00 WIB',
  `whatsapp_number` VARCHAR(50) NOT NULL DEFAULT '6281234567890',
  `footer_text` TEXT NOT NULL,
  `hero_title_prefix` VARCHAR(255) DEFAULT 'Prasmanan Seblak Terenak & Terlengkap',
  `hero_description` TEXT,
  `how_to_order_title` VARCHAR(255) DEFAULT 'Cara Pesan Seblak Prasmanan',
  `how_to_order_subtitle` TEXT,
  `step1_title` VARCHAR(255) DEFAULT 'Pilih Topping',
  `step1_desc` TEXT,
  `step2_title` VARCHAR(255) DEFAULT 'Pilih Varian Kuah',
  `step2_desc` TEXT,
  `step3_title` VARCHAR(255) DEFAULT 'Pilih Level Pedas',
  `step3_desc` TEXT,
  `step4_title` VARCHAR(255) DEFAULT 'Bayar & Nikmati',
  `step4_desc` TEXT,
  `spice_section_badge` VARCHAR(255) DEFAULT 'TINGKAT KEPEDASAN',
  `spice_section_title` VARCHAR(255) DEFAULT 'Sesuaikan Sensasi Pedas Favoritmu',
  `spice_section_desc` TEXT,
  `favorite_toppings_title` VARCHAR(255) DEFAULT 'Topping Pilihan Favorit',
  `favorite_toppings_desc` TEXT,
  `contact_badge` VARCHAR(255) DEFAULT 'LOKASI & KONTAK',
  `contact_title` VARCHAR(255) DEFAULT 'Kunjungi Kedai Kami',
  `contact_desc` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. TABEL ADMINISTRATOR & USER (admins)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `role` ENUM('administrator', 'kasir', 'dapur') NOT NULL DEFAULT 'administrator',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. TABEL VARIAN KUAH (soup_configs)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `soup_configs`;
CREATE TABLE `soup_configs` (
  `id` VARCHAR(50) NOT NULL,
  `type` VARCHAR(100) NOT NULL,
  `desc` TEXT NOT NULL,
  `icon` VARCHAR(100) NOT NULL DEFAULT 'ramen_dining',
  `badge` VARCHAR(100) DEFAULT 'Favorit',
  `color` VARCHAR(100) DEFAULT 'bg-red-500',
  `sort_order` INT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. TABEL LEVEL PEDAS (spice_configs)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `spice_configs`;
CREATE TABLE `spice_configs` (
  `level` INT NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `desc` TEXT NOT NULL,
  `emoji` VARCHAR(50) NOT NULL,
  `color` VARCHAR(100) NOT NULL,
  `text_color` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. TABEL INVENTARIS TOPPING (toppings)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `toppings`;
CREATE TABLE `toppings` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` ENUM('Semua', 'Kerupuk', 'Protein', 'Sayuran', 'Premium') NOT NULL DEFAULT 'Kerupuk',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `stock` INT NOT NULL DEFAULT 0,
  `max_stock` INT NOT NULL DEFAULT 100,
  `image` TEXT NOT NULL,
  `popular` TINYINT(1) NOT NULL DEFAULT 0,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_toppings_category` (`category`),
  INDEX `idx_toppings_stock` (`stock`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. TABEL PESANAN UTAMA (orders)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `service_type` ENUM('dine_in', 'takeaway') NOT NULL DEFAULT 'dine_in',
  `spice_level` INT NOT NULL DEFAULT 1,
  `soup_type` VARCHAR(50) NOT NULL DEFAULT 'kuah_kencur',
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `tax` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `service_fee` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending', 'preparing', 'ready', 'completed') NOT NULL DEFAULT 'pending',
  `payment_method` ENUM('qris', 'cashier') NOT NULL DEFAULT 'cashier',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_created_at` (`created_at`),
  INDEX `idx_orders_customer_phone` (`customer_phone`),
  CONSTRAINT `fk_orders_soup` FOREIGN KEY (`soup_type`) REFERENCES `soup_configs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. TABEL ITEM DETAIL PESANAN (order_items)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` VARCHAR(50) NOT NULL,
  `topping_id` VARCHAR(50) NULL,
  `topping_name` VARCHAR(150) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  INDEX `idx_order_items_order` (`order_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_topping` FOREIGN KEY (`topping_id`) REFERENCES `toppings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. TABEL LOG AKTIVITAS / AUDIT (audit_logs)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `action` VARCHAR(255) NOT NULL,
  `log_type` ENUM('info', 'success', 'error', 'header') NOT NULL DEFAULT 'info',
  `details` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA AWAL (INITIAL DATA SETUPS)
-- ============================================================

-- Data Branding Kedai
INSERT INTO `site_config` (
  `id`, `site_name`, `site_logo_text`, `site_logo_emoji`, `site_favicon`, 
  `address`, `operational_hours`, `whatsapp_number`, `footer_text`
) VALUES (
  1, 
  'Seblak Hauche Prasmanan', 
  'Seblak Hauche', 
  '🔥', 
  '🔥',
  'Jl. Diponegoro No. 45, Majenang, Cilacap, Jawa Tengah', 
  'Buka Setiap Hari: 10:00 - 21:00 WIB', 
  '6281234567890', 
  '© 2026 Seblak Hauche Prasmanan. Hak Cipta Dilindungi Undang-Undang.'
);

-- Data Admin Default (Gunakan Password Hash Bcrypt/Argon2 di Production)
INSERT INTO `admins` (`username`, `password_hash`, `name`, `role`) VALUES
('haucheprasmanan', '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQOEg6Rk3S9bFq49UqM2m', 'Administrator Utama', 'administrator');

-- Data Varian Kuah Default
INSERT INTO `soup_configs` (`id`, `type`, `desc`, `icon`, `badge`, `color`, `sort_order`) VALUES
('kuah_kencur', 'Kuah Original Kencur', 'Aroma rempah kencur segar dan gurih yang otentik dan menghangatkan.', 'ramen_dining', 'Paling Laris', 'bg-red-500', 1),
('kuah_jeletot', 'Kuah Jeletot Pedas Mampus', 'Kuah merah menyala penuh cabai rawit pilihan khusus pencinta pedas ekstrem.', 'local_fire_department', 'Pedas Mampus', 'bg-orange-600', 2),
('kuah_rendang', 'Kuah Rempah Rendang', 'Perpaduan bumbu rendang kaya rempah dengan kuah seblak kental gurih.', 'soup_kitchen', 'Chef Special', 'bg-amber-700', 3),
('seblak_becek', 'Seblak Becek Nyemek', 'Seblak dengan kuah sedikit (nyemek) bumbu meresap sempurna ke topping.', 'skillet', 'Favorit Warga', 'bg-red-700', 4);

-- Data Level Pedas Default
INSERT INTO `spice_configs` (`level`, `label`, `desc`, `emoji`, `color`, `text_color`) VALUES
(0, 'Tanpa Pedas (Level 0)', 'Cocok untuk anak-anak atau yang tidak kuat pedas.', '🙂', 'bg-slate-100 text-slate-700 border-slate-200', 'text-slate-600'),
(1, 'Hangat (Level 1)', 'Sensasi pedas tipis penambah nafsu makan.', '🌶️', 'bg-yellow-100 text-yellow-850 border-yellow-200', 'text-yellow-600'),
(2, 'Sedang (Level 2)', 'Pedas pas di lidah, makin gurih mantap.', '🌶️🌶️', 'bg-orange-100 text-orange-800 border-orange-200', 'text-orange-600'),
(3, 'Pedas (Level 3)', 'Sensasi pedas menggigit bikin keringatan!', '🔥', 'bg-red-100 text-red-800 border-red-200', 'text-red-600'),
(4, 'Sangat Pedas (Level 4)', 'Pedas nampol bikin nagih, tantangan sejati.', '🔥🔥', 'bg-rose-200 text-rose-900 border-rose-300', 'text-rose-700'),
(5, 'Jeletot Ekstrem (Level 5)', 'Level dewa! Cabai rawit melimpah tanpa ampun!', '💀🔥', 'bg-red-600 text-white border-red-700', 'text-red-600');

-- Data Topping Prasmanan Awal
INSERT INTO `toppings` (`id`, `name`, `category`, `price`, `stock`, `max_stock`, `image`, `popular`, `description`) VALUES
('top-1', 'Kerupuk Mawar Merah', 'Kerupuk', 1500.00, 45, 100, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80', 1, 'Kerupuk khas seblak yang kenyal dan meresap bumbu.'),
('top-2', 'Kerupuk Bawang Pelangi', 'Kerupuk', 1500.00, 30, 100, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=80', 0, 'Kerupuk warna-warni rasa gurih bawang.'),
('top-3', 'Makaroni Spiral', 'Kerupuk', 2000.00, 50, 100, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80', 1, 'Makaroni spiral impor yang lembut saat dimasak.'),
('top-4', 'Bakso Sapi Lengkap', 'Protein', 3000.00, 25, 80, 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500&auto=format&fit=crop&q=80', 1, 'Bakso daging sapi asli kenyal berdaging.'),
('top-5', 'Sosis Sapi Cocktail', 'Protein', 3000.00, 40, 80, 'https://images.unsplash.com/photo-1585325701165-351af916e581?w=500&auto=format&fit=crop&q=80', 1, 'Sosis lezat dipotong koin melimpah.'),
('top-6', 'Dumpling Keju Melt', 'Premium', 4000.00, 20, 50, 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&auto=format&fit=crop&q=80', 1, 'Dumpling dengan keju meleleh gurih di dalamnya.'),
('top-7', 'Chikuwa Seafood', 'Premium', 3500.00, 18, 50, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80', 0, 'Olahan ikan khas Jepang berbentuk tabung.'),
('top-8', 'Ceker Ayam Empuk', 'Protein', 3000.00, 15, 60, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80', 1, 'Ceker ayam diungkep empuk hingga lepas dari tulang.'),
('top-9', 'Sawi Hijau Segar', 'Sayuran', 1000.00, 35, 100, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80', 0, 'Sayur sawi hijau dipetik segar tiap hari.'),
('top-10', 'Jamur Enoki Crispy/Kuah', 'Sayuran', 3500.00, 12, 40, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80', 1, 'Jamur enoki renyah segar menyerap kuah sempurna.');

-- ============================================================
-- VIEW UNTUK ANALITIK DAN LAPORAN (PENJUALAN & OMSET)
-- ============================================================
CREATE OR REPLACE VIEW `v_sales_analytics` AS
SELECT 
  DATE(created_at) AS `order_date`,
  COUNT(id) AS `total_orders`,
  SUM(CASE WHEN service_type = 'dine_in' THEN 1 ELSE 0 END) AS `dine_in_count`,
  SUM(CASE WHEN service_type = 'takeaway' THEN 1 ELSE 0 END) AS `takeaway_count`,
  SUM(total_amount) AS `total_revenue`,
  AVG(total_amount) AS `average_order_value`
FROM `orders`
WHERE `status` = 'completed'
GROUP BY DATE(created_at)
ORDER BY `order_date` DESC;
