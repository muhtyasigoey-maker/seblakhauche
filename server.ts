import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Midtrans Configuration status (safe public info, never exposes server key)
  app.get('/api/midtrans/config', (req, res) => {
    const serverKey = (process.env.MIDTRANS_SERVER_KEY || '').trim();
    const clientKey = (process.env.MIDTRANS_CLIENT_KEY || '').trim();

    // Auto-detect production vs sandbox if not explicitly forced
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION !== undefined
      ? process.env.MIDTRANS_IS_PRODUCTION === 'true'
      : (serverKey.startsWith('Mid-server-') && !serverKey.startsWith('SB-'));

    const isConfigured = Boolean(
      serverKey &&
      serverKey !== '' &&
      !serverKey.includes('xxxxxxxx')
    );

    res.json({
      isConfigured,
      clientKey: isConfigured ? clientKey : '',
      isProduction,
      environment: isProduction ? 'production' : 'sandbox',
      snapUrl: isProduction
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js'
    });
  });

  // Create Midtrans Snap Transaction Token
  app.post('/api/midtrans/token', async (req, res) => {
    try {
      const { orderId, grossAmount, customerDetails, itemDetails } = req.body;

      if (!orderId || !grossAmount) {
        return res.status(400).json({
          error: 'Parameter orderId dan grossAmount wajib diisi.'
        });
      }

      const serverKey = (process.env.MIDTRANS_SERVER_KEY || '').trim();
      const isProduction = process.env.MIDTRANS_IS_PRODUCTION !== undefined
        ? process.env.MIDTRANS_IS_PRODUCTION === 'true'
        : (serverKey.startsWith('Mid-server-') && !serverKey.startsWith('SB-'));

      const isConfigured = Boolean(
        serverKey &&
        serverKey !== '' &&
        !serverKey.includes('xxxxxxxx')
      );

      // If Midtrans Server Key is configured, make real request to Midtrans Snap API
      if (isConfigured) {
        const snapEndpoint = isProduction
          ? 'https://app.midtrans.com/snap/v1/transactions'
          : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        const authHeader = `Basic ${Buffer.from(`${serverKey.trim()}:`).toString('base64')}`;

        // Format items to match gross_amount
        const sanitizedItems = Array.isArray(itemDetails) && itemDetails.length > 0
          ? itemDetails.map((item: { id: string; name: string; price: number; quantity: number }) => ({
              id: String(item.id || 'item'),
              price: Math.round(Number(item.price) || 0),
              quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
              name: String(item.name || 'Item').slice(0, 50)
            }))
          : undefined;

        const payload = {
          transaction_details: {
            order_id: String(orderId),
            gross_amount: Math.round(Number(grossAmount))
          },
          customer_details: {
            first_name: customerDetails?.firstName || 'Pelanggan',
            phone: customerDetails?.phone || '',
            email: customerDetails?.email || 'customer@seblakhauce.com'
          },
          ...(sanitizedItems ? { item_details: sanitizedItems } : {}),
          callbacks: {
            finish: `${process.env.APP_URL || ''}/#tracking`
          }
        };

        const response = await fetch(snapEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
          console.warn('[Midtrans API Error]:', data);
          return res.status(response.status).json({
            error: data.error_messages ? data.error_messages.join(', ') : 'Gagal menghubungi Midtrans Snap API.',
            details: data,
            isSandbox: !isProduction
          });
        }

        return res.json({
          success: true,
          token: data.token,
          redirectUrl: data.redirect_url,
          mode: isProduction ? 'production' : 'sandbox',
          isConfigured: true
        });
      }

      // Fallback: Graceful Sandbox Simulator Token for instant testing when API key is not yet set
      console.log(`[Midtrans Sandbox Simulator] Creating simulation token for order ${orderId}`);
      const mockToken = `DEMO_SANDBOX_SNAP_${orderId}_${Date.now()}`;
      
      return res.json({
        success: true,
        token: mockToken,
        redirectUrl: '#',
        mode: 'demo_sandbox',
        isConfigured: false,
        message: 'Midtrans Server Key belum diisi di .env. Menggunakan simulator Midtrans Sandbox terintegrasi.'
      });

    } catch (err: any) {
      console.error('[Midtrans Server Handler Error]:', err);
      return res.status(500).json({
        error: err.message || 'Terjadi kesalahan pada server saat memproses transaksi Midtrans.'
      });
    }
  });

  // Check Midtrans Transaction Status
  app.get('/api/midtrans/status/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      const serverKey = (process.env.MIDTRANS_SERVER_KEY || '').trim();
      const isProduction = process.env.MIDTRANS_IS_PRODUCTION !== undefined
        ? process.env.MIDTRANS_IS_PRODUCTION === 'true'
        : (serverKey.startsWith('Mid-server-') && !serverKey.startsWith('SB-'));

      if (!serverKey || serverKey.includes('xxxxxxxx')) {
        return res.json({
          orderId,
          transactionStatus: 'settlement',
          paymentType: 'qris_midtrans_simulation',
          mode: 'demo_sandbox'
        });
      }

      const statusEndpoint = isProduction
        ? `https://api.midtrans.com/v2/${orderId}/status`
        : `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

      const authHeader = `Basic ${Buffer.from(`${serverKey.trim()}:`).toString('base64')}`;

      const response = await fetch(statusEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': authHeader
        }
      });

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error('[Midtrans Status Check Error]:', err);
      res.status(500).json({ error: err.message || 'Gagal mengecek status transaksi Midtrans' });
    }
  });

  // Midtrans Webhook Notification Handler
  app.post('/api/midtrans/notification', (req, res) => {
    try {
      const notification = req.body;
      console.log('[Midtrans Webhook Received]:', {
        order_id: notification?.order_id,
        transaction_status: notification?.transaction_status,
        payment_type: notification?.payment_type,
        gross_amount: notification?.gross_amount
      });

      // Acknowledge receipt to Midtrans
      res.status(200).json({ status: 'ok', message: 'Notification received' });
    } catch (err: any) {
      console.error('[Midtrans Notification Handler Error]:', err);
      res.status(500).json({ error: 'Failed to process notification' });
    }
  });

  // Vite middleware for development vs static build serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
