/**
 * SMS Gateway Service
 * Integrates Textbee SMS Gateway for broadcasting emergency flood alerts
 * via connected Android device (Samsung SM-A105F)
 */

export interface SmsRecipient {
  id: string;
  name: string;
  phone: string;
  role: string;
  village: string;
  language?: 'en' | 'ny';
  enabled: boolean;
}

export const CHICHEWA_SMS_ALERT = 'KUSEFUKIRA KWA MADZI: Nsinje wa Ruo  madzi akusefukira  pitani Kumalo okwera';
export const SIMPLE_ENGLISH_SMS_ALERT = 'FLOOD ALERT: Ruo River rising fast at Dzenje! Go to high ground now!';

export interface SmsGatewayConfig {
  enabled: boolean;
  gatewayType: 'textbee';
  textbeeApiKey: string;
  textbeeDeviceId: string;
  autoSendOnCriticalAlert: boolean;
  recipients: SmsRecipient[];
}

const STORAGE_KEY = 'flood_alert_sms_gateway_config_v1';

// Clean and normalize phone number (strip whitespace, dashes, parentheses)
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  return phone.trim().replace(/[\s\-\(\)\.]/g, '');
};

// Default configuration for user's Textbee SMS Gateway (Samsung SM-A105F)
const DEFAULT_CONFIG: SmsGatewayConfig = {
  enabled: true,
  gatewayType: 'textbee',
  textbeeApiKey:
    (import.meta as any).env?.VITE_TEXTBEE_API_KEY ||
    'txb_qFXRYTTd0wxVbT5sXIw8sHCHPygvhSrQ',
  textbeeDeviceId:
    (import.meta as any).env?.VITE_TEXTBEE_DEVICE_ID ||
    '6a8fc290f3dc6f0f7b175829', // Samsung SM-A105F connected phone
  autoSendOnCriticalAlert: true,
  recipients: [],
};

const isMockRecipient = (rec: SmsRecipient): boolean => {
  if (!rec) return true;
  if (rec.id && rec.id.startsWith('rec-')) return true;
  const mockPhones = ['+265999000111', '+265888000222', '+265991000333', '+265882000444'];
  if (rec.phone && mockPhones.includes(normalizePhoneNumber(rec.phone))) return true;
  const mockNames = [
    'Village Headman Dzenje',
    'Dzenje CDSS Head Teacher',
    'Mulanje Disaster Committee (CPDC)',
    'Machokola Village Evacuation Team',
    'Machokola Evacuation Team',
  ];
  if (rec.name && mockNames.includes(rec.name.trim())) return true;
  return false;
};

class SmsGatewayServiceClass {
  private config: SmsGatewayConfig;
  private db: any = null;
  private listeners: Set<(recipients: SmsRecipient[]) => void> = new Set();
  private isBroadcasting: boolean = false;
  private lastAutoBroadcastTime: number = 0;
  private autoBroadcastCooldownMs: number = 45000; // 45-second cooldown for automated SMS alert dispatch

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): SmsGatewayConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const rawRecipients: SmsRecipient[] = Array.isArray(parsed.recipients) ? parsed.recipients : [];
        const cleanRecipients = this.deduplicateRecipients(
          rawRecipients.filter((r) => !isMockRecipient(r))
        );
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          recipients: cleanRecipients,
        };
      }
    } catch {
      // ignore
    }
    return { ...DEFAULT_CONFIG, recipients: [] };
  }

  private deduplicateRecipients(list: SmsRecipient[]): SmsRecipient[] {
    const seenPhones = new Set<string>();
    const seenIds = new Set<string>();
    const result: SmsRecipient[] = [];

    for (const r of list) {
      if (!r || !r.phone) continue;
      const cleanPhone = normalizePhoneNumber(r.phone);
      if (cleanPhone.length < 6) continue;
      if (seenPhones.has(cleanPhone) || (r.id && seenIds.has(r.id))) {
        continue;
      }
      seenPhones.add(cleanPhone);
      if (r.id) seenIds.add(r.id);
      result.push({
        ...r,
        phone: cleanPhone,
        village: r.village === 'Machokola' ? 'Machokola Village' : (r.village || 'Dzenje Village'),
      });
    }
    return result;
  }

  public subscribeRecipients(cb: (recipients: SmsRecipient[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.getConfig().recipients);
    return () => this.listeners.delete(cb);
  }

  private notifyListeners() {
    const recs = this.getConfig().recipients;
    this.listeners.forEach((cb) => cb(recs));
  }

  public getConfig(): SmsGatewayConfig {
    return {
      ...this.config,
      recipients: this.deduplicateRecipients(
        (this.config.recipients || []).filter((r) => !isMockRecipient(r))
      ),
    };
  }

  public saveConfig(newConfig: Partial<SmsGatewayConfig>) {
    const recipientsToSave = this.deduplicateRecipients(
      (newConfig.recipients || this.config.recipients || []).filter((r) => !isMockRecipient(r))
    );
    this.config = {
      ...this.config,
      ...newConfig,
      recipients: recipientsToSave,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // ignore
    }
    this.notifyListeners();
  }

  public addRecipient(recipient: Omit<SmsRecipient, 'id'>) {
    const cleanPhone = normalizePhoneNumber(recipient.phone);
    if (cleanPhone.length < 6) return;

    const newId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newRec: SmsRecipient = {
      ...recipient,
      id: newId,
      phone: cleanPhone,
      village: recipient.village === 'Machokola' ? 'Machokola Village' : (recipient.village || 'Dzenje Village'),
      language: recipient.language || 'ny',
      enabled: recipient.enabled !== undefined ? recipient.enabled : true,
    };

    const cleanList = (this.config.recipients || []).filter((r) => !isMockRecipient(r));
    const updatedList = this.deduplicateRecipients([...cleanList, newRec]);
    this.config.recipients = updatedList;
    this.saveConfig({ recipients: updatedList });

    // Save to real Firestore database
    if (this.db) {
      import('firebase/firestore')
        .then(({ doc, setDoc }) => {
          setDoc(doc(this.db, 'sms_recipients', newId), newRec, { merge: true }).catch((err) =>
            console.warn('[SMS Gateway] Failed to write recipient to Firestore:', err)
          );
        })
        .catch(() => {});
    }
  }

  public addOrUpdateUserRecipient(user: {
    uid?: string;
    name: string;
    phone: string;
    village: string;
    role?: string;
    language?: 'en' | 'ny';
    enabled?: boolean;
  }) {
    if (!user.phone || user.phone.trim().length < 6) return;

    const cleanPhone = normalizePhoneNumber(user.phone);
    if (cleanPhone.length < 6) return;

    const cleanList = (this.config.recipients || []).filter((r) => !isMockRecipient(r));
    const existingIndex = cleanList.findIndex(
      (r) => normalizePhoneNumber(r.phone) === cleanPhone || (user.uid && r.id === user.uid)
    );

    const updatedList = [...cleanList];
    const userVillage = user.village === 'Machokola' ? 'Machokola Village' : (user.village || 'Dzenje Village');

    if (existingIndex >= 0) {
      const currentEnabled = cleanList[existingIndex].enabled;
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        id: user.uid || updatedList[existingIndex].id,
        name: user.name || updatedList[existingIndex].name,
        phone: cleanPhone,
        village: userVillage,
        role: user.role || updatedList[existingIndex].role || 'Signed-In Resident',
        language: user.language || updatedList[existingIndex].language || 'ny',
        enabled: user.enabled !== undefined ? user.enabled : (currentEnabled ?? true),
      };
    } else {
      updatedList.push({
        id: user.uid || `user-${Date.now()}`,
        name: user.name || 'Village Member',
        phone: cleanPhone,
        village: userVillage,
        role: user.role || 'Signed-In Resident',
        language: user.language || 'ny',
        enabled: user.enabled !== undefined ? user.enabled : true, // Immediately enabled for real users who sign up
      });
    }

    const deduplicated = this.deduplicateRecipients(updatedList);
    this.config.recipients = deduplicated;
    this.saveConfig({ recipients: deduplicated });

    // Sync to Firestore database
    if (this.db && user.uid) {
      import('firebase/firestore')
        .then(({ doc, setDoc }) => {
          setDoc(
            doc(this.db, 'sms_recipients', user.uid!),
            {
              id: user.uid,
              name: user.name,
              phone: cleanPhone,
              village: userVillage,
              role: user.role || 'Resident',
              language: user.language || 'ny',
              enabled: user.enabled !== undefined ? user.enabled : true,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch(() => {});
        })
        .catch(() => {});
    }
  }

  public async syncUsersFromFirestore(db: any) {
    if (!db) return;
    this.db = db;
    try {
      const { collection, getDocs } = await import('firebase/firestore');

      // 1. Fetch real users with registered phone numbers
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.phone && typeof data.phone === 'string' && data.phone.trim().length >= 6) {
          this.addOrUpdateUserRecipient({
            uid: docSnap.id,
            name: data.name || 'Village Resident',
            phone: data.phone,
            village: data.village || 'Dzenje Village',
            role: data.role === 'admin' ? 'Village Admin' : 'Registered Resident',
            language: data.alertLanguage || 'ny',
            enabled: data.smsAlertsEnabled ?? true,
          });
        }
      });

      // 2. Fetch custom added recipients from Firestore `sms_recipients`
      try {
        const recipientsSnap = await getDocs(collection(db, 'sms_recipients'));
        recipientsSnap.forEach((docSnap) => {
          const data = docSnap.data() as SmsRecipient;
          if (data && data.phone && data.phone.trim().length >= 6 && !isMockRecipient(data)) {
            this.addOrUpdateUserRecipient({
              uid: docSnap.id,
              name: data.name || 'Village Contact',
              phone: data.phone,
              village: data.village || 'Dzenje Village',
              role: data.role || 'Community Contact',
              language: data.language || 'ny',
              enabled: data.enabled ?? true,
            });
          }
        });
      } catch {
        // collection might not exist yet
      }

      console.log(`[SMS Gateway] Synced contacts from Firestore database. Total recipients: ${this.config.recipients.length}`);
    } catch (err) {
      console.warn('[SMS Gateway] Firestore contacts sync note:', err);
    }
  }

  public removeRecipient(id: string) {
    this.config.recipients = (this.config.recipients || []).filter((r) => r.id !== id && !isMockRecipient(r));
    this.saveConfig({ recipients: this.config.recipients });

    // Also remove from Firestore database
    if (this.db) {
      import('firebase/firestore')
        .then(({ doc, deleteDoc }) => {
          deleteDoc(doc(this.db, 'sms_recipients', id)).catch(() => {});
        })
        .catch(() => {});
    }
  }

  public toggleRecipient(id: string, enabled: boolean) {
    this.config.recipients = this.config.recipients.map((r) =>
      r.id === id ? { ...r, enabled } : r
    );
    this.saveConfig({ recipients: this.config.recipients });

    if (this.db) {
      import('firebase/firestore')
        .then(({ doc, updateDoc }) => {
          updateDoc(doc(this.db, 'users', id), { smsAlertsEnabled: enabled }).catch(() => {});
          updateDoc(doc(this.db, 'sms_recipients', id), { enabled: enabled }).catch(() => {});
        })
        .catch(() => {});
    }
  }

  public updateRecipientLanguage(id: string, language: 'en' | 'ny') {
    this.config.recipients = this.config.recipients.map((r) =>
      r.id === id ? { ...r, language } : r
    );
    this.saveConfig({ recipients: this.config.recipients });
  }

  public setAllRecipientsEnabled(enabled: boolean, languageFilter?: 'en' | 'ny') {
    this.config.recipients = this.config.recipients.map((r) => {
      if (languageFilter && (r.language || 'ny') !== languageFilter) {
        return r;
      }
      return { ...r, enabled };
    });
    this.saveConfig({ recipients: this.config.recipients });

    if (this.db) {
      import('firebase/firestore')
        .then(({ doc, updateDoc }) => {
          this.config.recipients.forEach((r) => {
            if (languageFilter && (r.language || 'ny') !== languageFilter) return;
            updateDoc(doc(this.db, 'users', r.id), { smsAlertsEnabled: enabled }).catch(() => {});
            updateDoc(doc(this.db, 'sms_recipients', r.id), { enabled: enabled }).catch(() => {});
          });
        })
        .catch(() => {});
    }
  }

  public getActiveRecipients(): SmsRecipient[] {
    return this.getConfig().recipients.filter((r) => r.enabled && normalizePhoneNumber(r.phone).length >= 6);
  }

  public getRecipientsByLanguage(lang: 'en' | 'ny', markedOnly: boolean = false): SmsRecipient[] {
    return this.getConfig().recipients.filter((r) => {
      const recipientLang = r.language || 'ny';
      if (recipientLang !== lang) return false;
      if (markedOnly && !r.enabled) return false;
      return normalizePhoneNumber(r.phone).length >= 6;
    });
  }

  /**
   * Dispatches language-specific SMS messages:
   * - Chichewa recipients get CHICHEWA_SMS_ALERT
   * - English recipients get SIMPLE_ENGLISH_SMS_ALERT
   * 
   * Includes strict deduplication & throttling so flood detections only send once.
   */
  public async sendLanguageAwareBroadcastSms(isAutomated: boolean = false): Promise<{
    success: boolean;
    sentCount: number;
    failedCount: number;
    chichewaCount: number;
    englishCount: number;
    error?: string;
    recipientsCount: number;
    throttled?: boolean;
  }> {
    const now = Date.now();

    // 1. Check Automated Cooldown Throttling
    if (isAutomated) {
      if (now - this.lastAutoBroadcastTime < this.autoBroadcastCooldownMs) {
        console.log(`[SMS Gateway] Throttled automated SMS alert (in cooldown: ${(now - this.lastAutoBroadcastTime) / 1000}s ago). Prevents repeat messages.`);
        return {
          success: true,
          sentCount: 0,
          failedCount: 0,
          chichewaCount: 0,
          englishCount: 0,
          recipientsCount: 0,
          throttled: true,
        };
      }
    }

    // 2. Prevent concurrent broadcast overlap
    if (this.isBroadcasting) {
      console.log('[SMS Gateway] Broadcast currently in flight. Skipping overlapping call.');
      return {
        success: true,
        sentCount: 0,
        failedCount: 0,
        chichewaCount: 0,
        englishCount: 0,
        recipientsCount: 0,
        throttled: true,
      };
    }

    this.isBroadcasting = true;
    this.lastAutoBroadcastTime = now;

    try {
      const active = this.getActiveRecipients();
      if (active.length === 0) {
        return {
          success: false,
          sentCount: 0,
          failedCount: 0,
          chichewaCount: 0,
          englishCount: 0,
          recipientsCount: 0,
          error: 'No phone numbers are enabled in the emergency SMS list.',
        };
      }

      // Deduplicate unique phone numbers
      const chichewaPhones = Array.from(
        new Set(
          active
            .filter((r) => (r.language || 'ny') === 'ny')
            .map((r) => normalizePhoneNumber(r.phone))
            .filter((p) => p.length >= 6)
        )
      );

      const englishPhones = Array.from(
        new Set(
          active
            .filter((r) => r.language === 'en')
            .map((r) => normalizePhoneNumber(r.phone))
            .filter((p) => p.length >= 6)
        )
      );

      let totalSent = 0;
      const errors: string[] = [];

      if (chichewaPhones.length > 0) {
        const resNy = await this.sendBroadcastSms(CHICHEWA_SMS_ALERT, chichewaPhones);
        if (resNy.success) {
          totalSent += chichewaPhones.length;
        } else if (resNy.error) {
          errors.push(`Chichewa: ${resNy.error}`);
        }
      }

      if (englishPhones.length > 0) {
        const resEn = await this.sendBroadcastSms(SIMPLE_ENGLISH_SMS_ALERT, englishPhones);
        if (resEn.success) {
          totalSent += englishPhones.length;
        } else if (resEn.error) {
          errors.push(`English: ${resEn.error}`);
        }
      }

      return {
        success: totalSent > 0 || errors.length === 0,
        sentCount: totalSent,
        failedCount: (chichewaPhones.length + englishPhones.length) - totalSent,
        chichewaCount: chichewaPhones.length,
        englishCount: englishPhones.length,
        recipientsCount: chichewaPhones.length + englishPhones.length,
        error: errors.length > 0 ? errors.join('; ') : undefined,
      };
    } finally {
      this.isBroadcasting = false;
    }
  }

  /**
   * Dispatches SMS message using Textbee API Gateway via server proxy to prevent double-firing
   */
  public async sendBroadcastSms(
    message: string,
    specificNumbers?: string[]
  ): Promise<{
    success: boolean;
    sentCount: number;
    failedCount: number;
    error?: string;
    recipientsCount: number;
  }> {
    const rawTargets = specificNumbers || this.getActiveRecipients().map((r) => r.phone);
    const targets = Array.from(
      new Set(rawTargets.map((p) => normalizePhoneNumber(p)).filter((p) => p.length >= 6))
    );

    if (targets.length === 0) {
      return {
        success: false,
        sentCount: 0,
        failedCount: 0,
        recipientsCount: 0,
        error: 'No phone numbers selected or enabled in emergency broadcast list.',
      };
    }

    // Enforce Textbee requirement: text must be below 100 characters (max 99 chars)
    const defaultMsg = SIMPLE_ENGLISH_SMS_ALERT;
    const safeMessage = (message || defaultMsg).slice(0, 99);

    const apiKey = this.config.textbeeApiKey || DEFAULT_CONFIG.textbeeApiKey;
    const deviceId = this.config.textbeeDeviceId || DEFAULT_CONFIG.textbeeDeviceId;

    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: targets,
          message: safeMessage,
          gatewayType: 'textbee',
          textbeeApiKey: apiKey,
          textbeeDeviceId: deviceId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: data.success ?? true,
          sentCount: data.sentCount ?? targets.length,
          failedCount: data.failedCount ?? 0,
          recipientsCount: targets.length,
          error: data.error,
        };
      } else {
        const errData = await response.json().catch(() => ({}));
        return {
          success: false,
          sentCount: 0,
          failedCount: targets.length,
          recipientsCount: targets.length,
          error: errData.error || `Server responded with ${response.status}`,
        };
      }
    } catch (err: any) {
      console.error('[SMS Gateway] Network error connecting to SMS proxy:', err);
      return {
        success: false,
        sentCount: 0,
        failedCount: targets.length,
        recipientsCount: targets.length,
        error: err.message || 'Network connection failed',
      };
    }
  }

  public getNativeSmsUrl(message?: string, specificNumbers?: string[]): string {
    const targets = specificNumbers || this.getActiveRecipients().map((r) => r.phone.trim());
    if (targets.length === 0) return '';

    const defaultMsg = SIMPLE_ENGLISH_SMS_ALERT;
    const safeMessage = (message || defaultMsg).slice(0, 99);
    // Join numbers with comma for universal SMS app compatibility
    const numberList = targets.join(',');
    const encodedBody = encodeURIComponent(safeMessage);
    
    // Check iOS vs Android navigator user agent if available
    const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isIOS ? `sms:${numberList}&body=${encodedBody}` : `sms:${numberList}?body=${encodedBody}`;
  }

  public sendViaNativeSms(message?: string, specificNumbers?: string[]): boolean {
    const url = this.getNativeSmsUrl(message, specificNumbers);
    if (!url) return false;
    
    try {
      window.location.href = url;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Helper to format flood warning text for local SMS
   * Supports Chichewa ('ny') and Simple English ('en')
   * CONSTRAINT: Must be below 100 characters (max 99 chars)
   */
  public formatFloodAlertMessage(
    village?: string,
    riverName: string = 'Ruo',
    langOrDelta?: 'en' | 'ny' | number,
    maybeLang?: 'en' | 'ny'
  ): string {
    const lang: 'en' | 'ny' =
      typeof langOrDelta === 'string'
        ? langOrDelta
        : maybeLang || 'ny';

    if (lang === 'ny') {
      // Exact Chichewa message requested by user
      return CHICHEWA_SMS_ALERT.slice(0, 99);
    }
    const cleanVillage = village && village !== 'all' ? village.replace(' Village', '') : 'Dzenje';
    const msg = `FLOOD ALERT: ${riverName} River rising fast at ${cleanVillage}! Go to high ground now!`;
    return msg.slice(0, 99);
  }
}

export const smsGatewayService = new SmsGatewayServiceClass();
