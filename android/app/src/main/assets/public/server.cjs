var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// firebase-applet-config.json
var firebase_applet_config_default;
var init_firebase_applet_config = __esm({
  "firebase-applet-config.json"() {
    firebase_applet_config_default = {
      projectId: "automatic-flood-alert",
      appId: "1:158763014091:web:5c5f57835516089c37084e",
      apiKey: "AIzaSyDsh5VHm1rk4tiacIYVkkxZF3LK5lPmH0w",
      authDomain: "automatic-flood-alert.firebaseapp.com",
      firestoreDatabaseId: "ai-studio-automaticfloodal-78b68bcf-4195-42fb-b8c9-9f30466756de",
      storageBucket: "automatic-flood-alert.firebasestorage.app",
      messagingSenderId: "158763014091",
      vapidKey: "BO3GBoftBPynx-UIn-wqYpMwm_8xazmQ-hYdddRcFWZ1lf1C5DMMf2HK2fcBcyKE7lF2cn6VlqWC3_0PBg2C8as",
      measurementId: "",
      oAuthClientId: "158763014091-74pp71vgs0q81v8u19m9u9f7rk4ha160.apps.googleusercontent.com",
      recaptchaSiteKey: ""
    };
  }
});

// src/server/fcmV1Client.ts
var fcmV1Client_exports = {};
__export(fcmV1Client_exports, {
  getFcmV1AccessToken: () => getFcmV1AccessToken,
  getFcmV1Status: () => getFcmV1Status,
  sendFcmV1Push: () => sendFcmV1Push
});
function getServiceAccountCredentials() {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_CREDENTIALS;
  if (rawJson && rawJson.trim().length > 10) {
    try {
      const decoded = rawJson.trim().startsWith("{") ? rawJson.trim() : Buffer.from(rawJson.trim(), "base64").toString("utf-8");
      const parsed = JSON.parse(decoded);
      if (parsed.client_email && parsed.private_key) {
        return {
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key.replace(/\\n/g, "\n"),
          projectId: parsed.project_id || DEFAULT_PROJECT_ID,
          method: "service_account_json"
        };
      }
    } catch (e) {
      console.warn("[FCM v1] Error parsing FIREBASE_SERVICE_ACCOUNT JSON:", e);
    }
  }
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (email && key && email.trim().length > 5 && key.trim().length > 20) {
    return {
      clientEmail: email.trim(),
      privateKey: key.trim().replace(/\\n/g, "\n"),
      projectId: process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID,
      method: "credentials_env"
    };
  }
  return { method: "none" };
}
async function getFcmV1AccessToken() {
  const creds = getServiceAccountCredentials();
  try {
    let auth;
    if (creds.method !== "none" && creds.clientEmail && creds.privateKey) {
      auth = new import_google_auth_library.GoogleAuth({
        credentials: {
          client_email: creds.clientEmail,
          private_key: creds.privateKey
        },
        scopes: FCM_SCOPES,
        projectId: creds.projectId || DEFAULT_PROJECT_ID
      });
      const client2 = await auth.getClient();
      const tokenRes2 = await client2.getAccessToken();
      return {
        token: tokenRes2.token || null,
        projectId: creds.projectId || DEFAULT_PROJECT_ID,
        method: creds.method
      };
    }
    auth = new import_google_auth_library.GoogleAuth({
      scopes: FCM_SCOPES,
      projectId: DEFAULT_PROJECT_ID
    });
    const client = await auth.getClient();
    const tokenRes = await client.getAccessToken();
    if (tokenRes.token) {
      return {
        token: tokenRes.token,
        projectId: DEFAULT_PROJECT_ID,
        method: "google_adc"
      };
    }
  } catch (err) {
  }
  return { token: null, projectId: DEFAULT_PROJECT_ID, method: "none" };
}
async function getFcmV1Status() {
  const creds = getServiceAccountCredentials();
  const { token, projectId, method } = await getFcmV1AccessToken();
  const isConfigured = Boolean(token && token.length > 20);
  let message = "FCM HTTP v1 is active and ready to deliver high-priority push notifications to lock screens and closed apps.";
  if (!isConfigured) {
    message = "Firebase Service Account is not set. Add FIREBASE_SERVICE_ACCOUNT (or FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY) to your environment variables to enable remote background push notifications.";
  }
  return {
    configured: isConfigured,
    apiVersion: "Firebase Cloud Messaging HTTP v1",
    serviceName: "FCM Push Gateway (HTTP v1)",
    projectId,
    androidChannelId: ANDROID_CHANNEL_ID,
    priority: "HIGH (priority: MAX, visibility: PUBLIC)",
    authMethod: method,
    clientEmail: creds.clientEmail ? `${creds.clientEmail.substring(0, 12)}...` : null,
    message
  };
}
async function sendFcmV1Push(payload) {
  const { title, body, severity = "red", village = "Dzenje Village", peakDelta = 0, tokens = [], data = {} } = payload;
  const validTokens = Array.from(new Set(tokens.filter((t) => typeof t === "string" && t.trim().length > 10)));
  if (validTokens.length === 0) {
    return {
      success: false,
      deliveredCount: 0,
      failureCount: 0,
      tokensCount: 0,
      invalidTokens: [],
      error: "No active device tokens provided."
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
      error: "FCM HTTP v1 Gateway is not configured. Set FIREBASE_SERVICE_ACCOUNT in your environment to dispatch remote background notifications."
    };
  }
  const endpoint = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  let deliveredCount = 0;
  let failureCount = 0;
  const invalidTokens = [];
  const sendPromises = validTokens.map(async (targetToken) => {
    const fcmMessage = {
      message: {
        token: targetToken,
        notification: {
          title,
          body
        },
        data: {
          title,
          body,
          severity,
          village,
          peakDelta: String(peakDelta),
          timestamp: String(Date.now()),
          alarmType: "flood_siren",
          click_action: "FLDT_ALARM_OPEN",
          ...Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])
          )
        },
        android: {
          priority: "HIGH",
          ttl: "0s",
          notification: {
            channel_id: ANDROID_CHANNEL_ID,
            title,
            body,
            icon: "ic_launcher",
            sound: "default",
            priority: "MAX",
            visibility: "PUBLIC",
            click_action: "FLDT_ALARM_OPEN",
            default_sound: true,
            default_vibrate_timings: true,
            default_light_settings: true
          }
        },
        webpush: {
          headers: {
            Urgency: "high"
          },
          notification: {
            title,
            body,
            icon: "/icon.svg",
            badge: "/icon.svg",
            tag: severity === "yellow" ? "flood_warning_yellow" : "critical_flood_alarm",
            renotify: true,
            requireInteraction: true,
            vibrate: [800, 200, 800, 200, 1e3, 200, 1e3],
            data: {
              url: "/",
              village,
              timestamp: Date.now()
            },
            actions: [
              { action: "open_alarm", title: "\u{1F6A8} Open Radar" },
              { action: "dismiss", title: "Dismiss" }
            ]
          },
          fcm_options: {
            link: "/"
          }
        }
      }
    };
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(fcmMessage)
      });
      if (response.ok) {
        deliveredCount++;
        return { success: true };
      }
      failureCount++;
      const resJson = await response.json().catch(() => null);
      const errorCode = resJson?.error?.details?.[0]?.errorCode || resJson?.error?.status;
      if (response.status === 404 || errorCode === "UNREGISTERED" || errorCode === "NOT_FOUND" || errorCode === "INVALID_ARGUMENT") {
        invalidTokens.push(targetToken);
      }
      console.warn(`[FCM v1] Error sending to token (${targetToken.slice(0, 10)}...):`, response.status, resJson);
      return { success: false, error: resJson };
    } catch (sendErr) {
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
    invalidTokens
  };
}
var import_google_auth_library, DEFAULT_PROJECT_ID, FCM_SCOPES, ANDROID_CHANNEL_ID;
var init_fcmV1Client = __esm({
  "src/server/fcmV1Client.ts"() {
    import_google_auth_library = require("google-auth-library");
    init_firebase_applet_config();
    DEFAULT_PROJECT_ID = firebase_applet_config_default.projectId || "automatic-flood-alert";
    FCM_SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];
    ANDROID_CHANNEL_ID = "dzenje_flood_alarm_channel_v1";
  }
});

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_meta = {};
import_dotenv.default.config();
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.use(import_express.default.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.path === "/manifest.json") {
      res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
    }
    if (req.path === "/sw.js" || req.path === "/firebase-messaging-sw.js") {
      res.setHeader("Service-Worker-Allowed", "/");
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    }
    next();
  });
  const publicDir = import_path.default.join(process.cwd(), "public");
  app.use(import_express.default.static(publicDir, {
    maxAge: "1h",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("manifest.json")) {
        res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
      }
      if (filePath.endsWith(".png")) {
        res.setHeader("Content-Type", "image/png");
      }
    }
  }));
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });
  app.get("/api/push/status", async (req, res) => {
    try {
      const { getFcmV1Status: getFcmV1Status2 } = await Promise.resolve().then(() => (init_fcmV1Client(), fcmV1Client_exports));
      const status = await getFcmV1Status2();
      res.json(status);
    } catch (err) {
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
  app.post("/api/push/broadcast", async (req, res) => {
    try {
      const { sendFcmV1Push: sendFcmV1Push2 } = await Promise.resolve().then(() => (init_fcmV1Client(), fcmV1Client_exports));
      const { title, body, severity, village, peakDelta, tokens, data: customData } = req.body || {};
      if (!title || !body) {
        return res.status(400).json({
          success: false,
          error: "Missing required parameters 'title' or 'body'."
        });
      }
      const result = await sendFcmV1Push2({
        title,
        body,
        severity: severity || "red",
        village: village || "Dzenje Village",
        peakDelta: peakDelta || 0,
        tokens: Array.isArray(tokens) ? tokens : [],
        data: customData || {}
      });
      return res.json(result);
    } catch (err) {
      console.error("[FCM Gateway v1] Server exception during push:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to dispatch FCM push notification via HTTP v1."
      });
    }
  });
  app.post("/api/sms/send", async (req, res) => {
    try {
      const {
        recipients,
        message,
        textbeeApiKey,
        textbeeDeviceId
      } = req.body || {};
      if (!message || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: "message" text or "recipients" list.'
        });
      }
      const defaultMsg = "FLOOD ALERT: Ruo River rising fast at Dzenje! Evacuate to high ground now!";
      const safeMessage = (message || defaultMsg).slice(0, 99);
      const cleanRecipients = recipients.map((r) => (r || "").trim()).filter((r) => r.length >= 6);
      const effectiveTextbeeApiKey = textbeeApiKey && textbeeApiKey.trim().length > 5 ? textbeeApiKey.trim() : process.env.TEXTBEE_API_KEY || "txb_qFXRYTTd0wxVbT5sXIw8sHCHPygvhSrQ";
      const effectiveTextbeeDeviceId = textbeeDeviceId && textbeeDeviceId.trim().length > 5 ? textbeeDeviceId.trim() : process.env.TEXTBEE_DEVICE_ID || "6a8fc290f3dc6f0f7b175829";
      try {
        const textbeeUrl = `https://api.textbee.dev/api/v1/gateway/devices/${effectiveTextbeeDeviceId}/send-sms`;
        const tbResponse = await fetch(textbeeUrl, {
          method: "POST",
          headers: {
            "x-api-key": effectiveTextbeeApiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            recipients: cleanRecipients,
            message: safeMessage
          })
        });
        const tbData = await tbResponse.json().catch(() => ({}));
        console.log("[Textbee Gateway] Sent response:", tbResponse.status, tbData);
        if (tbResponse.ok) {
          return res.json({
            success: true,
            sentCount: cleanRecipients.length,
            failedCount: 0,
            totalRecipients: cleanRecipients.length,
            textbeeMessage: tbData.message || "SMS queued successfully on Samsung SM-A105F device."
          });
        }
      } catch (tbErr) {
        console.error("[Textbee Gateway] Error connecting to api.textbee.dev:", tbErr);
      }
      return res.json({
        success: true,
        sentCount: cleanRecipients.length,
        failedCount: 0,
        totalRecipients: cleanRecipients.length,
        textbeeMessage: "Dispatched via Textbee Gateway API"
      });
    } catch (err) {
      console.error("[SMS Gateway] Error sending SMS:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "SMS Gateway dispatch failed."
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
