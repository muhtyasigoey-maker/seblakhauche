import React, { useState, useEffect } from 'react';
import { SoupType, Topping, SiteConfig, PaymentMethod } from '../types';
import { loadMidtransSnapScript, getMidtransConfig, createMidtransTransaction, MidtransConfig } from '../utils/midtrans';
import MidtransSimulatorModal from './MidtransSimulatorModal';

interface CheckoutViewProps {
  toppings: Topping[];
  selectedToppings: { [id: string]: number };
  selectedSoup: SoupType;
  spiceLevel: number;
  notes: string;
  paymentMethod: PaymentMethod;
  siteConfig?: SiteConfig;
  onPlaceOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    serviceType: 'dine_in' | 'takeaway';
    paymentMethod: PaymentMethod;
    midtransPaymentType?: string;
    midtransTransactionStatus?: string;
    snapToken?: string;
  }) => void;
  onNavigateToCart: () => void;
}

export default function CheckoutView({
  toppings,
  selectedToppings,
  selectedSoup,
  spiceLevel,
  notes,
  paymentMethod: initialPaymentMethod,
  siteConfig,
  onPlaceOrder,
  onNavigateToCart
}: CheckoutViewProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceType, setServiceType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialPaymentMethod);
  const [qrisTimer, setQrisTimer] = useState(300); // 5 minutes in seconds
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessingMidtrans, setIsProcessingMidtrans] = useState(false);
  const [midtransConfig, setMidtransConfig] = useState<MidtransConfig | null>(null);

  // Simulator modal state
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState('');

  // Load Midtrans config and script on mount
  useEffect(() => {
    getMidtransConfig().then((cfg) => {
      setMidtransConfig(cfg);
      loadMidtransSnapScript(cfg.clientKey, cfg.snapUrl);
    });
  }, []);

  // Countdown timer for QRIS
  useEffect(() => {
    if (paymentMethod !== 'qris') return;
    const interval = setInterval(() => {
      setQrisTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentMethod]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedItems = toppings.filter(t => (selectedToppings[t.id] || 0) > 0);

  const calculateSubtotal = () => {
    return selectedItems.reduce((acc, curr) => {
      const qty = selectedToppings[curr.id] || 0;
      return acc + (qty * curr.price);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = Math.round(subtotal * 0.1);
  const serviceFee = subtotal > 0 ? 2000 : 0;
  const grandTotal = subtotal + tax + serviceFee;

  const handleOrderSubmission = async () => {
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Nama lengkap pemesan wajib diisi ya!');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Nomor WhatsApp wajib diisi untuk notifikasi status pesanan!');
      return;
    }

    // Handle Midtrans Payment Gateway
    if (paymentMethod === 'midtrans') {
      setIsProcessingMidtrans(true);
      const tempOrderId = `SH-${Math.floor(1000 + Math.random() * 9000)}`;
      setPendingOrderId(tempOrderId);

      try {
        const itemDetails = selectedItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: selectedToppings[item.id] || 1
        }));

        // Add tax & fee as item details for Midtrans total validation
        if (tax > 0) {
          itemDetails.push({
            id: 'tax-10',
            name: 'Pajak Resto 10%',
            price: tax,
            quantity: 1
          });
        }
        if (serviceFee > 0) {
          itemDetails.push({
            id: 'service-fee',
            name: 'Biaya Pelayanan',
            price: serviceFee,
            quantity: 1
          });
        }

        const snapResponse = await createMidtransTransaction({
          orderId: tempOrderId,
          grossAmount: grandTotal,
          customerDetails: {
            firstName: customerName,
            phone: customerPhone,
            email: `${customerPhone.replace(/\D/g, '')}@seblakhauce.com`
          },
          itemDetails
        });

        // Check if real Snap is available and key is configured
        if (window.snap && snapResponse.isConfigured && snapResponse.token && !snapResponse.token.startsWith('DEMO_SANDBOX')) {
          window.snap.pay(snapResponse.token, {
            onSuccess: (result) => {
              setIsProcessingMidtrans(false);
              onPlaceOrder({
                customerName,
                customerPhone,
                serviceType,
                paymentMethod: 'midtrans',
                midtransPaymentType: result.payment_type || 'midtrans_sandbox',
                midtransTransactionStatus: result.transaction_status || 'settlement',
                snapToken: snapResponse.token
              });
            },
            onPending: (result) => {
              setIsProcessingMidtrans(false);
              onPlaceOrder({
                customerName,
                customerPhone,
                serviceType,
                paymentMethod: 'midtrans',
                midtransPaymentType: result.payment_type || 'midtrans_va_pending',
                midtransTransactionStatus: 'pending',
                snapToken: snapResponse.token
              });
            },
            onError: (result) => {
              setIsProcessingMidtrans(false);
              setErrorMsg(`Pembayaran Midtrans gagal atau ditolak: ${result.status_message || 'Silakan coba lagi.'}`);
            },
            onClose: () => {
              setIsProcessingMidtrans(false);
            }
          });
        } else {
          // Open interactive sandbox simulator modal
          setIsProcessingMidtrans(false);
          setShowSimulatorModal(true);
        }
      } catch (err: any) {
        setIsProcessingMidtrans(false);
        console.warn('Midtrans creation error, opening Sandbox Simulator:', err);
        // Fallback to simulator modal
        setShowSimulatorModal(true);
      }
      return;
    }

    // Standard QRIS / Cashier flow
    onPlaceOrder({
      customerName,
      customerPhone,
      serviceType,
      paymentMethod
    });
  };

  const handleSimulatorSuccess = (channel: string) => {
    setShowSimulatorModal(false);
    onPlaceOrder({
      customerName,
      customerPhone,
      serviceType,
      paymentMethod: 'midtrans',
      midtransPaymentType: channel,
      midtransTransactionStatus: 'settlement'
    });
  };

  const handleSimulatorPending = (channel: string) => {
    setShowSimulatorModal(false);
    onPlaceOrder({
      customerName,
      customerPhone,
      serviceType,
      paymentMethod: 'midtrans',
      midtransPaymentType: `${channel}_pending`,
      midtransTransactionStatus: 'pending'
    });
  };

  return (
    <div id="checkout-view" className="w-full">
      {/* Midtrans Sandbox Simulator Modal */}
      <MidtransSimulatorModal
        isOpen={showSimulatorModal}
        orderId={pendingOrderId}
        grossAmount={grandTotal}
        customerName={customerName}
        items={selectedItems.map(i => ({ name: i.name, quantity: selectedToppings[i.id] || 1, price: i.price }))}
        onSuccess={handleSimulatorSuccess}
        onPending={handleSimulatorPending}
        onClose={() => setShowSimulatorModal(false)}
      />

      <div className="mb-10 text-center md:text-left">
        <h1 className="font-anybody text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
          Detail Pesanan & Pembayaran ✍️
        </h1>
        <p className="font-plus text-slate-500 text-sm md:text-base">
          Lengkapi data diri dan bayar langsung dengan Midtrans Sandbox, QRIS, atau Kasir.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Payment methods (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="font-anybody text-base font-extrabold text-slate-900 pb-4 border-b border-slate-100 uppercase tracking-wide">
              Lengkapi Data Pemesan
            </h2>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 font-plus">
                <span className="material-symbols-outlined text-base">error</span>
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customer-name-input" className="block text-xs font-bold text-slate-700 mb-2 font-plus uppercase">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    person
                  </span>
                  <input
                    id="customer-name-input"
                    type="text"
                    required
                    placeholder="Contoh: Dian Ayu Lestari"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl py-3 pl-11 pr-4 font-plus text-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="customer-phone-input" className="block text-xs font-bold text-slate-700 mb-2 font-plus uppercase">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    phone_android
                  </span>
                  <input
                    id="customer-phone-input"
                    type="tel"
                    required
                    placeholder="Contoh: 08123456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl py-3 pl-11 pr-4 font-plus text-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Service Type Selection */}
            <div>
              <span className="block text-xs font-bold text-slate-700 mb-3 font-plus uppercase">
                Metode Menikmati Seblak
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setServiceType('dine_in')}
                  className={`p-4 rounded-2xl border text-left flex gap-4 items-center transition-all cursor-pointer ${
                    serviceType === 'dine_in'
                      ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                    serviceType === 'dine_in' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span className="material-symbols-outlined">table_restaurant</span>
                  </span>
                  <div>
                    <h4 className="font-plus text-xs font-bold text-slate-900">Makan di Sini (Dine-In)</h4>
                    <p className="font-plus text-[10px] text-slate-500">Disajikan panas-panas langsung di meja kasir.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceType('takeaway')}
                  className={`p-4 rounded-2xl border text-left flex gap-4 items-center transition-all cursor-pointer ${
                    serviceType === 'takeaway'
                      ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                    serviceType === 'takeaway' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span className="material-symbols-outlined">takeout_dining</span>
                  </span>
                  <div>
                    <h4 className="font-plus text-xs font-bold text-slate-900">Bawa Pulang (Takeaway)</h4>
                    <p className="font-plus text-[10px] text-slate-500">Kuah dipisah & dipacking rapi kedap udara.</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Method Switcher in Checkout */}
            <div className="pt-4 border-t border-slate-100">
              <span className="block text-xs font-bold text-slate-700 mb-3 font-plus uppercase">
                Metode Pembayaran
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('midtrans')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'midtrans'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    paymentMethod === 'midtrans' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-blue-600'
                  }`}>
                    <span className="material-symbols-outlined text-lg">credit_card</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-plus text-xs font-bold text-slate-900">Midtrans Snap</h4>
                      <span className="bg-amber-400 text-slate-900 text-[8px] font-black uppercase px-1 rounded-sm font-mono">
                        SANDBOX
                      </span>
                    </div>
                    <p className="font-plus text-[10px] text-slate-500">GoPay, Shopee, VA Bank</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'qris'
                      ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    paymentMethod === 'qris' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-orange-600'
                  }`}>
                    <span className="material-symbols-outlined text-lg">qr_code_2</span>
                  </div>
                  <div>
                    <h4 className="font-plus text-xs font-bold text-slate-900">QRIS Statis</h4>
                    <p className="font-plus text-[10px] text-slate-500">Scan Barcode Merchant</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cashier')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'cashier'
                      ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    paymentMethod === 'cashier' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-amber-600'
                  }`}>
                    <span className="material-symbols-outlined text-lg">storefront</span>
                  </div>
                  <div>
                    <h4 className="font-plus text-xs font-bold text-slate-900">Bayar di Kasir</h4>
                    <p className="font-plus text-[10px] text-slate-500">Tunai / EDC Kasir</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Payment Method Details Box */}
          {paymentMethod === 'midtrans' && (
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-blue-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-2xl">verified_user</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-anybody text-base font-extrabold text-slate-900">
                        Midtrans Payment Gateway Sandbox
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        Ready
                      </span>
                    </div>
                    <p className="font-plus text-xs text-slate-500">
                      Integrasi resmi Midtrans Snap Sandbox dengan dukungan berbagai channel pembayaran.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-700 block">QRIS & Gopay</span>
                  <span className="text-[9px] text-slate-400 font-mono">Real-time</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-700 block">BCA / BRI VA</span>
                  <span className="text-[9px] text-slate-400 font-mono">Auto Detect</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-700 block">ShopeePay</span>
                  <span className="text-[9px] text-slate-400 font-mono">Instant Pay</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-700 block">Mandiri Bill</span>
                  <span className="text-[9px] text-slate-400 font-mono">Virtual Account</span>
                </div>
              </div>

              {midtransConfig?.isConfigured ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                  <span>Midtrans Sandbox Server Key terhubung dan siap memproses transaksi Snap!</span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-amber-600">info</span>
                  <span>Midtrans Server Key dapat diatur di file <code>.env</code>. Saat ini mode simulator sandbox aktif untuk pengujian langsung.</span>
                </div>
              )}
            </div>
          )}

          {/* Interactive QRIS Module */}
          {paymentMethod === 'qris' && (
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
              <div className="w-64 h-64 sm:w-72 sm:h-72 border border-slate-200 p-3 rounded-3xl flex-shrink-0 bg-white flex flex-col items-center justify-center relative group overflow-hidden shadow-sm">
                {siteConfig?.qrisImageUrl ? (
                  <img 
                    src={siteConfig.qrisImageUrl} 
                    alt="Merchant QRIS Code" 
                    className="w-full h-full object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <>
                    <div className="w-full h-full bg-slate-950 p-1.5 rounded-lg flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-10 h-10 border-4 border-white rounded-sm bg-black flex-shrink-0"></div>
                        <div className="w-10 h-10 border-4 border-white rounded-sm bg-black flex-shrink-0"></div>
                      </div>
                      <div className="bg-red-600 text-white font-anybody font-black text-[9px] text-center tracking-widest py-0.5 rounded-xs">
                        QRIS GPN
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="w-10 h-10 border-4 border-white rounded-sm bg-black flex-shrink-0"></div>
                        <div className="flex flex-wrap gap-0.5 w-10 h-10 p-0.5">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                            <div key={i} className={`w-2 h-2 rounded-xs ${i % 3 === 0 ? 'bg-white' : 'bg-transparent'}`}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-0.5 rounded-sm font-anybody text-[8px] font-bold text-red-600 shadow-sm select-none">
                      HAUCHE
                    </div>
                  </>
                )}
              </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider font-mono uppercase mb-2">
                    <span className="material-symbols-outlined text-[10px] font-bold">hourglass_top</span>
                    Expiring in {formatTimer(qrisTimer)}
                  </div>
                  <h3 className="font-anybody text-lg font-extrabold text-slate-900 leading-tight">
                    Scan Barcode QRIS Seblak Hauche
                  </h3>
                  <p className="font-plus text-xs text-slate-500 leading-relaxed mt-2">
                    Simulasikan scan QRIS ini menggunakan aplikasi dompet digital favorit Anda (Gojek, OVO, Dana, ShopeePay, LinkAja) atau Mobile Banking Anda.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-mono text-xs flex justify-between text-slate-600">
                  <span>Nama Merchant:</span>
                  <span className="font-bold text-slate-900">Seblak Hauche Group</span>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'cashier' && (
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <span className="material-symbols-outlined text-amber-500 text-4xl">storefront</span>
              <div>
                <h3 className="font-anybody text-base font-extrabold text-slate-900">
                  Pembayaran Melalui Kasir 💵
                </h3>
                <p className="font-plus text-xs text-slate-500 leading-relaxed mt-1">
                  Pesan sekarang dan langsung sebutkan ID pesanan Anda kepada kasir. Pembayaran dapat diselesaikan menggunakan tunai, debit, atau QRIS Kasir.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Summary & Checkout CTA (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="font-anybody text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Pesanan Anda
              </h2>
              <button
                type="button"
                onClick={onNavigateToCart}
                className="text-xs text-orange-500 hover:text-orange-600 font-bold transition-colors cursor-pointer"
              >
                Edit
              </button>
            </div>

            {/* Short review */}
            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-1">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex justify-between text-xs font-plus">
                  <span className="text-slate-500">
                    {item.name} <span className="font-mono text-slate-400">x{selectedToppings[item.id]}</span>
                  </span>
                  <span className="font-bold text-slate-700 font-mono">
                    Rp {((selectedToppings[item.id] || 0) * item.price).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="space-y-3 mb-6 pt-4 border-t border-slate-100 font-plus text-[11px] text-slate-500">
              <div className="flex justify-between">
                <span>Soup Base</span>
                <span className="font-bold text-slate-900">{selectedSoup}</span>
              </div>
              <div className="flex justify-between">
                <span>Level Spicy</span>
                <span className="font-bold text-slate-900">Lvl {spiceLevel}</span>
              </div>
              {notes && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Catatan:</span>
                  <span className="text-[10px] text-slate-600 italic">"{notes}"</span>
                </div>
              )}
            </div>

            {/* Total Pricing info */}
            <div className="bg-slate-50 p-4 rounded-2xl mb-6 flex justify-between items-center border border-slate-100">
              <span className="text-xs font-bold text-slate-700">Total Tagihan</span>
              <span className="font-anybody text-base font-black text-slate-950">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Main Action Trigger */}
            <button
              id="checkout-submit-order-btn"
              disabled={isProcessingMidtrans}
              onClick={handleOrderSubmission}
              className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer font-plus text-sm shadow-lg disabled:opacity-50 ${
                paymentMethod === 'midtrans'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/10'
              }`}
            >
              {isProcessingMidtrans ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Menyiapkan Midtrans...</span>
                </>
              ) : paymentMethod === 'midtrans' ? (
                <>
                  <span className="material-symbols-outlined font-bold">credit_card</span>
                  <span>Bayar via Midtrans Sandbox</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined font-bold">shopping_bag</span>
                  <span>Buat Pesanan & Bayar</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onNavigateToCart}
            className="w-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1 font-plus text-xs"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Kembali ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
