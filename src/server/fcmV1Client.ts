import { GoogleAuth } from 'google-auth-library';
import firebaseConfig from '../../firebase-applet-config.json';

export interface FcmV1PushPayload {
  title: string;
  body: string;
  severity?: 'red' | 'yellow';
  village?: string;
  peakDelta?: number;
  tokens: string[];
  data?: Record<string, any>;
}

export interface FcmV1BroadcastResult {
  success: boolean;
  notConfigured?: boolean;
  deliveredCount: number;
  failureCount: number;
  tokensCount: number;
  invalidTokens: string[];
  error?: string;
  details?: any;
}

export interface FcmV1Status {
  configured: boolean;
  apiVersion: string;
  serviceName: string;
  projectId: string;
  androidChannelId: string;
  priority: string;
  authMethod: 'service_account_json' | 'credentials_env' | 'google_adc' | 'none';
  clientEmail?: string | null;
  message: string;
}

const DEFAULT_PROJECT_ID = firebaseConfig.projectId || 'automatic-flood-alert';
const FCM_SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];
const ANDROID_CHANNEL_ID = 'dzenje_flood_alarm_channel_v1';

/**
 * Parses and returns credentials if available from environment variables
 */
function getServiceAccountCredentials(): { clientEmail?: string; privateKey?: string; projectId?: string; method: FcmV1Status['authMethod'] } {
  // 1. Raw or Base64 JSON string
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_CREDENTIALS;
  if (rawJson && rawJson.trim().length > 10) {
    try {
      const decoded = rawJson.trim().startsWith('{')
        ? rawJson.trim()
        : Buffer.from(rawJson.trim(), 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (parsed.client_email && parsed.private_key) {
        return {
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key.replace(/\\n/g, '\n'),
          projectId: parsed.project_id || DEFAULT_PROJECT_ID,
          method: 'service_account_json',
        };
      }
    } catch (e) {
      console.warn('[FCM v1] Error parsing FIREBASE_SERVICE_ACCOUNT JSON:', e);
    }
  }

  // 2. Individual environment variables
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (email && key && email.trim().length > 5 && key.trim().length > 20) {
    return {
      clientEmail: email.trim(),
      privateKey: key.trim().replace(/\\n/g, '\n'),
      projectId: process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID,
      method: 'credentials_env',
    };
  }

  return { method: 'none' };
}

/**
 * Obtains a fresh Google OAuth2 Access Token for FCM HTTP v1
 */
export async function getFcmV1AccessToken(): Promise<{ token: string | null; projectId: string; method: FcmV1Status['authMethod'] }> {
  const creds = getServiceAccountCredentials();

  try {
    let auth: GoogleAuth;
    if (creds.method !== 'none' && creds.clientEmail && creds.privateKey) {
      auth = new GoogleAuth({
        credentials: {
          client_email: creds.clientEmail,
          private_key: creds.privateKey,
        },
        scopes: FCM_SCOPES,
        projectId: creds.projectId || DEFAULT_PROJECT_ID,
      });
      const client = await auth.getClient();
      const tokenRes = await client.getAccessToken();
      return {
        token: tokenRes.token || null,
        projectId: creds.projectId || DEFAULT_PROJECT_ID,
        method: creds.method,
      };
    }

    // 3. Fallback: Check if Google Application Default Credentials (ADC) are active
    auth = new GoogleAuth({
      scopes: FCM_SCOPES,
      projectId: DEFAULT_PROJECT_ID,
    });
    const client = await auth.getClient();
    const tokenRes = await client.getAccessToken();
    if (tokenRes.token) {
      return {
        token: tokenRes.token,
        projectId: DEFAULT_PROJECT_ID,
        method: 'google_adc',
      };
    }
  } catch (err) {
    // Credentials not available or unauthorized
  }

  return { token: null, projectId: DEFAULT_PROJECT_ID, method: 'none' };
}

/**
 * Returns FCM Push Gateway v1 configuration status
 */
export async function getFcmV1Status(): Promise<FcmV1Status> {
  const creds = getServiceAccountCredentials();
  const { token, projectId, method } = await getFcmV1AccessToken();
  const isConfigured = Boolean(token && token.length > 20);

  let message = 'FCM HTTP v1 is active and ready to deliver high-priority push notifications to lock screens and closed apps.';
  if (!isConfigured) {
    message = 'Firebase Service Account is not set. Add FIREBASE_SERVICE_ACCOUNT (or FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY) to your environment variables to enable remote background push notifications.';
  }

  return {
    configured: isConfigured,
    apiVersion: 'Firebase Cloud Messaging HTTP v1',
    serviceName: 'FCM Push Gateway (HTTP v1)',
    projectId,
    androidChannelId: ANDROID_CHANNEL_ID,
    priority: 'HIGH (priority: MAX, visibility: PUBLIC)',
    authMethod: method,
    clientEmail: creds.clientEmail ? `${creds.clientEmail.substring(0, 12)}...` : null,
    message,
  };
}

/**
 * Broadcasts high-priority push notifications to device tokens using Firebase Cloud Messaging HTTP v1 API.
 * Ensures notifications are displayed with high priority, siren channel, and lock-screen visibility.
 */
export async function sendFcmV1Push(payload: FcmV1PushPayload): Promise<FcmV1BroadcastResult> {
  const { title, body, severity = 'red', village = 'Dzenje Village', peakDelta = 0, tokens = [], data = {} } = payload;

  const validTokens = Array.from(new Set(tokens.filter((t) => typeof t === 'string' && t.trim().length > 10)));
  if (validTokens.length === 0) {
    return {
      success: false,
      deliveredCount: 0,
      failureCount: 0,
      tokensCount: 0,
      invalidTokens: [],
      error: 'No active device tokens provided.',
    };
  }

  const { token: accessToken, projectId } = await getFcmV1AccessToken();
  if (!accessToken) {
    return {
      success: false,
      notConfigured: true,
      deliveredCount: 0,
      failureCount: validTokens.length,
      tokensCount: validTokens.length,
      invalidTokens: [],
      error: 'FCM HTTP v1 Gateway is not configured. Set FIREBASE_SERVICE_ACCOUNT in your environment to dispatch remote background notifications.',
    };
  }

  const endpoint = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  let deliveredCount = 0;
  let failureCount = 0;
  const invalidTokens: string[] = [];

  // Dispatch concurrently with Promise.allSettled
  const sendPromises = validTokens.map(async (targetToken) => {
    const cleanData: Record<string, string> = {
      title: title || 'Flood Alert',
      body: body || 'Emergency Flood Warning',
      severity: severity || 'red',
      village: village || 'Dzenje Village',
      peakDelta: String(peakDelta || 0),
      timestamp: String(Date.now()),
      alarmType: 'flood_siren',
      click_action: 'FLDT_ALARM_OPEN',
    };

    if (data && typeof data === 'object') {
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined && v !== null) {
          cleanData[k] = typeof v === 'string' ? v : typeof v === 'object' ? JSON.stringify(v) : String(v);
        }
      }
    }

    const fcmMessage = {
      message: {
        token: targetToken,
        notification: {
          title: title || 'Flood Alert',
          body: body || 'Emergency Flood Warning',
        },
        data: cleanData,
        android: {
          priority: 'HIGH',
          ttl: '0s',
          notification: {
            channel_id: ANDROID_CHANNEL_ID,
            title: title || 'Flood Alert',
            body: body || 'Emergency Flood Warning',
            icon: 'ic_launcher',
            sound: 'default',
            notification_priority: 'PRIORITY_MAX',
            visibility: 'PUBLIC',
            click_action: 'FLDT_ALARM_OPEN',
            default_sound: true,
            default_vibrate_timings: true,
            default_light_settings: true,
          },
        },
        webpush: {
          headers: {
            Urgency: 'high',
          },
          notification: {
            title: title || 'Flood Alert',
            body: body || 'Emergency Flood Warning',
            icon: '/icon.svg',
            badge: '/icon.svg',
            tag: severity === 'yellow' ? 'flood_warning_yellow' : 'critical_flood_alarm',
            renotify: true,
            requireInteraction: true,
            vibrate: [800, 200, 800, 200, 1000, 200, 1000],
            data: {
              url: '/',
              village,
              timestamp: Date.now(),
            },
            actions: [
              { action: 'open_alarm', title: '🚨 Open Radar' },
              { action: 'dismiss', title: 'Dismiss' },
            ],
          },
          fcm_options: {
            link: '/',
          },
        },
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fcmMessage),
      });

      if (response.ok) {
        deliveredCount++;
        return { success: true };
      }

      failureCount++;
      const resJson = await response.json().catch(() => null);
      const errorCode = resJson?.error?.details?.[0]?.errorCode || resJson?.error?.status;

      // Handle invalid / unregistered / expired tokens
      if (
        response.status === 404 ||
        errorCode === 'UNREGISTERED' ||
        errorCode === 'NOT_FOUND' ||
        errorCode === 'INVALID_ARGUMENT'
      ) {
        invalidTokens.push(targetToken);
      }

      console.warn(`[FCM v1] Error sending to token (${targetToken.slice(0, 10)}...):`, response.status, resJson);
      return { success: false, error: resJson };
    } catch (sendErr: any) {
      failureCount++;
      console.warn(`[FCM v1] Network failure sending to token:`, sendErr.message);
      return { success: false, error: sendErr.message };
    }
  });

  await Promise.allSettled(sendPromises);

  return {
    success: deliveredCount > 0,
    deliveredCount,
    failureCount,
    tokensCount: validTokens.length,
    invalidTokens,
  };
}
