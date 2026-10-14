import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FCM_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'automatic-flood-alert';
const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

/** Parse service account from env (full JSON string) or individual fields. */
function getServiceAccount(): { client_email: string; private_key: string; project_id?: string } | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (raw && raw.trim().length > 50) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.client_email && parsed.private_key) {
        return parsed;
      }
    } catch (e) {
      console.error('[FCM v1] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e);
    }
  }
  // Optional: base64-encoded JSON
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (b64 && b64.trim().length > 50) {
    try {
      const parsed = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
      if (parsed.client_email && parsed.private_key) return parsed;
    } catch (e) {
      console.error('[FCM v1] Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:', e);
    }
  }
  return null;
}

/** Create a short-lived OAuth2 access token from the service account (JWT). */
async function getAccessToken(sa: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: FCM_SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const b64url = (obj: object | string) => {
    const s = typeof obj === 'string' ? obj : JSON.stringify(obj);
    return Buffer.from(s)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const unsigned = `${b64url(header)}.${b64url(claim)}`;
  const key = sa.private_key.replace(/\\n/g, '\n');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsigned);
  sign.end();
  const signature = sign
    .sign(key)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${unsigned}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenJson: any = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || !tokenJson.access_token) {
    throw new Error(
      `Failed to mint FCM access token: ${tokenJson.error || tokenRes.statusText} ${tokenJson.error_description || ''}`
    );
  }
  return tokenJson.access_token as string;
}

/** Send one high-priority Android message via FCM HTTP v1. */
async function sendFcmV1(
  accessToken: string,
  projectId: string,
  token: string,
  title: string,
  body: string,
  data: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  const message = {
    message: {
      token,
      notification: {
        title,
        body,
      },
      android: {
        priority: 'high' as const,
        ttl: '86400s',
        notification: {
          channelId: 'dzenje_flood_alarm_channel_v1',
          sound: 'default',
          defaultSound: true,
          defaultVibrateTimings: true,
          notificationPriority: 'PRIORITY_MAX',
          visibility: 'PUBLIC',
          tag: 'flood_emergency',
          clickAction: 'FLDT_ALARM_OPEN',
        },
      },
      data: {
        title,
        body,
        ...data,
      },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg = json?.error?.message || res.statusText || 'FCM v1 send failed';
    return { success: false, error: errMsg };
  }
  return { success: true };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

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

  const publicDir = path.join(process.cwd(), 'public');
  app.use(
    express.static(publicDir, {
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('manifest.json')) {
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
        }
        if (filePath.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
        }
      },
    })
  );

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  app.get('/api/push/status', (req, res) => {
    const sa = getServiceAccount();
    const isConfigured = Boolean(sa?.client_email && sa?.private_key);
    const projectId = sa?.project_id || FCM_PROJECT_ID;

    res.json({
      configured: isConfigured,
      api: 'FCM HTTP v1',
      serviceName: 'Firebase Cloud Messaging (HTTP v1)',
      projectId,
      androidChannelId: 'dzenje_flood_alarm_channel_v1',
      priority: 'high',
      keyPreview: isConfigured ? `${sa!.client_email}` : null,
      message: isConfigured
        ? 'FCM HTTP v1 is active (service account). High-priority pushes will wake closed and background phones.'
        : 'Service account not set. Add FIREBASE_SERVICE_ACCOUNT_JSON (full JSON of the private key file) to environment secrets.',
    });
  });

  app.post('/api/push/broadcast', async (req, res) => {
    try {
      const sa = getServiceAccount();
      const { title, body, severity, village, peakDelta, tokens, data: customData } = req.body || {};

      if (!title || !body) {
        return res.status(400).json({
          success: false,
          error: "Missing required parameters 'title' or 'body'.",
        });
      }

      if (!sa) {
        return res.status(200).json({
          success: false,
          notConfigured: true,
          error:
            'FCM HTTP v1 is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON to the full contents of your Firebase service account private key JSON file.',
          deliveredCount: 0,
          tokensCount: Array.isArray(tokens) ? tokens.length : 0,
        });
      }

      let targetTokens: string[] = [];
      if (Array.isArray(tokens) && tokens.length > 0) {
        targetTokens = tokens.filter((t: unknown) => typeof t === 'string' && (t as string).trim().length > 10);
      }

      if (targetTokens.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No active FCM device tokens provided to broadcast to.',
        });
      }

      const projectId = sa.project_id || FCM_PROJECT_ID;
      const accessToken = await getAccessToken(sa);

      const dataPayload: Record<string, string> = {
        severity: String(severity || 'red'),
        village: String(village || 'Dzenje Village'),
        peakDelta: String(peakDelta || 0),
        timestamp: String(Date.now()),
        alarmType: 'flood_siren',
        click_action: 'FLDT_ALARM_OPEN',
      };
      if (customData && typeof customData === 'object') {
        for (const [k, v] of Object.entries(customData)) {
          dataPayload[k] = String(v);
        }
      }

      console.log(`[FCM v1] Dispatching high-priority push to ${targetTokens.length} devices (project=${projectId})...`);

      let delivered = 0;
      let failed = 0;
      const results: Array<{ token: string; success: boolean; error?: string }> = [];

      // Sequential sends keep memory low; FCM v1 is one token per request
      for (const token of targetTokens) {
        try {
          const r = await sendFcmV1(accessToken, projectId, token, String(title), String(body), dataPayload);
          if (r.success) {
            delivered += 1;
            results.push({ token: token.slice(0, 12) + '...', success: true });
          } else {
            failed += 1;
            results.push({ token: token.slice(0, 12) + '...', success: false, error: r.error });
          }
        } catch (e: any) {
          failed += 1;
          results.push({ token: token.slice(0, 12) + '...', success: false, error: e?.message || 'send error' });
        }
      }

      console.log(`[FCM v1] Push done: ${delivered} delivered, ${failed} failed.`);

      return res.json({
        success: delivered > 0,
        api: 'FCM HTTP v1',
        deliveredCount: delivered,
        failureCount: failed,
        tokensCount: targetTokens.length,
        results,
      });
    } catch (err: any) {
      console.error('[FCM v1] Server exception during push:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to dispatch FCM HTTP v1 push notification.',
      });
    }
  });

  app.post('/api/sms/send', async (req, res) => {
    try {
      const { recipients, message, textbeeApiKey, textbeeDeviceId } = req.body || {};

      if (!message || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: "message" text or "recipients" list.',
        });
      }

      const defaultMsg = 'FLOOD ALERT: Ruo River rising fast at Dzenje! Evacuate to high ground now!';
      const safeMessage = (message || defaultMsg).slice(0, 99);
      const cleanRecipients = recipients
        .map((r: string) => (r || '').trim())
        .filter((r: string) => r.length >= 6);

      const effectiveTextbeeApiKey =
        textbeeApiKey && textbeeApiKey.trim().length > 5
          ? textbeeApiKey.trim()
          : process.env.TEXTBEE_API_KEY || 'txb_qFXRYTTd0wxVbT5sXIw8sHCHPygvhSrQ';

      const effectiveTextbeeDeviceId =
        textbeeDeviceId && textbeeDeviceId.trim().length > 5
          ? textbeeDeviceId.trim()
          : process.env.TEXTBEE_DEVICE_ID || '6a8fc290f3dc6f0f7b175829';

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
            textbeeMessage: tbData.message || 'SMS queued successfully.',
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
        error: err.message || 'SMS Gateway dispatch failed.',
      });
    }
  });

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
