import { Topping, Order } from './types';

export const INITIAL_TOPPINGS: Topping[] = [
  {
    id: '1',
    name: 'Kerupuk Orange',
    category: 'Kerupuk',
    price: 3000,
    stock: 45,
    maxStock: 100,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400',
    popular: true,
    description: 'Kerupuk rante oren renyah gurih khas seblak basah.'
  },
  {
    id: '2',
    name: 'Bakso Sapi Urat',
    category: 'Protein',
    price: 6000,
    stock: 32,
    maxStock: 60,
    image: 'https://images.unsplash.com/photo-1617470703128-26a0fc9af10f?auto=format&fit=crop&q=80&w=400',
    popular: true,
    description: 'Bakso sapi urat jumbo padat dan kaya rasa daging.'
  },
  {
    id: '3',
    name: 'Ceker Jebred',
    category: 'Protein',
    price: 5000,
    stock: 8, // Set low to trigger stock alerts!
    maxStock: 40,
    image: 'https://images.unsplash.com/photo-1527324688151-0e627063f2b1?auto=format&fit=crop&q=80&w=400',
    popular: true,
    description: 'Ceker ayam empuk dimasak bumbu cabai pedas berlimpah.'
  },
  {
    id: '4',
    name: 'Sosis Bratwurst',
    category: 'Premium',
    price: 7000,
    stock: 28,
    maxStock: 50,
    image: 'https://images.unsplash.com/photo-1532246420281-12595554adc1?auto=format&fit=crop&q=80&w=400',
    popular: false,
    description: 'Sosis premium bratwurst tebal, juicy, dan lezat.'
  },
  {
    id: '5',
    name: 'Makaroni Spiral',
    category: 'Kerupuk',
    price: 3000,
    stock: 50,
    maxStock: 100,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=400',
    popular: false,
    description: 'Makaroni spiral gurih empuk penyerap kuah seblak.'
  },
  {
    id: '6',
    name: 'Dumpling Keju',
    category: 'Premium',
    price: 8000,
    stock: 4, // Low stock to trigger alert!
    maxStock: 40,
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&q=80&w=400',
    popular: true,
    description: 'Dumpling kenyal dengan isian keju lumer melimpah.'
  },
  {
    id: '7',
    name: 'Mie Kuning',
    category: 'Protein',
    price: 4000,
    stock: 40,
    maxStock: 80,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400',
    popular: false,
    description: 'Mie kuning kriting kenyal porsi mantap.'
  },
  {
    id: '8',
    name: 'Pakcoy Segar',
    category: 'Sayuran',
    price: 3000,
    stock: 3, // Low stock to trigger alert!
    maxStock: 50,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
    popular: false,
    description: 'Sayur pakcoy segar renyah bernutrisi.'
  },
  {
    id: '9',
    name: 'Jamur Kuping',
    category: 'Sayuran',
    price: 4000,
    stock: 18,
    maxStock: 40,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400',
    popular: false,
    description: 'Jamur kuping hitam bertekstur renyah lembut.'
  },
  {
    id: '10',
    name: 'Cuanki Lidah',
    category: 'Premium',
    price: 5000,
    stock: 35,
    maxStock: 80,
    image: 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?auto=format&fit=crop&q=80&w=400',
    popular: true,
    description: 'Cuanki lidah gurih renyah menyerap kuah gurih.'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'SH-7892',
    customerName: 'Ahmad Syarif',
    customerPhone: '081234567890',
    serviceType: 'dine_in',
    spiceLevel: 3,
    soupType: 'Kuah Pedas Daun Jeruk',
    items: [
      { toppingId: '1', name: 'Kerupuk Orange', quantity: 2, price: 3000 },
      { toppingId: '2', name: 'Bakso Sapi Urat', quantity: 1, price: 6000 },
      { toppingId: '3', name: 'Ceker Jebred', quantity: 2, price: 5000 },
      { toppingId: '5', name: 'Makaroni Spiral', quantity: 1, price: 3000 }
    ],
    subtotal: 25000,
    tax: 2500,
    serviceFee: 2000,
    totalAmount: 29500,
    status: 'ready',
    date: 'Hari ini, 12:34',
    notes: 'Kencur agak banyak ya teh!',
    paymentMethod: 'qris'
  },
  {
    id: 'SH-7891',
    customerName: 'Siti Rahma',
    customerPhone: '085712345678',
    serviceType: 'takeaway',
    spiceLevel: 5,
    soupType: 'Kuah Original Hauche',
    items: [
      { toppingId: '2', name: 'Bakso Sapi Urat', quantity: 2, price: 6000 },
      { toppingId: '6', name: 'Dumpling Keju', quantity: 3, price: 8000 },
      { toppingId: '4', name: 'Sosis Bratwurst', quantity: 1, price: 7000 }
    ],
    subtotal: 43000,
    tax: 4300,
    serviceFee: 2000,
    totalAmount: 49300,
    status: 'preparing',
    date: 'Hari ini, 12:45',
    notes: 'Kuah dipisah, sendok ga usah.',
    paymentMethod: 'qris'
  },
  {
    id: 'SH-7890',
    customerName: 'Budi Santoso',
    customerPhone: '082198765432',
    serviceType: 'dine_in',
    spiceLevel: 1,
    soupType: 'Kuah Cikur',
    items: [
      { toppingId: '1', name: 'Kerupuk Orange', quantity: 1, price: 3000 },
      { toppingId: '7', name: 'Mie Kuning', quantity: 1, price: 4000 },
      { toppingId: '10', name: 'Cuanki Lidah', quantity: 2, price: 5000 }
    ],
    subtotal: 17000,
    tax: 1700,
    serviceFee: 2000,
    totalAmount: 20700,
    status: 'pending',
    date: 'Hari ini, 12:52',
    notes: 'Tidak terlalu asin.',
    paymentMethod: 'cashier'
  },
  {
    id: 'SH-7889',
    customerName: 'Dian Lestari',
    customerPhone: '081344556677',
    serviceType: 'dine_in',
    spiceLevel: 0,
    soupType: 'Kuah Original Hauche',
    items: [
      { toppingId: '5', name: 'Makaroni Spiral', quantity: 2, price: 3000 },
      { toppingId: '8', name: 'Pakcoy Segar', quantity: 2, price: 3000 },
      { toppingId: '9', name: 'Jamur Kuping', quantity: 1, price: 4000 }
    ],
    subtotal: 16000,
    tax: 1600,
    serviceFee: 2000,
    totalAmount: 19600,
    status: 'completed',
    date: 'Hari ini, 11:20',
    notes: 'Tidak pakai micin.',
    paymentMethod: 'qris'
  }
];
