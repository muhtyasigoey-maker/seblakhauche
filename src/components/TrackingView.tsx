import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus, SiteConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Search, 
  X, 
  ChevronRight, 
  ChefHat, 
  ShoppingBag, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Flame, 
  Utensils, 
  Soup, 
  Info,
  Layers,
  ArrowLeft,
  Timer
} from 'lucide-react';

interface TrackingViewProps {
  latestOrderId?: string | null;
  siteConfig?: SiteConfig;
  onNavigateToMenu: () => void;
  onNavigateToHome: () => void;
}

export default function TrackingView({
  latestOrderId,
  siteConfig,
  onNavigateToMenu,
  onNavigateToHome
}: TrackingViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Mobile focused tab filter (KDS Columns)
  // 'all_cols' on mobile means swipeable/grid, or we can focus on one column at a time
  const [activeColumnTab, setActiveColumnTab] = useState<'pending' | 'preparing' | 'ready' | 'completed' | 'all'>('all');

  // Real-time Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load all orders from Firestore in real-time
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'orders'), orderBy('id', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Order);
        });
        setOrders(list);
        setLoading(false);

        // If there's a latestOrderId, auto-select it as the active order detail drawer on mount
        if (latestOrderId && list.length > 0) {
          const found = list.find(o => o.id === latestOrderId);
          if (found) {
            setSelectedOrder(found);
          }
        }
      },
      (err) => {
        console.warn("Firestore order subscription fallback in TrackingView (Quota/Network):", err?.message);
        setOrders(prev => prev.length > 0 ? prev : [
          {
            id: latestOrderId || 'SH-1001',
            customerName: 'Pelanggan Seblak',
            customerPhone: '081234567890',
            serviceType: 'dine_in',
            spiceLevel: 3,
            soupType: 'Kuah Pedas Daun Jeruk',
            items: [
              { toppingId: 'top-1', name: 'Kerupuk Mawar Merah', quantity: 2, price: 1500 },
              { toppingId: 'top-4', name: 'Bakso Sapi Lengkap', quantity: 1, price: 3000 }
            ],
            subtotal: 6000,
            tax: 600,
            serviceFee: 2000,
            totalAmount: 8600,
            status: 'preparing',
            date: 'Baru Saja',
            notes: '',
            paymentMethod: 'qris'
          }
        ]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [latestOrderId]);

  // Sync selected order in real-time if its status changes in the background
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedOrder)) {
        setSelectedOrder(updated);
      }
    }
  }, [orders, selectedOrder]);

  // Helper to extract clean time/timestamp representation
  const getOrderTime = (dateStr: string) => {
    if (!dateStr) return 'Baru Saja';
    if (dateStr.toLowerCase().includes('baru')) return 'Baru Saja';
    const match = dateStr.match(/(\d{1,2})[.:](\d{2})/);
    if (match) return match[0];
    return dateStr;
  };

  // Filter orders based on search input
  const searchedOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            order.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [orders, searchTerm]);

  // Categorize orders into columns
  const pendingOrders = useMemo(() => searchedOrders.filter(o => o.status === 'pending'), [searchedOrders]);
  const preparingOrders = useMemo(() => searchedOrders.filter(o => o.status === 'preparing'), [searchedOrders]);
  const readyOrders = useMemo(() => searchedOrders.filter(o => o.status === 'ready'), [searchedOrders]);
  const completedOrders = useMemo(() => searchedOrders.filter(o => o.status === 'completed'), [searchedOrders]);

  // Dashboard calculations
  const totalActiveCount = useMemo(() => {
    return orders.filter(o => o.status !== 'completed').length;
  }, [orders]);

  const completedCount = useMemo(() => {
    return orders.filter(o => o.status === 'completed').length;
  }, [orders]);

  const averagePrepTime = useMemo(() => {
    // Semi-realistic average preparation estimate based on active count
    return Math.max(10, 10 + totalActiveCount * 2);
  }, [totalActiveCount]);

  const extremeSpiceCount = useMemo(() => {
    return orders.filter(o => o.status !== 'completed' && o.spiceLevel >= 4).length;
  }, [orders]);

  // Level classification badge
  const getSpiceClass = (level: number) => {
    if (level <= 1) return { text: 'MILD', bg: 'bg-green-50 text-green-700 border-green-100' };
    if (level <= 3) return { text: 'MEDIUM', bg: 'bg-amber-50 text-amber-700 border-amber-100' };
    return { text: 'HOT 🔥', bg: 'bg-rose-50 text-rose-700 border-rose-100' };
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 px-2 sm:px-4 font-plus" id="tracking-view">
      
      {/* 1. KDS Modern Header Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl -z-10"></div>

        {/* Brand details */}
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="material-symbols-outlined text-white text-2xl font-bold">kitchen</span>
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="bg-red-500 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase">KDS LIVE TRACKER</span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
            </div>
            <h1 className="font-anybody text-2xl md:text-3xl font-black tracking-tight mt-0.5">
              {siteConfig?.siteName || 'Seblak Hauche'} KDS Board
            </h1>
          </div>
        </div>

        {/* Running clock (minimalist tech aesthetic) */}
        <div className="bg-slate-800/80 border border-slate-700/60 px-5 py-2.5 rounded-2xl text-center shadow-inner flex flex-col items-center justify-center font-mono">
          <span className="text-xs text-slate-400 tracking-wider font-semibold uppercase flex items-center gap-1.5 mb-0.5">
            <Clock className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            Waktu Dapur
          </span>
          <span className="text-xl font-bold text-yellow-400 tracking-wider">
            {currentTime || '10:02 PM'}
          </span>
        </div>
      </div>

      {/* 2. Key KDS Dashboard Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Active Orders */}
        <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ChefHat className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ANTREAN AKTIF</span>
            <span className="text-xl font-black text-slate-800">{totalActiveCount} Pesanan</span>
          </div>
        </div>

        {/* Stat 2: Avg. Prep Time */}
        <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Timer className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ESTIMASI KESIAPAN</span>
            <span className="text-xl font-black text-slate-800">~{averagePrepTime} Menit</span>
          </div>
        </div>

        {/* Stat 3: Completed Today */}
        <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SELESAI DISAJIKAN</span>
            <span className="text-xl font-black text-slate-800">{completedCount} Pesanan</span>
          </div>
        </div>

        {/* Stat 4: Delayed/Extreme Spicy orders */}
        <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <Flame className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">RACIKAN PEDAS EKSTRIM</span>
            <span className="text-xl font-black text-slate-800">{extremeSpiceCount} Porsi</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Real-time search box */}
        <div className="relative w-full md:max-w-md">
          <Search className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama Anda atau ID Pesanan..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 text-sm font-semibold transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile/Responsive View Column Switchers */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setActiveColumnTab('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeColumnTab === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Semua ({searchedOrders.length})
          </button>
          <button
            onClick={() => setActiveColumnTab('pending')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeColumnTab === 'pending' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Antrean ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveColumnTab('preparing')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeColumnTab === 'preparing' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Dimasak ({preparingOrders.length})
          </button>
          <button
            onClick={() => setActiveColumnTab('ready')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeColumnTab === 'ready' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Siap ({readyOrders.length})
          </button>
          <button
            onClick={() => setActiveColumnTab('completed')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeColumnTab === 'completed' ? 'bg-slate-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Selesai ({completedOrders.length})
          </button>
        </div>
      </div>

      {/* 4. KDS Board Content Grid (with drawer layout) */}
      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Column 1: New Orders (Pending) */}
          {(activeColumnTab === 'all' || activeColumnTab === 'pending') && (
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-4 space-y-4">
              <div className="flex items-center justify-between bg-rose-50 border border-rose-100 px-4 py-3 rounded-2xl text-rose-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="font-anybody font-black text-xs tracking-wider uppercase">Antrean Baru</span>
                </div>
                <span className="font-mono text-xs font-black bg-rose-200/50 px-2.5 py-0.5 rounded-full">{pendingOrders.length}</span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl bg-white/50">
                    Tidak ada antrean baru
                  </div>
                ) : (
                  pendingOrders.map(order => (
                    <OrderKDSCard 
                      key={order.id} 
                      order={order} 
                      onSelect={() => setSelectedOrder(order)}
                      isSelected={selectedOrder?.id === order.id}
                      getSpiceClass={getSpiceClass}
                      getOrderTime={getOrderTime}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Column 2: In Preparation (Preparing) */}
          {(activeColumnTab === 'all' || activeColumnTab === 'preparing') && (
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-4 space-y-4">
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 px-4 py-3 rounded-2xl text-amber-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="font-anybody font-black text-xs tracking-wider uppercase">Sedang Dimasak</span>
                </div>
                <span className="font-mono text-xs font-black bg-amber-200/50 px-2.5 py-0.5 rounded-full">{preparingOrders.length}</span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {preparingOrders.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl bg-white/50">
                    Tidak ada yang sedang dimasak
                  </div>
                ) : (
                  preparingOrders.map(order => (
                    <OrderKDSCard 
                      key={order.id} 
                      order={order} 
                      onSelect={() => setSelectedOrder(order)}
                      isSelected={selectedOrder?.id === order.id}
                      getSpiceClass={getSpiceClass}
                      getOrderTime={getOrderTime}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Column 3: Ready to Serve (Ready) */}
          {(activeColumnTab === 'all' || activeColumnTab === 'ready') && (
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-4 space-y-4">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-2xl text-emerald-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span className="font-anybody font-black text-xs tracking-wider uppercase">Siap Disajikan</span>
                </div>
                <span className="font-mono text-xs font-black bg-emerald-200/50 px-2.5 py-0.5 rounded-full">{readyOrders.length}</span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {readyOrders.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl bg-white/50">
                    Belum ada seblak siap saji
                  </div>
                ) : (
                  readyOrders.map(order => (
                    <OrderKDSCard 
                      key={order.id} 
                      order={order} 
                      onSelect={() => setSelectedOrder(order)}
                      isSelected={selectedOrder?.id === order.id}
                      getSpiceClass={getSpiceClass}
                      getOrderTime={getOrderTime}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Column 4: Completed (Completed) */}
          {(activeColumnTab === 'all' || activeColumnTab === 'completed') && (
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-4 space-y-4">
              <div className="flex items-center justify-between bg-slate-100 border border-slate-200 px-4 py-3 rounded-2xl text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="font-anybody font-black text-xs tracking-wider uppercase">Selesai Diambil</span>
                </div>
                <span className="font-mono text-xs font-black bg-slate-200 px-2.5 py-0.5 rounded-full">{completedOrders.length}</span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {completedOrders.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl bg-white/50">
                    Belum ada pesanan yang selesai
                  </div>
                ) : (
                  completedOrders.map(order => (
                    <OrderKDSCard 
                      key={order.id} 
                      order={order} 
                      onSelect={() => setSelectedOrder(order)}
                      isSelected={selectedOrder?.id === order.id}
                      getSpiceClass={getSpiceClass}
                      getOrderTime={getOrderTime}
                    />
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* 5. GORGEOUS SLIDING DRAWER: Recipe Details Panel */}
        <AnimatePresence>
          {selectedOrder && (
            <>
              {/* Backdrop Overlay for mobile/desktop to capture clicks outside */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                className="fixed inset-0 bg-slate-950 z-40 cursor-pointer"
              />

              {/* Drawer Content */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                className="fixed top-0 right-0 h-full w-full max-w-md sm:max-w-lg bg-white shadow-2xl z-50 border-l border-slate-100 flex flex-col overflow-hidden"
              >
                {/* Header block of the drawer */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-orange-500" />
                    <span className="text-xs font-black tracking-widest font-mono text-slate-400 uppercase">Resep & Detil Racikan</span>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Main Body Scroll Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Customer Info Card */}
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-black text-orange-600 uppercase tracking-widest block">
                      ID Pesanan: #{selectedOrder.id.toUpperCase()}
                    </span>
                    <h2 className="font-anybody text-2xl font-black text-slate-900 leading-tight">
                      {selectedOrder.customerName}
                    </h2>
                    <p className="text-xs font-mono text-slate-400">
                      Telepon: {selectedOrder.customerPhone || '-'}
                    </p>
                  </div>

                  {/* Dynamic Status Pill Block */}
                  <div className="flex items-center justify-between border-t border-b border-slate-100 py-4">
                    <span className="text-xs font-black text-slate-400 font-mono uppercase tracking-wider">Status Pesanan:</span>
                    <div className="flex items-center">
                      {selectedOrder.status === 'pending' && (
                        <span className="px-3 py-1 bg-rose-50 border border-rose-100 text-rose-700 rounded-full font-bold text-xs flex items-center gap-1.5 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Mengantre di Kasir
                        </span>
                      )}
                      {selectedOrder.status === 'preparing' && (
                        <span className="px-3 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-full font-bold text-xs flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          Sedang Dimasak Chef
                        </span>
                      )}
                      {selectedOrder.status === 'ready' && (
                        <span className="px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full font-black text-xs flex items-center gap-1.5 animate-bounce">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Siap Disajikan! 🔔
                        </span>
                      )}
                      {selectedOrder.status === 'completed' && (
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-bold text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                          Selesai Diambil
                        </span>
                      )}
                      {selectedOrder.paymentMethod === 'midtrans' ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-xs flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs">credit_card</span>
                          Midtrans {selectedOrder.midtransTransactionStatus === 'settlement' ? '(Lunas)' : '(Pending)'}
                        </span>
                      ) : selectedOrder.paymentMethod === 'qris' ? (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-bold text-xs flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs">qr_code_2</span>
                          QRIS
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-xs flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs">point_of_sale</span>
                          Bayar Kasir
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Key Metrics grid layout */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Servings Card */}
                    <div className="bg-slate-50 border border-slate-100/80 p-3.5 rounded-2xl text-center space-y-1">
                      <Utensils className="w-4.5 h-4.5 text-slate-400 mx-auto" />
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">PORSI</span>
                      <span className="text-xs font-black text-slate-800">1 Porsi</span>
                    </div>

                    {/* Service Type Card */}
                    <div className="bg-slate-50 border border-slate-100/80 p-3.5 rounded-2xl text-center space-y-1">
                      {selectedOrder.serviceType === 'dine_in' ? (
                        <Utensils className="w-4.5 h-4.5 text-blue-500 mx-auto" />
                      ) : (
                        <ShoppingBag className="w-4.5 h-4.5 text-indigo-500 mx-auto" />
                      )}
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">TIKET</span>
                      <span className="text-xs font-black text-slate-800">
                        {selectedOrder.serviceType === 'dine_in' ? 'Makan Sini' : 'Bawa Pulang'}
                      </span>
                    </div>

                    {/* Soup Type Card */}
                    <div className="bg-slate-50 border border-slate-100/80 p-3.5 rounded-2xl text-center space-y-1">
                      <Soup className="w-4.5 h-4.5 text-amber-500 mx-auto" />
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">KUAH SEBLAK</span>
                      <span className="text-[10px] font-black text-slate-800 line-clamp-1">
                        {selectedOrder.soupType}
                      </span>
                    </div>
                  </div>

                  {/* HIGH IMPACT VISUAL: Chili & Flame Spice display */}
                  <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex items-center gap-5">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                          Level {selectedOrder.spiceLevel}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {selectedOrder.spiceLevel * 2} Sdm Cabai
                        </span>
                      </div>
                      <h3 className="font-anybody text-lg font-black text-slate-900 leading-tight">
                        {siteConfig?.spices?.find(s => s.level === selectedOrder.spiceLevel)?.label || `Pedas Level ${selectedOrder.spiceLevel}`}
                      </h3>
                      <p className="text-xs text-slate-500 leading-normal">
                        "{siteConfig?.spices?.find(s => s.level === selectedOrder.spiceLevel)?.desc || 'Tingkat kepedasan khas Seblak Hauche.'}"
                      </p>
                    </div>
                  </div>

                  {/* 4. Ingredients / Toppings List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2 pb-1.5 border-b border-slate-100">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Daftar Topping & Isian Seblak
                    </h4>
                    
                    <div className="divide-y divide-slate-100 bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="px-4 py-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center font-mono text-[10px] text-slate-400 font-black">
                              {index + 1}
                            </span>
                            <span className="font-bold text-slate-700">{item.name}</span>
                          </div>
                          <span className="font-mono font-black text-orange-600 bg-orange-100/60 border border-orange-200/50 px-2.5 py-0.5 rounded-lg text-xs">
                            {item.quantity}x porsi
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. Chef Memo / Customer Notes */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2 pb-1.5 border-b border-slate-100">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      Catatan Dapur & Permintaan Pelanggan
                    </h4>
                    
                    {selectedOrder.notes ? (
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl text-xs text-yellow-900 flex items-start gap-3 shadow-xs">
                        <Info className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold text-[10px] text-yellow-800 uppercase tracking-wider block">MEMO KHUSUS:</span>
                          <p className="font-semibold leading-relaxed">"{selectedOrder.notes}"</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl text-xs text-slate-400 text-center font-medium">
                        Tidak ada catatan atau permintaan khusus dari pelanggan.
                      </div>
                    )}
                  </div>

                  {/* 6. Order Placement Date & WhatsApp Action */}
                  <div className="pt-2 flex items-center justify-between gap-2 text-slate-400 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Dipesan pada: {selectedOrder.date}</span>
                    </div>
                  </div>

                  {/* 7. Send Order Summary / Contact Kedai via WA */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        let cleanWa = (siteConfig?.whatsappNumber || '6281234567890').replace(/\D/g, '');
                        if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.slice(1);
                        const itemsTxt = selectedOrder.items.map(i => `- ${i.name} (${i.quantity}x)`).join('\n');
                        const msg = `Halo ${siteConfig?.siteName || 'Seblak Hauche'}! Saya ${selectedOrder.customerName}.\n\nMau menanyakan status pesanan #${selectedOrder.id}:\n- Total: Rp ${selectedOrder.totalAmount.toLocaleString('id-ID')}\n- Kuah: ${selectedOrder.soupType} (Lvl ${selectedOrder.spiceLevel})\n\nMenu:\n${itemsTxt}`;
                        window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 font-plus shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">chat</span>
                      <span>Konfirmasi / Tanya Pesanan via WhatsApp</span>
                    </button>
                  </div>

                </div>

                {/* Footer section of the drawer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/80 text-center text-[10px] font-mono text-slate-400">
                  ID: {selectedOrder.id}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Bottom Navigation / Brand Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
        <button
          onClick={onNavigateToMenu}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-6 py-3.5 rounded-2xl text-xs transition-colors cursor-pointer font-plus flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm font-bold">restaurant_menu</span>
          Pesan Seblak Lagi
        </button>
        <button
          onClick={onNavigateToHome}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-2xl text-xs transition-colors cursor-pointer font-plus flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </button>
      </div>

    </div>
  );
}

/* Sub-component: KDS Order Card inside each column */
interface OrderKDSCardProps {
  key?: string | number;
  order: Order;
  onSelect: () => void;
  isSelected: boolean;
  getSpiceClass: (lvl: number) => { text: string; bg: string };
  getOrderTime: (dateStr: string) => string;
}

function OrderKDSCard({ 
  order, 
  onSelect, 
  isSelected, 
  getSpiceClass, 
  getOrderTime 
}: OrderKDSCardProps) {
  const spice = getSpiceClass(order.spiceLevel);
  const timeStr = getOrderTime(order.date);

  return (
    <div 
      onClick={onSelect}
      className={`bg-white border text-left p-4 rounded-2xl shadow-xs transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-md hover:scale-[1.015] active:scale-[0.995] ${
        isSelected ? 'border-orange-500 ring-2 ring-orange-500/15 scale-[1.01]' : 'border-slate-100/80'
      }`}
    >
      {/* Top Header Row of the card */}
      <div className="flex justify-between items-center gap-2 mb-2.5">
        <span className="font-mono text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
          #{order.id.slice(-4).toUpperCase()}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full border ${spice.bg}`}>
            {spice.text}
          </span>
          <span className="font-mono text-[9px] font-bold text-slate-400 flex items-center gap-0.5 shrink-0">
            <Clock className="w-2.5 h-2.5 text-slate-300" />
            {timeStr}
          </span>
        </div>
      </div>

      {/* Customer / Service Details */}
      <div className="mb-3 space-y-1">
        <h4 className="font-plus text-sm font-black text-slate-800 leading-tight line-clamp-1">
          {order.customerName}
        </h4>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
            order.serviceType === 'dine_in' 
              ? 'bg-blue-50 text-blue-600 border border-blue-100' 
              : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
          }`}>
            {order.serviceType === 'dine_in' ? 'Makan Sini' : 'Bawa Pulang'}
          </span>
          <span className="text-[10px] text-slate-400 font-bold line-clamp-1">
            {order.soupType}
          </span>
        </div>
      </div>

      {/* Item List Summary (Compact) */}
      <div className="space-y-1.5 bg-slate-50/50 border border-slate-100/40 p-2 rounded-xl mb-3">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Daftar Topping:</div>
        <div className="space-y-1 max-h-[100px] overflow-y-auto">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs text-slate-600">
              <span className="line-clamp-1 font-semibold">{item.name}</span>
              <span className="font-mono text-[10px] font-black text-orange-600 shrink-0 ml-1 bg-white border border-slate-100 px-1 py-0.2 rounded">
                {item.quantity}x
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer warning notes (if any) */}
      {order.notes && (
        <div className="bg-yellow-50 border border-yellow-100 p-2 rounded-xl text-[10px] text-yellow-800 flex items-start gap-1.5 mb-3 line-clamp-2">
          <AlertCircle className="w-3.5 h-3.5 text-yellow-600 shrink-0 mt-0.5" />
          <p className="font-medium leading-tight">"{order.notes}"</p>
        </div>
      )}

      {/* Action footer link */}
      <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-orange-600 hover:text-orange-700 text-xs font-bold font-plus mt-auto">
        <span>Detail Resep & Racik</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}
