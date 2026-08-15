import React from 'react';
import { SiteConfig } from '../types';
import {
  isWebBluetoothSupported,
  connectBluetoothPrinter,
  disconnectBluetoothPrinter,
  getActivePrinter,
  generateTestReceipt,
  sendEscPosToPrinter,
  BluetoothRemoteGATTCharacteristic
} from '../utils/bluetoothPrinter';

interface BluetoothPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  onPrinterStatusChange?: (isConnected: boolean, deviceName: string | null) => void;
}

export const BluetoothPrinterModal: React.FC<BluetoothPrinterModalProps> = ({
  isOpen,
  onClose,
  siteConfig,
  onPrinterStatusChange
}) => {
  const [isSupported, setIsSupported] = React.useState(true);
  const [isConnected, setIsConnected] = React.useState(false);
  const [deviceName, setDeviceName] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isTestPrinting, setIsTestPrinting] = React.useState(false);
  const [isIframeBlocked, setIsIframeBlocked] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);
  const activeCharRef = React.useRef<BluetoothRemoteGATTCharacteristic | null>(null);

  const isInIframe = React.useMemo(() => {
    try {
      return typeof window !== 'undefined' && window.self !== window.top;
    } catch {
      return true;
    }
  }, []);

  React.useEffect(() => {
    const supported = isWebBluetoothSupported();
    setIsSupported(supported);

    // Check active connection status
    const active = getActivePrinter();
    setIsConnected(active.isConnected);
    setDeviceName(active.deviceName);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setIsIframeBlocked(false);
    setStatusMessage({ text: 'Mencari perangkat Bluetooth di sekitar...', type: 'info' });

    try {
      const result = await connectBluetoothPrinter();
      activeCharRef.current = result.characteristic;
      setIsConnected(true);
      setDeviceName(result.deviceName);
      setStatusMessage({
        text: `Berhasil terhubung dengan printer "${result.deviceName}"!`,
        type: 'success'
      });

      if (onPrinterStatusChange) {
        onPrinterStatusChange(true, result.deviceName);
      }
    } catch (err: any) {
      console.error('Bluetooth Connection Error:', err);
      if (err.name === 'NotFoundError') {
        setStatusMessage({ text: 'Pencarian dibatalkan oleh pengguna.', type: 'info' });
      } else if (
        err.name === 'SecurityError' ||
        err.message?.includes('disallowed by permissions policy') ||
        err.message?.includes('permissions policy')
      ) {
        setIsIframeBlocked(true);
        setStatusMessage({
          text: 'Akses Web Bluetooth diblokir oleh kebijakan keamanan iframe preview. Buka aplikasi di Tab Baru untuk mengaktifkan Bluetooth.',
          type: 'error'
        });
      } else {
        setStatusMessage({
          text: err.message || 'Gagal menghubungkan printer Bluetooth. Pastikan Bluetooth aktif dan printer dinyalakan.',
          type: 'error'
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectBluetoothPrinter();
      activeCharRef.current = null;
      setIsConnected(false);
      setDeviceName(null);
      setStatusMessage({ text: 'Koneksi printer Bluetooth telah diputuskan.', type: 'info' });

      if (onPrinterStatusChange) {
        onPrinterStatusChange(false, null);
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Gagal memutuskan koneksi.', type: 'error' });
    }
  };

  const handleTestPrint = async () => {
    if (!activeCharRef.current) {
      setStatusMessage({ text: 'Printer belum terhubung. Silakan sambungkan printer terlebih dahulu.', type: 'error' });
      return;
    }

    setIsTestPrinting(true);
    setStatusMessage({ text: 'Mengirimkan dokumen uji cetak ke printer Bluetooth...', type: 'info' });

    try {
      const testData = generateTestReceipt(siteConfig);
      await sendEscPosToPrinter(activeCharRef.current, testData);
      setStatusMessage({ text: '✅ Uji cetak struk berhasil terkirim ke printer!', type: 'success' });
    } catch (err: any) {
      console.error('Test Print Error:', err);
      setStatusMessage({ text: `❌ Gagal mencetak: ${err.message || 'Koneksi terputus'}. Cobalah sambungkan ulang.`, type: 'error' });
    } finally {
      setIsTestPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-xl">bluetooth_searching</span>
            </div>
            <div>
              <h3 className="font-anybody text-sm font-black text-slate-900 uppercase tracking-wider">
                Printer Thermal Bluetooth
              </h3>
              <p className="font-plus text-[10px] text-slate-500">Cetak Struk Langsung Tanpa Kabel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-sm font-bold">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">

          {/* Status Badge */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
            isConnected 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className={`w-3 h-3 rounded-full shrink-0 ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}></div>
            <div className="flex-1">
              <span className="font-plus text-xs font-extrabold block">
                {isConnected ? `Terhubung: ${deviceName}` : 'Status: Belum Terhubung'}
              </span>
              <span className="font-plus text-[10px] text-slate-500">
                {isConnected 
                  ? 'Printer siap menerima perintah cetak struk kasir'
                  : 'Klik tombol di bawah untuk menyambungkan printer Bluetooth 58mm/80mm'
                }
              </span>
            </div>
          </div>

          {/* Status Message Alert */}
          {statusMessage && (
            <div className={`p-3.5 rounded-xl text-xs font-plus flex items-start gap-2 ${
              statusMessage.type === 'success' ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200' :
              statusMessage.type === 'error' ? 'bg-red-100/80 text-red-800 border border-red-200' :
              'bg-blue-100/80 text-blue-800 border border-blue-200'
            }`}>
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">
                {statusMessage.type === 'success' ? 'check_circle' : statusMessage.type === 'error' ? 'error' : 'info'}
              </span>
              <span className="leading-snug">{statusMessage.text}</span>
            </div>
          )}

          {/* Iframe Notice & Open in New Tab Action */}
          {(isInIframe || isIframeBlocked) && !isConnected && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-plus space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-indigo-900">
                <span className="material-symbols-outlined text-base text-indigo-600">open_in_new</span>
                <span>Akses Bluetooth di Preview Iframe</span>
              </div>
              <p className="text-[11px] text-indigo-700 leading-relaxed">
                Browser memblokir pemindaian Bluetooth jika aplikasi dijalankan di dalam frame preview. Silakan buka di <strong>Tab Baru</strong> untuk menghubungkan printer secara langsung.
              </p>
              <button
                onClick={handleOpenNewTab}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">open_in_new</span>
                <span>Buka Aplikasi di Tab Baru (Disarankan)</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={!isSupported || isConnecting}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 font-plus shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">
                  {isConnecting ? 'sync' : 'bluetooth_searching'}
                </span>
                {isConnecting ? 'Sedang Memindai Printer...' : 'Cari & Sambungkan Printer Bluetooth'}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleTestPrint}
                  disabled={isTestPrinting}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 px-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-plus shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  {isTestPrinting ? 'Mencetak...' : 'Uji Cetak Struk'}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-plus"
                >
                  <span className="material-symbols-outlined text-base">bluetooth_disabled</span>
                  Putuskan
                </button>
              </div>
            )}
          </div>

          {/* Compatible Printer Info Guide */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[11px] font-plus text-slate-600 space-y-2">
            <span className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-blue-600">print_connect</span>
              Panduan & Printer Didukung:
            </span>
            <ul className="list-disc list-inside space-y-1 text-[10.5px] leading-relaxed text-slate-600">
              <li>Mendukung printer thermal kasir <strong>58mm & 80mm</strong> (contoh: RPP02N, PT-210, POS-58, GOOJPRT, HOIN, MPT-II, DLL).</li>
              <li>Pastikan Bluetooth printer sudah dinyalakan & dipasangkan (paired) di Pengaturan Bluetooth HP/Laptop Anda.</li>
              <li>Jika koneksi gagal, hidupkan ulang printer Bluetooth lalu coba sambungkan kembali.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl text-xs cursor-pointer font-plus transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
