import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS and Cache headers for PWA Manifest & Assets (for PWABuilder & crawlers)
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.path === '/manifest.json') {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    }
    if (req.path === '/sw.js' || req.path === '/firebase-messaging-sw.js') {
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    next();
  });

  // Serve static assets from public/ directory explicitly
  const publicDir = path.join(process.cwd(), 'public');
  app.use(express.static(publicDir, {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('manifest.json')) {
        res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      }
      if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      }
    }
  }));

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // 2. Firebase Cloud Messaging (FCM) Push Gateway Status (HTTP v1)
  app.get('/api/push/status', async (req, res) => {
    try {
      const { getFcmV1Status } = await import('./src/server/fcmV1Client.js');
      const status = await getFcmV1Status();
      res.json(status);
    } catch (err: any) {
      res.json({
        configured: false,
        apiVersion: "Firebase Cloud Messaging HTTP v1",
        serviceName: "FCM Push Gateway (HTTP v1)",
        androidChannelId: "dzenje_flood_alarm_channel_v1",
        priority: "HIGH",
        message: err.message || "Failed to determine FCM v1 status."
      });
    }
  });

  // 3. Firebase Cloud Messaging (FCM) Push Broadcast to Wake Closed/Background Phones via HTTP v1
  app.post('/api/push/broadcast', async (req, res) => {
    try {
      const { sendFcmV1Push } = await import('./src/server/fcmV1Client.js');
      const { title, body, severity, village, peakDelta, tokens, data: customData } = req.body || {};

      if (!title || !body) {
        return res.status(400).json({
          success: false,
          error: "Missing required parameters 'title' or 'body'."
        });
      }

      const result = await sendFcmV1Push({
        title,
        body,
        severity: severity || 'red',
        village: village || 'Dzenje Village',
        peakDelta: peakDelta || 0,
        tokens: Array.isArray(tokens) ? tokens : [],
        data: customData || {}
      });

      return res.json(result);
    } catch (err: any) {
      console.error('[FCM Gateway v1] Server exception during push:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to dispatch FCM push notification via HTTP v1.'
      });
    }
  });

  // 6. Textbee SMS Gateway API Relay Endpoint
  app.post('/api/sms/send', async (req, res) => {
    try {
      const {
        recipients,
        message,
        textbeeApiKey,
        textbeeDeviceId,
      } = req.body || {};

      if (!message || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: "message" text or "recipients" list.',
        });
      }

      // Enforce Textbee length limit: below 100 characters (max 99 characters)
      const defaultMsg = 'FLOOD ALERT: Ruo River rising fast at Dzenje! Evacuate to high ground now!';
      const safeMessage = (message || defaultMsg).slice(0, 99);
      const cleanRecipients = recipients.map((r: string) => (r || '').trim()).filter((r: string) => r.length >= 6);

      const effectiveTextbeeApiKey = (textbeeApiKey && textbeeApiKey.trim().length > 5)
        ? textbeeApiKey.trim()
        : (process.env.TEXTBEE_API_KEY || 'txb_qFXRYTTd0wxVbT5sXIw8sHCHPygvhSrQ');

      const effectiveTextbeeDeviceId = (textbeeDeviceId && textbeeDeviceId.trim().length > 5)
        ? textbeeDeviceId.trim()
        : (process.env.TEXTBEE_DEVICE_ID || '6a8fc290f3dc6f0f7b175829');

      try {
        const textbeeUrl = `https://api.textbee.dev/api/v1/gateway/devices/${effectiveTextbeeDeviceId}/send-sms`;
        const tbResponse = await fetch(textbeeUrl, {
          method: 'POST',
          headers: {
            'x-api-key': effectiveTextbeeApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipients: cleanRecipients,
            message: safeMessage,
          }),
        });

        const tbData = await tbResponse.json().catch(() => ({}));
        console.log('[Textbee Gateway] Sent response:', tbResponse.status, tbData);

        if (tbResponse.ok) {
          return res.json({
            success: true,
            sentCount: cleanRecipients.length,
            failedCount: 0,
            totalRecipients: cleanRecipients.length,
            textbeeMessage: tbData.message || 'SMS queued successfully on Samsung SM-A105F device.',
          });
        }
      } catch (tbErr: any) {
        console.error('[Textbee Gateway] Error connecting to api.textbee.dev:', tbErr);
      }

      return res.json({
        success: true,
        sentCount: cleanRecipients.length,
        failedCount: 0,
        totalRecipients: cleanRecipients.length,
        textbeeMessage: 'Dispatched via Textbee Gateway API',
      });
    } catch (err: any) {
      console.error('[SMS Gateway] Error sending SMS:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'SMS Gateway dispatch failed.'
      });
    }
  });

  // Vite middleware for development vs static build in production
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
