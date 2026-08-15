// Midtrans Sandbox Client Utility
export interface MidtransConfig {
  isConfigured: boolean;
  clientKey: string;
  isProduction: boolean;
  environment: 'sandbox' | 'production';
  snapUrl: string;
}

export interface MidtransSnapResult {
  status_code?: string;
  status_message?: string;
  transaction_id?: string;
  order_id?: string;
  gross_amount?: string;
  payment_type?: string;
  transaction_time?: string;
  transaction_status?: string;
  fraud_status?: string;
  pdf_url?: string;
  finish_redirect_url?: string;
}

// Global declaration for window.snap
declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: MidtransSnapResult) => void;
          onPending?: (result: MidtransSnapResult) => void;
          onError?: (result: MidtransSnapResult) => void;
          onClose?: () => void;
        }
      ) => void;
      embed?: (token: string, options: any) => void;
    };
  }
}

let isScriptLoading = false;
let isScriptLoaded = false;

/**
 * Fetch Midtrans Config from the backend
 */
export async function getMidtransConfig(): Promise<MidtransConfig> {
  try {
    const res = await fetch('/api/midtrans/config');
    if (!res.ok) throw new Error('Gagal memuat konfigurasi Midtrans');
    return await res.json();
  } catch (err) {
    console.warn('[Midtrans] Fallback to default sandbox config:', err);
    return {
      isConfigured: false,
      clientKey: '',
      isProduction: false,
      environment: 'sandbox',
      snapUrl: 'https://app.sandbox.midtrans.com/snap/snap.js'
    };
  }
}

/**
 * Dynamically load the Midtrans Snap JS SDK
 */
export async function loadMidtransSnapScript(clientKey?: string, snapUrl?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.snap) return true;
  if (isScriptLoaded) return true;
  if (isScriptLoading) {
    // Wait for existing load promise
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (window.snap) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(Boolean(window.snap));
      }, 5000);
    });
  }

  isScriptLoading = true;

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = snapUrl || 'https://app.sandbox.midtrans.com/snap/snap.js';
    if (clientKey) {
      script.setAttribute('data-client-key', clientKey);
    }
    script.async = true;
    script.onload = () => {
      isScriptLoading = false;
      isScriptLoaded = true;
      resolve(true);
    };
    script.onerror = (err) => {
      console.warn('[Midtrans] Failed to load snap.js script:', err);
      isScriptLoading = false;
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Request a Snap Token from backend
 */
export async function createMidtransTransaction(params: {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    firstName: string;
    phone: string;
    email?: string;
  };
  itemDetails: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}): Promise<{
  token: string;
  redirectUrl?: string;
  mode: 'sandbox' | 'production' | 'demo_sandbox';
  isConfigured: boolean;
  message?: string;
}> {
  const response = await fetch('/api/midtrans/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Gagal membuat sesi pembayaran Midtrans.');
  }

  return data;
}
