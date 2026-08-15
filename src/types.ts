export type ToppingCategory = 'Semua' | 'Kerupuk' | 'Protein' | 'Sayuran' | 'Premium';

export interface Topping {
  id: string;
  name: string;
  category: ToppingCategory;
  price: number;
  stock: number;
  maxStock: number;
  image: string;
  popular?: boolean;
  description: string;
}

export type SoupType = string;

export interface SoupConfig {
  id: string;
  type: string;
  desc: string;
  icon: string;
  badge: string;
  color: string;
}

export interface SpiceConfig {
  level: number;
  label: string;
  desc: string;
  emoji: string;
  color: string;
  text: string;
}

export interface SiteConfig {
  siteName: string;
  siteLogoText: string;
  siteLogoEmoji: string;
  siteFavicon: string;
  siteLogoUrl?: string;
  siteFaviconUrl?: string;
  qrisImageUrl?: string;
  address: string;
  operationalHours: string;
  whatsappNumber: string;
  footerText: string;
  soups: SoupConfig[];
  spices: SpiceConfig[];

  // Dynamic Landing Page Texts
  heroTitlePrefix?: string;
  heroDescription?: string;

  howToOrderTitle?: string;
  howToOrderSubtitle?: string;
  step1Title?: string;
  step1Desc?: string;
  step2Title?: string;
  step2Desc?: string;
  step3Title?: string;
  step3Desc?: string;
  step4Title?: string;
  step4Desc?: string;

  spiceSectionBadge?: string;
  spiceSectionTitle?: string;
  spiceSectionDesc?: string;

  favoriteToppingsTitle?: string;
  favoriteToppingsDesc?: string;

  contactBadge?: string;
  contactTitle?: string;
  contactDesc?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';

export interface OrderItem {
  toppingId: string;
  name: string;
  quantity: number;
  price: number;
}

export type PaymentMethod = 'qris' | 'cashier' | 'midtrans';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceType: 'dine_in' | 'takeaway';
  spiceLevel: number; // 0 to 5
  soupType: SoupType;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceFee: number;
  totalAmount: number;
  status: OrderStatus;
  date: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  midtransPaymentType?: string;
  midtransTransactionStatus?: string;
  snapToken?: string;
}

export interface AdminUser {
  email: string;
  role: string;
  name: string;
}
