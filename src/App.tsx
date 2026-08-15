import React from 'react';
import { INITIAL_TOPPINGS, INITIAL_ORDERS } from './data';
import { Topping, Order, OrderStatus, SoupType, OrderItem, SiteConfig, PaymentMethod } from './types';
import { collection, onSnapshot, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

// Import child components
import HomeView from './components/HomeView';
import MenuView from './components/MenuView';
import CartView from './components/CartView';
import CheckoutView from './components/CheckoutView';
import AdminLoginView from './components/AdminLoginView';
import AdminDashboardView from './components/AdminDashboardView';
import TrackingView from './components/TrackingView';

type ViewState = 'home' | 'menu' | 'cart' | 'checkout' | 'admin_login' | 'admin_dashboard' | 'tracking';

const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: 'Seblak Hauche',
  siteLogoText: 'Seblak Hauche',
  siteLogoEmoji: 'local_fire_department',
  siteFavicon: '🌶️',
  siteLogoUrl: '',
  siteFaviconUrl: '',
  qrisImageUrl: '',
  address: 'MQHJ+3QJ, RT.02/RW.03, Bendasari, Padangsari, Kec. Majenang, Kabupaten Cilacap, Jawa Tengah 53257',
  operationalHours: 'Setiap Hari: 10:00 - 22:00 WIB',
  whatsappNumber: '6281234567890',
  footerText: '© 2026 Seblak Hauche Group. All rights reserved.',
  heroTitlePrefix: 'Seblak Prasmanan',
  heroDescription: 'Nikmati sensasi pedas gurih yang bisa kamu atur sendiri. Ambil mangkokmu, pilih isian favorit sepuasnya, dan tentukan level pedasmu sampai nangis bahagia!',
  howToOrderTitle: 'Gimana Cara Mainnya?',
  howToOrderSubtitle: 'Hanya 4 langkah mudah untuk meracik seblak impianmu yang super nikmat.',
  step1Title: 'Pilih Isian',
  step1Desc: 'Ambil mangkok & pilih bebas puluhan topping segar mulai dari kerupuk, ceker, sampai dumpling keju.',
  step2Title: 'Tentukan Level Pedas',
  step2Desc: 'Pilih tingkat kepedasan dari level 0 (tanpa cabai) hingga level 5 yang bikin kesurupan.',
  step3Title: 'Pilih Kuah Racikan',
  step3Desc: 'Pilih kuah spesial kami: Pedas Daun Jeruk, Kuah Original Hauche yang gurih, atau Cikur harum segar.',
  step4Title: 'Bayar & Nikmati',
  step4Desc: 'Konfirmasi pesananmu lewat E-Wallet QRIS atau bayar langsung di kasir. Santap selagi panas!',
  spiceSectionBadge: 'LEVEL SPICINESS PREVIEW',
  spiceSectionTitle: 'Berani Coba Level Nangis?',
  spiceSectionDesc: 'Cabai yang kami gunakan adalah cabai rawit merah segar pilihan, digiling langsung untuk menjaga aroma harum kencur dan kesegaran rasa pedas alami.',
  favoriteToppingsTitle: 'Topping Ter-Hauche Favorit',
  favoriteToppingsDesc: 'Isian seblak paling banyak dicari & dipesan pelanggan setia kami.',
  contactBadge: 'KUNJUNGI KAMI',
  contactTitle: 'Mampir Ke Kedai',
  contactDesc: 'Nikmati langsung kesegaran kuah kencur dan gurihnya bumbu seblak prasmanan kami yang hangat langsung dari wajan koki.',
  soups: [
    {
      id: 'soup-1',
      type: 'Kuah Pedas Daun Jeruk',
      desc: 'Kuah cabai berpadu kesegaran aroma daun jeruk purut purba.',
      icon: 'nature',
      badge: 'Bestseller',
      color: 'border-red-500 bg-red-50/70 text-red-700'
    },
    {
      id: 'soup-2',
      type: 'Kuah Original Hauche',
      desc: 'Kuah kaldu kencur gurih khas Bandung tempo dulu yang kental.',
      icon: 'emoji_food_beverage',
      badge: 'Classic',
      color: 'border-amber-500 bg-amber-50/70 text-amber-700'
    },
    {
      id: 'soup-3',
      type: 'Kuah Cikur',
      desc: 'Ekstra kencur segar melimpah, aroma harum menggugah selera.',
      icon: 'spa',
      badge: 'Fragrant',
      color: 'border-orange-500 bg-orange-50/70 text-orange-700'
    },
    {
      id: 'soup-4',
      type: 'Seblak Kering',
      desc: 'Seblak tumis tanpa kuah, bumbu pekat menempel erat di topping.',
      icon: 'soup_kitchen',
      badge: 'Intense',
      color: 'border-slate-800 bg-slate-50/70 text-slate-800'
    }
  ],
  spices: [
    { level: 0, label: 'No Spicy (Level 0)', desc: 'Kalem & aman untuk anak-anak.', emoji: '🍃', color: 'bg-green-100 text-green-800 border-green-200', text: 'text-green-600' },
    { level: 1, label: 'Hangat (Level 1)', desc: 'Sensasi pedas tipis penambah nafsu makan.', emoji: '🌶️', color: 'bg-yellow-100 text-yellow-850 border-yellow-200', text: 'text-yellow-600' },
    { level: 2, label: 'Menggelitik (Level 2)', desc: 'Pedas pas, nikmat kencurnya makin kerasa.', emoji: '💥', color: 'bg-orange-100 text-orange-850 border-orange-200', text: 'text-orange-600' },
    { level: 3, label: 'Menangis (Level 3)', desc: 'Mulai garuk-garuk kepala, keringat bercucuran!', emoji: '🔥', color: 'bg-red-100 text-red-850 border-red-200', text: 'text-red-600' },
    { level: 4, label: 'Jeritan (Level 4)', desc: 'Bibir bergetar, lidah serasa disengat lebah.', emoji: '⚡', color: 'bg-red-200 text-red-900 border-red-300', text: 'text-red-700' },
    { level: 5, label: 'Kesurupan (Level 5)', desc: 'Pedas ekstrem, tidak disarankan untuk pemula!', emoji: '☠️', color: 'bg-red-600 text-white border-red-700', text: 'text-red-600' }
  ]
};

export default function App() {
  // Global Application State
  const [currentView, setCurrentView] = React.useState<ViewState>('home');
  const [siteConfig, setSiteConfig] = React.useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [toppings, setToppings] = React.useState<Topping[]>(INITIAL_TOPPINGS);
  const [orders, setOrders] = React.useState<Order[]>(INITIAL_ORDERS);
  const [selectedToppings, setSelectedToppings] = React.useState<{ [id: string]: number }>({});
  
  // Custom Seblak parameters
  const [selectedSoup, setSelectedSoup] = React.useState<SoupType>('Kuah Pedas Daun Jeruk');
  const [spiceLevel, setSpiceLevel] = React.useState<number>(3);
  const [orderNotes, setOrderNotes] = React.useState<string>('');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('midtrans');

  // Admin session state
  const [adminUser, setAdminUser] = React.useState<string | null>(null);

  // Success Modal state
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [latestOrderId, setLatestOrderId] = React.useState('');

  // Cart helper quantities
  const cartCount = (Object.values(selectedToppings) as number[]).reduce((acc: number, curr: number) => acc + curr, 0);

  // Synchronize Toppings and Orders from Firestore in real-time
  React.useEffect(() => {
    // Seeding helper for toppings
    const seedToppings = async () => {
      try {
        for (const topping of INITIAL_TOPPINGS) {
          await setDoc(doc(db, 'toppings', topping.id), topping);
        }
      } catch (err) {
        console.error("Error seeding toppings: ", err);
      }
    };

    // Seeding helper for orders
    const seedOrders = async () => {
      try {
        for (const order of INITIAL_ORDERS) {
          await setDoc(doc(db, 'orders', order.id), order);
        }
      } catch (err) {
        console.error("Error seeding orders: ", err);
      }
    };

    // Listen to toppings
    const unsubscribeToppings = onSnapshot(collection(db, 'toppings'), (snapshot) => {
      if (snapshot.empty) {
        seedToppings();
      } else {
        const toppingsList: Topping[] = [];
        snapshot.forEach((doc) => {
          toppingsList.push({ id: doc.id, ...doc.data() } as Topping);
        });
        setToppings(toppingsList.sort((a, b) => parseInt(a.id) - parseInt(b.id)));
      }
    }, (error) => {
      console.warn("Toppings subscription using local fallback due to quota/network:", error?.message);
      setToppings(prev => prev.length > 0 ? prev : INITIAL_TOPPINGS);
    });

    // Listen to orders
    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      if (snapshot.empty) {
        seedOrders();
      } else {
        const ordersList: Order[] = [];
        snapshot.forEach((doc) => {
          ordersList.push({ id: doc.id, ...doc.data() } as Order);
        });
        setOrders(ordersList.sort((a, b) => b.id.localeCompare(a.id)));
      }
    }, (error) => {
      console.warn("Orders subscription using local fallback due to quota/network:", error?.message);
      setOrders(prev => prev.length > 0 ? prev : INITIAL_ORDERS);
    });

    // Listen to site config
    const unsubscribeConfig = onSnapshot(doc(db, 'settings', 'site_config'), (snapshot) => {
      if (!snapshot.exists()) {
        setDoc(doc(db, 'settings', 'site_config'), DEFAULT_SITE_CONFIG).catch(() => {});
      } else {
        const data = snapshot.data() as SiteConfig;
        setSiteConfig(data);
        
        // Auto-migrate old emojis to new modern/minimalist ones in Firestore
        const hasOldEmojis = data.spices && data.spices.some(s => 
          (s.level === 0 && s.emoji === '👼') ||
          (s.level === 1 && s.emoji === '🙂') ||
          (s.level === 2 && s.emoji === '😏') ||
          (s.level === 3 && s.emoji === '🥵') ||
          (s.level === 4 && s.emoji === '🔥') ||
          (s.level === 5 && s.emoji === '💀')
        );
        if (hasOldEmojis) {
          const updatedSpices = data.spices.map(s => {
            if (s.level === 0 && s.emoji === '👼') return { ...s, emoji: '🍃' };
            if (s.level === 1 && s.emoji === '🙂') return { ...s, emoji: '🌶️' };
            if (s.level === 2 && s.emoji === '😏') return { ...s, emoji: '💥' };
            if (s.level === 3 && s.emoji === '🥵') return { ...s, emoji: '🔥' };
            if (s.level === 4 && s.emoji === '🔥') return { ...s, emoji: '⚡' };
            if (s.level === 5 && s.emoji === '💀') return { ...s, emoji: '☠️' };
            return s;
          });
          setDoc(doc(db, 'settings', 'site_config'), { ...data, spices: updatedSpices }, { merge: true }).catch(() => {});
        }
      }
    }, (error) => {
      console.warn("Site config subscription using local fallback due to quota/network:", error?.message);
      setSiteConfig(prev => prev ? prev : DEFAULT_SITE_CONFIG);
    });

    return () => {
      unsubscribeToppings();
      unsubscribeOrders();
      unsubscribeConfig();
    };
  }, []);

  // Sync title and favicon dynamically
  React.useEffect(() => {
    if (siteConfig) {
      document.title = siteConfig.siteName;
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      if (siteConfig.siteFaviconUrl) {
        link.href = siteConfig.siteFaviconUrl;
      } else if (siteConfig.siteFavicon && siteConfig.siteFavicon.length <= 2) {
        link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${siteConfig.siteFavicon}</text></svg>`;
      } else if (siteConfig.siteFavicon) {
        link.href = siteConfig.siteFavicon;
      }
    }
  }, [siteConfig]);

  // Adjust selected soup if deleted or not in config
  React.useEffect(() => {
    if (siteConfig && siteConfig.soups && siteConfig.soups.length > 0) {
      const currentSoupExists = siteConfig.soups.some(s => s.type === selectedSoup);
      if (!currentSoupExists) {
        setSelectedSoup(siteConfig.soups[0].type);
      }
    }
  }, [siteConfig, selectedSoup]);

  // --- Cart Handlers ---
  const handleAddTopping = (toppingId: string) => {
    const topping = toppings.find((t) => t.id === toppingId);
    if (!topping) return;

    const currentQty = selectedToppings[toppingId] || 0;
    if (currentQty < topping.stock) {
      setSelectedToppings((prev) => ({
        ...prev,
        [toppingId]: currentQty + 1,
      }));
    } else {
      alert(`Maaf ka, stok ${topping.name} tidak mencukupi untuk ditambah lagi.`);
    }
  };

  const handleRemoveTopping = (toppingId: string) => {
    const currentQty = selectedToppings[toppingId] || 0;
    if (currentQty <= 1) {
      const updated = { ...selectedToppings };
      delete updated[toppingId];
      setSelectedToppings(updated);
    } else {
      setSelectedToppings((prev) => ({
        ...prev,
        [toppingId]: currentQty - 1,
      }));
    }
  };

  const handleDeleteTopping = (toppingId: string) => {
    const updated = { ...selectedToppings };
    delete updated[toppingId];
    setSelectedToppings(updated);
  };

  // Quick action from home page
  const handleQuickSelectTopping = (topping: Topping) => {
    handleAddTopping(topping.id);
    setCurrentView('menu');
    // Scroll smoothly to toppings section
    setTimeout(() => {
      const el = document.getElementById(`topping-card-${topping.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // --- Order Placement ---
  const handleProceedToCheckout = (notes: string, payment: PaymentMethod) => {
    setOrderNotes(notes);
    setPaymentMethod(payment);
    setCurrentView('checkout');
  };

  const handlePlaceOrder = async (customerData: {
    customerName: string;
    customerPhone: string;
    serviceType: 'dine_in' | 'takeaway';
    paymentMethod?: PaymentMethod;
    midtransPaymentType?: string;
    midtransTransactionStatus?: string;
    snapToken?: string;
  }) => {
    const orderId = `SH-${Math.floor(1000 + Math.random() * 9000)}`;

    // Build items
    const orderItems: OrderItem[] = (Object.entries(selectedToppings) as [string, number][]).map(([id, qty]) => {
      const topping = toppings.find((t) => t.id === id)!;
      return {
        toppingId: id,
        name: topping.name,
        quantity: qty,
        price: topping.price,
      };
    });

    const subtotal = orderItems.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
    const tax = Math.round(subtotal * 0.1);
    const serviceFee = 2000;
    const totalAmount = subtotal + tax + serviceFee;

    const resolvedPaymentMethod = customerData.paymentMethod || paymentMethod;

    // Build complete Order object
    const newOrder: Order = {
      id: orderId,
      customerName: customerData.customerName,
      customerPhone: customerData.customerPhone,
      serviceType: customerData.serviceType,
      spiceLevel,
      soupType: selectedSoup,
      items: orderItems,
      subtotal,
      tax,
      serviceFee,
      totalAmount,
      status: 'pending',
      date: 'Baru Saja',
      notes: orderNotes || '',
      paymentMethod: resolvedPaymentMethod,
      midtransPaymentType: customerData.midtransPaymentType,
      midtransTransactionStatus: customerData.midtransTransactionStatus,
      snapToken: customerData.snapToken,
    };

    // Always update local state first as fallback
    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
    setToppings(prev => prev.map(t => {
      const item = orderItems.find(i => i.toppingId === t.id);
      return item ? { ...t, stock: Math.max(0, t.stock - item.quantity) } : t;
    }));

    setLatestOrderId(orderId);
    setSelectedToppings({});
    setOrderNotes('');
    setShowSuccessModal(true);

    try {
      // Save order to Firestore
      await setDoc(doc(db, 'orders', orderId), newOrder);

      // Decrement inventory stock in Firestore
      for (const item of orderItems) {
        const toppingRef = doc(db, 'toppings', item.toppingId);
        const currentTopping = toppings.find((t) => t.id === item.toppingId);
        if (currentTopping) {
          await updateDoc(toppingRef, {
            stock: Math.max(0, currentTopping.stock - item.quantity),
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn("Firestore save fallback to local state (Quota/Network):", err);
    }
  };

  // --- Admin Dashboard State Handlers ---
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (err) {
      console.warn("Failed to update order status in Firestore (Quota/Network):", err);
    }
  };

  const handleRestockTopping = async (toppingId: string, amount: number) => {
    setToppings(prev => prev.map(t => t.id === toppingId ? { ...t, stock: Math.min(t.maxStock, t.stock + amount) } : t));
    try {
      const toppingRef = doc(db, 'toppings', toppingId);
      const topping = toppings.find((t) => t.id === toppingId);
      if (topping) {
        await updateDoc(toppingRef, {
          stock: Math.min(topping.maxStock, topping.stock + amount),
        });
      }
    } catch (err) {
      console.warn("Failed to restock topping in Firestore (Quota/Network):", err);
    }
  };

  const handleDeleteToppingFromInventory = async (toppingId: string) => {
    setToppings(prev => prev.filter(t => t.id !== toppingId));
    try {
      await deleteDoc(doc(db, 'toppings', toppingId));
    } catch (err) {
      console.warn("Failed to delete topping in Firestore (Quota/Network):", err);
    }
  };

  const handleAddToppingToInventory = async (newTopping: Omit<Topping, 'id'>) => {
    const nextId = (toppings.length > 0 ? (Math.max(...toppings.map(t => parseInt(t.id) || 0)) + 1) : 1).toString();
    const created: Topping = {
      id: nextId,
      ...newTopping,
    };
    setToppings(prev => [...prev, created]);
    try {
      await setDoc(doc(db, 'toppings', nextId), created);
    } catch (err) {
      console.warn("Failed to add topping to inventory in Firestore (Quota/Network):", err);
    }
  };

  const handleUpdateTopping = async (toppingId: string, updatedTopping: Partial<Topping>) => {
    setToppings(prev => prev.map(t => t.id === toppingId ? { ...t, ...updatedTopping } : t));
    try {
      await updateDoc(doc(db, 'toppings', toppingId), updatedTopping);
    } catch (err) {
      console.warn("Failed to update topping in Firestore (Quota/Network):", err);
    }
  };

  const handleUpdateSiteConfig = async (newConfig: SiteConfig) => {
    setSiteConfig(newConfig);
    try {
      await setDoc(doc(db, 'settings', 'site_config'), newConfig);
    } catch (err) {
      console.warn("Failed to update site config in Firestore (Quota/Network):", err);
    }
  };

  const handleAdminLogin = (email: string) => {
    setAdminUser(email);
    setCurrentView('admin_dashboard');
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setCurrentView('home');
  };


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-plus pb-16 md:pb-0">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all duration-300">
        {/* Subtle Brand Accent Bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-red-650 via-orange-500 to-amber-400"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Branding Logo & Status */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-hidden"
              id="header-brand-logo"
            >
              <div className="w-11 h-11 bg-gradient-to-tr from-red-600 to-orange-500 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-md group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 overflow-hidden relative">
                {/* Visual hover flash overlay */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {siteConfig.siteLogoUrl ? (
                  <img src={siteConfig.siteLogoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : siteConfig.siteLogoEmoji.length <= 2 ? (
                  <span className="text-2xl animate-pulse">{siteConfig.siteLogoEmoji}</span>
                ) : (
                  <span className="material-symbols-outlined text-white text-2xl font-bold">
                    {siteConfig.siteLogoEmoji}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-anybody text-base sm:text-lg font-black tracking-tight text-slate-900 block leading-none">
                    {siteConfig.siteLogoText}
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono tracking-widest font-bold block uppercase leading-none mt-1.5">
                  Prasmanan <span className="text-red-500">●</span> Level
                </span>
              </div>
            </button>

            {/* Live Kitchen Status Badge (Desktop only) */}
            <div className="hidden lg:flex items-center gap-2 bg-green-50/80 border border-green-100/80 px-2.5 py-1 rounded-full shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[9px] font-black text-green-700 font-mono tracking-wider uppercase">Live Kitchen</span>
            </div>
          </div>

          {/* Nav Items (Desktop only) */}
          <nav className="hidden md:flex items-center gap-2 font-plus text-xs font-bold text-slate-650">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 hover:bg-slate-50 hover:text-slate-900 ${
                currentView === 'home' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600'
              }`}
              id="nav-home"
            >
              <span className="material-symbols-outlined text-sm font-bold">home</span>
              <span>Beranda</span>
            </button>
            
            <button
              onClick={() => setCurrentView('menu')}
              className={`px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 hover:bg-slate-50 hover:text-slate-900 ${
                currentView === 'menu' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600'
              }`}
              id="nav-menu"
            >
              <span className="material-symbols-outlined text-sm font-bold">restaurant_menu</span>
              <span>Menu Prasmanan</span>
            </button>

            <button
              onClick={() => setCurrentView('tracking')}
              className={`px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 hover:bg-slate-50 hover:text-slate-900 ${
                currentView === 'tracking' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600'
              }`}
              id="nav-tracking"
            >
              <span className="material-symbols-outlined text-sm font-bold animate-pulse text-red-500">radar</span>
              <span>Lacak Pesanan</span>
            </button>
            
            {/* Elegant Divider */}
            <div className="h-5 w-[1px] bg-slate-200/85 mx-1"></div>

            {/* Premium Nampan Pedas (Cart) Button */}
            <button
              onClick={() => setCurrentView('cart')}
              className={`px-4.5 py-2.5 rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-2 active:scale-95 ${
                currentView === 'cart' 
                  ? 'bg-gradient-to-r from-red-650 via-red-600 to-orange-650 text-white shadow-md shadow-red-550/15' 
                  : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-md hover:shadow-orange-500/10 shadow-xs'
              }`}
              id="nav-cart"
            >
              <span className="material-symbols-outlined text-base">shopping_basket</span>
              <span className="font-extrabold uppercase tracking-wider text-[10px] font-anybody">Nampan Pedas</span>
              {cartCount > 0 ? (
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-black text-[10px] animate-bounce-slow border ${
                  currentView === 'cart' 
                    ? 'bg-white text-red-600 border-white' 
                    : 'bg-white text-orange-600 border-orange-100'
                }`}>
                  {cartCount}
                </span>
              ) : (
                <span className="w-1.5 h-1.5 bg-orange-200 rounded-full animate-ping"></span>
              )}
            </button>

            {/* Quick Admin Navigation Switcher (only shown when logged in) */}
            {adminUser && (
              <button
                onClick={() => setCurrentView('admin_dashboard')}
                className={`px-4 py-2.5 rounded-xl transition-all duration-250 cursor-pointer border flex items-center gap-1.5 active:scale-95 ${
                  currentView === 'admin_dashboard' 
                    ? 'bg-red-50 text-red-600 border-red-250 shadow-xs font-extrabold' 
                    : 'border-red-100 text-red-600 hover:bg-red-50/50 bg-transparent'
                }`}
                id="nav-admin-dashboard"
              >
                <span className="material-symbols-outlined text-base font-bold">dashboard</span>
                <span>Dashboard</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Core Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full flex items-center justify-center">
        {currentView === 'home' && (
          <HomeView
            onStartOrdering={() => setCurrentView('menu')}
            popularToppings={toppings.filter((t) => t.popular)}
            onSelectTopping={handleQuickSelectTopping}
            onNavigateToAdmin={() => setCurrentView('admin_login')}
            cartCount={cartCount}
            onNavigateToTracking={() => setCurrentView('tracking')}
            siteConfig={siteConfig}
          />
        )}

        {currentView === 'menu' && (
          <MenuView
            toppings={toppings}
            selectedToppings={selectedToppings}
            onAddTopping={handleAddTopping}
            onRemoveTopping={handleRemoveTopping}
            selectedSoup={selectedSoup}
            onSelectSoup={setSelectedSoup}
            spiceLevel={spiceLevel}
            onSelectSpice={setSpiceLevel}
            onNavigateToCart={() => setCurrentView('cart')}
            siteConfig={siteConfig}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            toppings={toppings}
            selectedToppings={selectedToppings}
            onAddTopping={handleAddTopping}
            onRemoveTopping={handleRemoveTopping}
            onDeleteTopping={handleDeleteTopping}
            selectedSoup={selectedSoup}
            spiceLevel={spiceLevel}
            onNavigateToMenu={() => setCurrentView('menu')}
            onProceedToCheckout={handleProceedToCheckout}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            toppings={toppings}
            selectedToppings={selectedToppings}
            selectedSoup={selectedSoup}
            spiceLevel={spiceLevel}
            notes={orderNotes}
            paymentMethod={paymentMethod}
            siteConfig={siteConfig}
            onPlaceOrder={handlePlaceOrder}
            onNavigateToCart={() => setCurrentView('cart')}
          />
        )}

        {currentView === 'admin_login' && (
          <AdminLoginView
            onLoginSuccess={handleAdminLogin}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {currentView === 'admin_dashboard' && adminUser && (
          <AdminDashboardView
            toppings={toppings}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRestockTopping={handleRestockTopping}
            onDeleteTopping={handleDeleteToppingFromInventory}
            onAddToppingToInventory={handleAddToppingToInventory}
            onUpdateTopping={handleUpdateTopping}
            siteConfig={siteConfig}
            onUpdateSiteConfig={handleUpdateSiteConfig}
            onLogout={handleAdminLogout}
          />
        )}

        {currentView === 'tracking' && (
          <TrackingView
            latestOrderId={latestOrderId}
            siteConfig={siteConfig}
            onNavigateToMenu={() => setCurrentView('menu')}
            onNavigateToHome={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Celebratory Spicy Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden space-y-6">
            {/* Ambient visual background glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl"></div>

            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-100">
              <span className="material-symbols-outlined text-4xl font-bold">celebration</span>
            </div>

            <div className="space-y-2">
              <span className="text-orange-600 font-bold tracking-widest text-[10px] uppercase font-mono">ORDER SUCCESSFULLY PLACED!</span>
              <h2 className="font-anybody text-2xl font-black text-slate-900">Spicy Success! 🎉</h2>
              <p className="font-plus text-xs text-slate-500 leading-relaxed px-2">
                Pesanan seblak prasmananmu sudah masuk antrian masak dapur. Mohon tunjukkan ID pesanan berikut ke pelayan atau kasir kami.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-xs space-y-2 text-left">
              <div className="flex justify-between border-b border-slate-150/80 pb-2">
                <span className="text-slate-400">ID Pesanan:</span>
                <span className="font-bold text-slate-900">{latestOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pilihan Kuah:</span>
                <span className="font-bold text-slate-800">{selectedSoup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kepedasan:</span>
                <span className="font-bold text-slate-800">Lvl {spiceLevel} ({spiceLevel * 2} Sdm)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimasi Masak:</span>
                <span className="font-bold text-green-600">10-15 Menit</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentView('tracking');
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl text-xs transition-colors cursor-pointer font-plus flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10"
              >
                <span className="material-symbols-outlined text-sm font-bold">radar</span>
                Pantau Proses Masak (Real-time)
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentView('home');
                }}
                className="w-full bg-slate-950 hover:bg-slate-850 text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer font-plus"
              >
                Kembali ke Beranda
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentView('admin_login');
                }}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold py-2 rounded-xl text-[10px] transition-colors cursor-pointer font-plus"
              >
                Portal Monitor Dapur (Admin)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aesthetic Brand Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
            <span>{siteConfig.footerText}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium font-plus text-slate-400">
            {adminUser ? (
              <button
                onClick={() => setCurrentView('admin_dashboard')}
                className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
                id="footer-admin-dashboard-btn"
              >
                <span className="material-symbols-outlined text-sm">dashboard</span>
                Dashboard Admin
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('admin_login')}
                className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                id="footer-admin-login-btn"
              >
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                Login Admin Portal
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Navigation for Mobile Devices */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-2 flex items-center justify-around md:hidden pb-safe">
        <button
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center gap-0.5 flex-1 py-1 transition-all cursor-pointer ${
            currentView === 'home' ? 'text-red-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-xl">home</span>
          <span className="text-[9px] font-bold tracking-tight">Beranda</span>
        </button>

        <button
          onClick={() => setCurrentView('menu')}
          className={`flex flex-col items-center gap-0.5 flex-1 py-1 transition-all cursor-pointer ${
            currentView === 'menu' ? 'text-red-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-xl font-medium">restaurant_menu</span>
          <span className="text-[9px] font-bold tracking-tight">Pilih Menu</span>
        </button>

        <button
          onClick={() => setCurrentView('cart')}
          className={`flex flex-col items-center gap-0.5 flex-1 py-1 transition-all relative cursor-pointer ${
            currentView === 'cart' ? 'text-orange-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-xl">shopping_basket</span>
          <span className="text-[9px] font-bold tracking-tight">Nampan</span>
          {cartCount > 0 && (
            <span className="absolute top-0.5 right-1/4 bg-orange-600 text-white font-mono text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-sm">
              {cartCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentView('tracking')}
          className={`flex flex-col items-center gap-0.5 flex-1 py-1 transition-all cursor-pointer ${
            currentView === 'tracking' ? 'text-red-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-xl">radar</span>
          <span className="text-[9px] font-bold tracking-tight">Lacak</span>
        </button>

        {adminUser && (
          <button
            onClick={() => setCurrentView('admin_dashboard')}
            className={`flex flex-col items-center gap-0.5 flex-1 py-1 transition-all cursor-pointer ${
              currentView === 'admin_dashboard' ? 'text-red-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span className="text-[9px] font-bold tracking-tight">Admin</span>
          </button>
        )}
      </nav>
    </div>
  );
}
