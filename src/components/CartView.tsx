import React from 'react';
import { Topping, SoupType, PaymentMethod } from '../types';
import ChiliFlameIcon from './ChiliFlameIcon';

interface CartViewProps {
  toppings: Topping[];
  selectedToppings: { [id: string]: number };
  onAddTopping: (id: string) => void;
  onRemoveTopping: (id: string) => void;
  onDeleteTopping: (id: string) => void;
  selectedSoup: SoupType;
  spiceLevel: number;
  onNavigateToMenu: () => void;
  onProceedToCheckout: (notes: string, paymentMethod: PaymentMethod) => void;
}

export default function CartView({
  toppings,
  selectedToppings,
  onAddTopping,
  onRemoveTopping,
  onDeleteTopping,
  selectedSoup,
  spiceLevel,
  onNavigateToMenu,
  onProceedToCheckout
}: CartViewProps) {
  const [notes, setNotes] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('midtrans');

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
  const deliveryFee = 0; // FREE or dine-in
  const grandTotal = subtotal + tax + serviceFee + deliveryFee;

  const spiceLevels = [
    { level: 0, title: 'Lvl 0: Santuy', emoji: '🍃', desc: 'Tanpa Cabai' },
    { level: 1, title: 'Lvl 1: Hangat', emoji: '🌶️', desc: 'Cabai Tipis' },
    { level: 2, title: 'Lvl 2: Nikmat', emoji: '💥', desc: 'Pedas Sedang' },
    { level: 3, title: 'Lvl 3: Nangis', emoji: '🔥', desc: 'Sangat Pedas' },
    { level: 4, title: 'Lvl 4: Jerit', emoji: '⚡', desc: 'Ekstra Pedas' },
    { level: 5, title: 'Lvl 5: Kesurupan', emoji: '☠️', desc: 'Maksimal Pedas' }
  ];

  if (selectedItems.length === 0) {
    return (
      <div id="cart-view-empty" className="max-w-md mx-auto text-center py-16 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        <span className="material-symbols-outlined text-red-500 text-6xl font-bold mb-4 animate-bounce">
          shopping_basket
        </span>
        <h2 className="font-anybody text-2xl font-extrabold text-slate-900 mb-2">
          Nampan Pedasmu Kosong!
        </h2>
        <p className="font-plus text-sm text-slate-500 mb-8 leading-relaxed">
          Kamu belum memilih topping seblak satu pun. Yuk, racik seblak prasmanan ter-hauche-mu sekarang!
        </p>
        <button
          onClick={onNavigateToMenu}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer shadow-lg shadow-orange-500/20 font-plus"
        >
          Mulai Pilih Topping
        </button>
      </div>
    );
  }

  return (
    <div id="cart-view" className="w-full">
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-anybody text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
          Your Spicy Tray
        </h1>
        <p className="font-plus text-slate-500 text-sm md:text-base">
          Tinjau racikan seblak prasmananmu sebelum melanjutkan ke pemesanan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Soup & Spice Status Card */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-4">
              <ChiliFlameIcon level={spiceLevel} size="md" className="w-12 h-12" />
              <div>
                <span className="text-xs text-yellow-400 font-mono font-bold block uppercase tracking-wider">
                  RACIKAN UTAMA
                </span>
                <h3 className="font-anybody text-lg font-bold">
                  {selectedSoup}
                </h3>
                <p className="font-plus text-xs text-slate-400">
                  Pedas {spiceLevels[spiceLevel].title} ({spiceLevel * 2} Sendok Cabai)
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToMenu}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/10 transition-colors cursor-pointer font-plus"
            >
              <span className="material-symbols-outlined text-xs">edit</span>
              Ubah Racikan
            </button>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
              <h2 className="font-anybody text-sm font-bold text-slate-900 uppercase tracking-wide">
                Daftar Topping Terpilih
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {selectedItems.map((item) => {
                const qty = selectedToppings[item.id] || 0;
                const itemSubtotal = qty * item.price;

                return (
                  <div
                    key={item.id}
                    id={`cart-item-${item.id}`}
                    className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors"
                  >
                    {/* Item Info */}
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-mono uppercase">
                          {item.category}
                        </span>
                        <h3 className="font-plus text-sm font-bold text-slate-900 mt-1">
                          {item.name}
                        </h3>
                        <p className="font-plus text-xs text-slate-400 font-mono">
                          Rp {item.price.toLocaleString('id-ID')} / pcs
                        </p>
                      </div>
                    </div>

                    {/* Adjusters & Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      {/* Quantity control */}
                      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-0.5">
                        <button
                          onClick={() => onRemoveTopping(item.id)}
                          className="w-7 h-7 flex items-center justify-center font-bold text-slate-700 hover:bg-white rounded-md transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs font-bold">remove</span>
                        </button>
                        <span className="text-xs font-bold px-2 font-mono text-slate-900">
                          {qty}
                        </span>
                        <button
                          onClick={() => {
                            if (qty < item.stock) {
                              onAddTopping(item.id);
                            }
                          }}
                          disabled={qty >= item.stock}
                          className={`w-7 h-7 flex items-center justify-center font-bold text-slate-700 hover:bg-white rounded-md transition-colors ${
                            qty >= item.stock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs font-bold">add</span>
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <div className="text-right min-w-[90px]">
                        <span className="font-plus text-xs text-slate-400 font-mono block">Subtotal</span>
                        <span className="font-plus text-sm font-extrabold text-slate-900">
                          Rp {itemSubtotal.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDeleteTopping(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-slate-400">notes</span>
              <label htmlFor="spice-notes" className="font-anybody text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Spice Notes & Special Requests
              </label>
            </div>
            <textarea
              id="spice-notes"
              rows={3}
              placeholder="Contoh: Kencur agak banyak teh, tidak pakai seledri, kuah dipisah, atau request alat makan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl p-4 font-plus text-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-hidden resize-none leading-relaxed"
            ></textarea>
          </div>
        </div>

        {/* Right Column: Cost Breakdown & Payment (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Cost Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="font-anybody text-base font-extrabold text-slate-900 mb-6 pb-4 border-b border-slate-100">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 font-plus text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal Toppings</span>
                <span className="font-mono font-bold text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Pajak Resto (10%)</span>
                <span className="font-mono font-bold text-slate-800">Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Biaya Pelayanan</span>
                <span className="font-mono font-bold text-slate-800">Rp {serviceFee.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Biaya Pengiriman</span>
                <span className="text-green-600 font-bold font-mono">GRATIS</span>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                <span className="font-bold text-sm text-slate-900">Grand Total</span>
                <span className="font-anybody text-lg font-black text-orange-600">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-6">
              <span className="font-anybody text-xs font-extrabold text-slate-900 uppercase tracking-wide block mb-3">
                Pilihan Metode Pembayaran
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  id="pay-midtrans-btn"
                  onClick={() => setPaymentMethod('midtrans')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'midtrans'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl text-blue-600">credit_card</span>
                  <span className="text-[10px] font-plus font-bold uppercase tracking-tight">Midtrans Snap</span>
                  <span className="text-[8px] text-slate-400 font-mono">VA / E-Wallet</span>
                </button>

                <button
                  id="pay-qris-btn"
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'qris'
                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold ring-1 ring-orange-500'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl text-orange-600">qr_code_2</span>
                  <span className="text-[10px] font-plus font-bold uppercase tracking-tight">QRIS Merchant</span>
                  <span className="text-[8px] text-slate-400 font-mono">Scan Langsung</span>
                </button>

                <button
                  id="pay-cashier-btn"
                  onClick={() => setPaymentMethod('cashier')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'cashier'
                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold ring-1 ring-orange-500'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl text-amber-600">point_of_sale</span>
                  <span className="text-[10px] font-plus font-bold uppercase tracking-tight">Bayar di Kasir</span>
                  <span className="text-[8px] text-slate-400 font-mono">Tunai / Debit</span>
                </button>
              </div>
            </div>

            {/* Warning Note */}
            <div className="bg-yellow-50 text-yellow-800 text-[10px] p-3 rounded-xl mb-6 flex gap-2 border border-yellow-100 leading-relaxed font-plus">
              <span className="material-symbols-outlined text-base text-yellow-600 flex-shrink-0 font-bold">info</span>
              <span>Pastikan racikan kuah dan jumlah toppings sudah sesuai selera sebelum menekan tombol konfirmasi.</span>
            </div>

            {/* Checkout CTA */}
            <button
              id="cart-confirm-checkout-btn"
              onClick={() => onProceedToCheckout(notes, paymentMethod)}
              className="w-full bg-slate-950 hover:bg-slate-850 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer font-plus shadow-md"
            >
              <span className="material-symbols-outlined">payments</span>
              Lanjut Konfirmasi
            </button>
          </div>

          {/* Add more toppings */}
          <button
            onClick={onNavigateToMenu}
            className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 font-plus text-xs"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            Tambahkan Topping Lain
          </button>
        </div>
      </div>
    </div>
  );
}
