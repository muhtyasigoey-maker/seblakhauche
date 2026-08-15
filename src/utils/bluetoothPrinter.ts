// Utility for Web Bluetooth ESC/POS Thermal Receipt Printing
// Compatible with 58mm and 80mm Bluetooth Thermal Printers (RPP02N, PT-210, POS-58, GOOJPRT, HOIN, MPT-II, etc.)

import { Order, SiteConfig } from '../types';

// Web Bluetooth Type Definitions for cross-browser type safety
export interface BluetoothDevice extends EventTarget {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

export interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryServices(): Promise<BluetoothRemoteGATTService[]>;
}

export interface BluetoothRemoteGATTService {
  uuid: string;
  getCharacteristics(): Promise<BluetoothRemoteGATTCharacteristic[]>;
}

export interface BluetoothRemoteGATTCharacteristic {
  uuid: string;
  properties: {
    write?: boolean;
    writeWithoutResponse?: boolean;
  };
  writeValueWithResponse(value: BufferSource): Promise<void>;
  writeValueWithoutResponse?(value: BufferSource): Promise<void>;
}

export interface BluetoothPrinterState {
  device: BluetoothDevice | null;
  server: BluetoothRemoteGATTServer | null;
  characteristic: BluetoothRemoteGATTCharacteristic | null;
  deviceName: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

// Global active printer connection reference for singleton connection persistence
let activeDevice: BluetoothDevice | null = null;
let activeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

export const isWebBluetoothSupported = (): boolean => {
  return typeof window !== 'undefined' && 'bluetooth' in (navigator as any);
};

// Common GATT Services used by ESC/POS Bluetooth Thermal Printers
const COMMON_PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer Service
  '00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile (SPP)
  '0000ff00-0000-1000-8000-00805f9b34fb', // Custom ESC/POS Service
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Hoin / MPT Printer
  '495353c2-5641-432e-6438-0805f9b34fb0', // POS-58 / ZJ Printer
  '0000e025-0000-1000-8000-00805f9b34fb'  // Generic POS
];

/**
 * Request user to pick a Bluetooth device and connect GATT service
 */
export const connectBluetoothPrinter = async (): Promise<{
  device: BluetoothDevice;
  characteristic: BluetoothRemoteGATTCharacteristic;
  deviceName: string;
}> => {
  if (!isWebBluetoothSupported()) {
    throw new Error('Web Bluetooth API tidak didukung di browser ini. Gunakan Google Chrome / Edge di Android atau PC.');
  }

  // Request Bluetooth Device
  const device: BluetoothDevice = await (navigator as any).bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: COMMON_PRINTER_SERVICES
  });

  if (!device || !device.gatt) {
    throw new Error('Gagal memilih perangkat Bluetooth.');
  }

  // Connect to GATT Server
  const server = await device.gatt.connect();

  // Find a service and characteristic that supports write
  let targetCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

  // Try known services first
  const services = await server.getPrimaryServices();

  for (const service of services) {
    try {
      const characteristics = await service.getCharacteristics();
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          targetCharacteristic = char;
          break;
        }
      }
    } catch {
      // Continue searching next service
    }
    if (targetCharacteristic) break;
  }

  if (!targetCharacteristic) {
    throw new Error(`Perangkat "${device.name || 'Bluetooth'}" terhubung tetapi tidak memiliki karakteristik cetak (write) ESC/POS yang cocok.`);
  }

  // Save active connection
  activeDevice = device;
  activeCharacteristic = targetCharacteristic;

  // Handle unexpected disconnects
  device.addEventListener('gattserverdisconnected', () => {
    activeDevice = null;
    activeCharacteristic = null;
  });

  return {
    device,
    characteristic: targetCharacteristic,
    deviceName: device.name || 'Printer Bluetooth POS'
  };
};

/**
 * Disconnect active printer
 */
export const disconnectBluetoothPrinter = async (): Promise<void> => {
  if (activeDevice && activeDevice.gatt && activeDevice.gatt.connected) {
    activeDevice.gatt.disconnect();
  }
  activeDevice = null;
  activeCharacteristic = null;
};

/**
 * Get active connection details
 */
export const getActivePrinter = (): {
  isConnected: boolean;
  deviceName: string | null;
} => {
  const isConnected = !!(activeDevice && activeDevice.gatt && activeDevice.gatt.connected && activeCharacteristic);
  return {
    isConnected,
    deviceName: isConnected ? (activeDevice?.name || 'Printer Bluetooth POS') : null
  };
};

/**
 * Print order directly to active connected Bluetooth printer
 */
export const printOrderToBluetoothPrinter = async (order: Order, siteConfig: SiteConfig): Promise<void> => {
  if (!activeCharacteristic || !activeDevice?.gatt?.connected) {
    throw new Error('Printer Bluetooth belum terhubung. Silakan hubungkan printer terlebih dahulu.');
  }

  const escPosData = generateEscPosReceipt(order, siteConfig);
  await sendEscPosToPrinter(activeCharacteristic, escPosData);
};

// --- ESC/POS COMMAND BUILDER ---

// Helper to format line columns (e.g. Left text + Right text fitted to 32 chars width)
const formatLineColumns = (left: string, right: string, width: number = 32): string => {
  const leftLen = left.length;
  const rightLen = right.length;
  
  if (leftLen + rightLen >= width) {
    // Truncate left if overflow
    const maxLeft = Math.max(1, width - rightLen - 1);
    return left.substring(0, maxLeft) + ' ' + right;
  }
  
  const spaces = ' '.repeat(width - leftLen - rightLen);
  return left + spaces + right;
};

/**
 * Generate ESC/POS Uint8Array command bytes for an Order Receipt (58mm thermal paper = 32 column width)
 */
export const generateEscPosReceipt = (order: Order, siteConfig: SiteConfig): Uint8Array => {
  const encoder = new TextEncoder();
  const buffer: number[] = [];

  // Command bytes
  const ESC = 0x1B;
  const GS = 0x1D;

  const pushBytes = (...bytes: number[]) => {
    buffer.push(...bytes);
  };

  const pushString = (text: string) => {
    const encoded = encoder.encode(text + '\n');
    buffer.push(...Array.from(encoded));
  };

  // 1. Initialize Printer (ESC @)
  pushBytes(ESC, 0x40);

  // Set Character Code Table to PC437 / Standard
  pushBytes(ESC, 0x74, 0x00);

  // 2. Header (Centered, Bold)
  pushBytes(ESC, 0x61, 0x01); // Center Align
  pushBytes(ESC, 0x45, 0x01); // Bold ON
  pushBytes(GS, 0x21, 0x11);  // Double Height & Width for Store Name
  pushString(siteConfig.siteLogoText || 'SEBLAK HAUCHE');

  pushBytes(GS, 0x21, 0x00);  // Normal text size
  pushBytes(ESC, 0x45, 0x00); // Bold OFF
  pushString(siteConfig.address || 'Majenang, Cilacap, Jawa Tengah');
  pushString(`WA: +${siteConfig.whatsappNumber}`);

  // Divider
  pushBytes(ESC, 0x61, 0x00); // Left Align
  pushString('--------------------------------');

  // 3. Meta Order Details
  pushString(formatLineColumns(`No. Struk:`, `#${order.id}`));
  pushString(formatLineColumns(`Tanggal:`, order.date || 'Hari ini'));
  pushString(formatLineColumns(`Kasir:`, 'Admin Dapur'));
  pushString(formatLineColumns(`Tipe Order:`, order.serviceType === 'dine_in' ? 'Dine-In' : 'Takeaway'));
  pushString(formatLineColumns(`Pelanggan:`, order.customerName));

  pushString('--------------------------------');

  // 4. Base Soup & Spice Level
  pushBytes(ESC, 0x45, 0x01); // Bold ON
  pushString(`KUAH : ${order.soupType.toUpperCase()}`);
  pushString(`PEDAS: LEVEL ${order.spiceLevel}`);
  pushBytes(ESC, 0x45, 0x00); // Bold OFF

  pushString('--------------------------------');

  // 5. Items List
  order.items.forEach(item => {
    const itemName = item.name;
    const qtyPrice = `${item.quantity}x @${item.price.toLocaleString('id-ID')}`;
    const itemSubtotal = `Rp ${(item.quantity * item.price).toLocaleString('id-ID')}`;

    pushString(itemName);
    pushString(formatLineColumns(`  ${qtyPrice}`, itemSubtotal));
  });

  pushString('--------------------------------');

  // 6. Total Summary
  const totalQty = order.items.reduce((acc, curr) => acc + curr.quantity, 0);
  pushString(formatLineColumns(`Total Topping:`, `${totalQty} pcs`));

  pushBytes(ESC, 0x45, 0x01); // Bold ON
  pushBytes(GS, 0x21, 0x01);  // Double Height
  pushString(formatLineColumns(`TOTAL:`, `Rp ${order.totalAmount.toLocaleString('id-ID')}`));
  pushBytes(GS, 0x21, 0x00);  // Normal size
  pushBytes(ESC, 0x45, 0x00); // Bold OFF

  // Customer Notes if available
  if (order.notes) {
    pushString('--------------------------------');
    pushString(`Catatan: ${order.notes}`);
  }

  pushString('--------------------------------');

  // 7. Footer Message
  pushBytes(ESC, 0x61, 0x01); // Center Align
  pushString('TERIMA KASIH ATAS KUNJUNGANNYA!');
  pushString('Pedas Nikmat, Seblak Pilihan Anda');
  pushString('IG: @seblak_hauche_majenang');

  // Feed lines & Cut space
  pushString('\n\n\n\n');

  // Full paper cut command (GS V 66 0)
  pushBytes(GS, 0x56, 0x42, 0x00);

  return new Uint8Array(buffer);
};

/**
 * Generate test receipt ESC/POS Uint8Array for testing printer connection
 */
export const generateTestReceipt = (siteConfig: SiteConfig): Uint8Array => {
  const dummyOrder: Order = {
    id: 'TEST-001',
    customerName: 'Pelanggan Uji Coba',
    customerPhone: '081234567890',
    serviceType: 'dine_in',
    spiceLevel: 3,
    soupType: 'Kuah Original Kencur',
    items: [
      { toppingId: 'top-1', name: 'Kerupuk Mawar Merah', quantity: 2, price: 1500 },
      { toppingId: 'top-4', name: 'Bakso Sapi Lengkap', quantity: 1, price: 3000 },
      { toppingId: 'top-6', name: 'Dumpling Keju Melt', quantity: 1, price: 4000 }
    ],
    subtotal: 10000,
    tax: 0,
    serviceFee: 0,
    totalAmount: 10000,
    status: 'completed',
    date: 'Baru Saja',
    notes: 'Tes koneksi printer bluetooth sukses!',
    paymentMethod: 'cashier'
  };

  return generateEscPosReceipt(dummyOrder, siteConfig);
};

/**
 * Send raw Uint8Array ESC/POS data to Bluetooth characteristic in safe chunks
 */
export const sendEscPosToPrinter = async (
  characteristic: BluetoothRemoteGATTCharacteristic,
  data: Uint8Array
): Promise<void> => {
  const CHUNK_SIZE = 64; // Safe chunk size for BLE MTU limits

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    
    if (characteristic.properties.writeWithoutResponse && characteristic.writeValueWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValueWithResponse(chunk);
    }

    // Small delay between chunks to allow low-speed thermal printers to process
    await new Promise(resolve => setTimeout(resolve, 30));
  }
};
