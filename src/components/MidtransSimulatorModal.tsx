import React, { useState } from 'react';

interface MidtransSimulatorModalProps {
  isOpen: boolean;
  orderId: string;
  grossAmount: number;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  onSuccess: (paymentType: string) => void;
  onPending: (paymentType: string) => void;
  onClose: () => void;
}

export default function MidtransSimulatorModal({
  isOpen,
  orderId,
  grossAmount,
  customerName,
  items,
  onSuccess,
  onPending,
  onClose
}: MidtransSimulatorModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<'qris' | 'gopay' | 'shopeepay' | 'bca_va' | 'bri_va' | 'mandiri_va'>('qris');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(selectedChannel);
    }, 1200);
  };

  const channelNames: Record<string, string> = {
    qris: 'QRIS (Gopay, OVO, DANA, ShopeePay)',
    gopay: 'GoPay / GoPay Later',
    shopeepay: 'ShopeePay',
    bca_va: 'BCA Virtual Account',
    bri_va: 'BRI Virtual Account (BRIVA)',
    mandiri_va: 'Mandiri Bill Payment'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs font-plus">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Midtrans Branding */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined text-white text-xl">payments</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-anybody text-base font-black tracking-tight">midtrans</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full font-mono">
                  SANDBOX
                </span>
              </div>
              <p className="text-blue-100 text-xs mt-0.5">Payment Gateway Simulator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-400 font-mono">Order ID: </span>
            <span className="font-bold text-slate-800 font-mono">{orderId}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400">Total: </span>
            <span className="font-bold text-blue-700 font-mono text-sm">
              Rp {grossAmount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Payment Channels Grid */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3 font-anybody">
              Pilih Metode Pembayaran Midtrans:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* QRIS */}
              <button
                type="button"
                onClick={() => setSelectedChannel('qris')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedChannel === 'qris'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 font-bold">
                  <span className="material-symbols-outlined text-base">qr_code_2</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">QRIS Instant</h4>
                  <p className="text-[10px] text-slate-500 truncate">Gopay, OVO, Dana, Shopee</p>
                </div>
              </button>

              {/* GoPay */}
              <button
                type="button"
                onClick={() => setSelectedChannel('gopay')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedChannel === 'gopay'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0 font-bold">
                  <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">GoPay / Later</h4>
                  <p className="text-[10px] text-slate-500 truncate">Instant App Deep Link</p>
                </div>
              </button>

              {/* ShopeePay */}
              <button
                type="button"
                onClick={() => setSelectedChannel('shopeepay')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedChannel === 'shopeepay'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 font-bold">
                  <span className="material-symbols-outlined text-base">shopping_bag</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">ShopeePay</h4>
                  <p className="text-[10px] text-slate-500 truncate">Cashback & Saldo</p>
                </div>
              </button>

              {/* BCA VA */}
              <button
                type="button"
                onClick={() => setSelectedChannel('bca_va')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedChannel === 'bca_va'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold">
                  <span className="material-symbols-outlined text-base">account_balance</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">BCA Virtual Account</h4>
                  <p className="text-[10px] text-slate-500 truncate">Verifikasi Otomatis</p>
                </div>
              </button>

              {/* BRI VA */}
              <button
                type="button"
                onClick={() => setSelectedChannel('bri_va')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedChannel === 'bri_va'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center flex-shrink-0 font-bold">
                  <span className="material-symbols-outlined text-base">account_balance</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">BRIVA (Bank BRI)</h4>
                  <p className="text-[10px] text-slate-500 truncate">BRImo & ATM</p>
                </div>
              </button>

              {/* Mandiri VA */}
              <button
                type="button"
                onClick={() => setSelectedChannel('mandiri_va')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedChannel === 'mandiri_va'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 font-bold">
                  <span className="material-symbols-outlined text-base">account_balance</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">Mandiri Bill Payment</h4>
                  <p className="text-[10px] text-slate-500 truncate">Livin' by Mandiri</p>
                </div>
              </button>
            </div>
          </div>

          {/* Sandbox Info Box */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-[11px] text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-800">
              <span className="material-symbols-outlined text-sm">science</span>
              <span>Midtrans Sandbox Mode Aktif</span>
            </div>
            <p className="text-blue-700/90 leading-relaxed">
              Anda sedang menguji integrasi Midtrans Sandbox. Klik tombol <strong>"Bayar Sekarang (Simulasi Berhasil)"</strong> di bawah untuk menguji alur pelunasan otomatis.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 space-y-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleSimulatePayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Memproses Pembayaran Sandbox...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Bayar Rp {grossAmount.toLocaleString('id-ID')} ({channelNames[selectedChannel]})</span>
              </>
            )}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPending(selectedChannel)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Simulasi Pending (VA)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
