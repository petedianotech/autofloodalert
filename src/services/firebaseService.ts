import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, getDocFromServer, getDocsFromServer, Firestore, Unsubscribe,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, signOut, onAuthStateChanged, User, updateProfile, Auth } from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { signInWithGoogleBestEffort, completePendingGoogleRedirect } from './googleAuthHelper';
import { FloodAlert, UserProfile, AuthState, ADMIN_EMAIL, isAppAdmin, ResidentSafetyReport, SafetyStatusType } from '../types';
import { FcmGatewayService } from './fcmGatewayService';
import { smsGatewayService } from './smsGatewayService';

export class FirebaseFloodService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private auth: Auth | null = null;
  private isFirebaseActive = false;
  private currentAuthState: AuthState = { user: null, firebaseUid: null, isAuthenticated: false, isLoading: true };
  private alertListeners = new Set<(a: FloodAlert[]) => void>();
  private safetyListeners = new Set<(r: ResidentSafetyReport[]) => void>();
  private authListeners = new Set<(s: AuthState) => void>();
  private userListeners = new Set<(u: UserProfile[]) => void>();
  private firestoreUnsub: Unsubscribe | null = null;
  private safetyUnsub: Unsubscribe | null = null;

  constructor() {
    this.initFirebase();
  }

  private async initFirebase() {
    try {
      if (!getApps().length) this.app = initializeApp(firebaseConfigJson);
      else this.app = getApp();
      this.db = getFirestore(this.app, (firebaseConfigJson as any).firestoreDatabaseId);
      this.auth = getAuth(this.app);
      this.isFirebaseActive = true;
      completePendingGoogleRedirect(this.auth).catch(() => {});
      onAuthStateChanged(this.auth, async (fbUser) => {
        if (fbUser) {
          let village = 'Dzenje Village';
          let phone: string | undefined;
          let role: 'admin' | 'resident' = (fbUser.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'resident';
          if (this.db) {
            try {
              const snap = await getDoc(doc(this.db, 'users', fbUser.uid));
              if (snap.exists()) {
                const d = snap.data();
                if (d.village) village = d.village;
                if (d.phone) phone = d.phone;
                if (d.role === 'admin') role = 'admin';
              }
            } catch {}
          }
          const profile: UserProfile = {
            uid: fbUser.uid,
            name: fbUser.displayName || 'User',
            village,
            phone,
            email: fbUser.email || undefined,
            authProvider: fbUser.isAnonymous ? 'name_village' : 'google',
            role,
            photoURL: fbUser.photoURL || undefined,
          };
          this.currentAuthState = { user: profile, firebaseUid: fbUser.uid, isAuthenticated: true, isLoading: false };
          try { localStorage.setItem('flood_alert_user_profile', JSON.stringify(profile)); } catch {}
        } else {
          let cached: UserProfile | null = null;
          try { cached = JSON.parse(localStorage.getItem('flood_alert_user_profile') || 'null'); } catch {}
          if (cached) {
            this.currentAuthState = { user: cached, firebaseUid: cached.uid, isAuthenticated: true, isLoading: false };
          } else {
            this.currentAuthState = { user: null, firebaseUid: null, isAuthenticated: false, isLoading: false };
          }
        }
        this.authListeners.forEach((l) => l(this.currentAuthState));
      });
      this.subscribeFirestoreAlerts();
      this.subscribeFirestoreSafety();
    } catch (e) {
      console.warn('Firebase init', e);
      this.currentAuthState = { ...this.currentAuthState, isLoading: false };
    }
  }

  private subscribeFirestoreAlerts() {
    if (!this.db) return;
    try {
      const q = query(collection(this.db, 'flood_alerts'), orderBy('timestamp', 'desc'), limit(50));
      this.firestoreUnsub = onSnapshot(q, (snap) => {
        const alerts: FloodAlert[] = [];
        snap.forEach((d) => {
          const data = d.data();
          alerts.push({
            id: d.id,
            timestamp: data.timestamp || Date.now(),
            formattedTime: data.formattedTime || new Date(data.timestamp || Date.now()).toLocaleTimeString(),
            peakDelta: data.peakDelta || 0,
            durationSeconds: data.durationSeconds || 0,
            nodeId: data.nodeId || 'node-unknown',
            nodeName: data.nodeName || 'Sensor Node',
            village: data.village || 'Dzenje',
            riverName: data.riverName,
            locationLabel: data.locationLabel,
            status: data.status || 'active',
            severity: data.severity || 'yellow',
            title: data.title,
            message: data.message,
            source: data.source || 'hardware_sensor',
            notes: data.notes,
            mapsUrl: data.mapsUrl,
            latitude: data.latitude,
            longitude: data.longitude,
          } as FloodAlert);
        });
        try { localStorage.setItem('flood_alert_history_local', JSON.stringify(alerts)); } catch {}
        this.alertListeners.forEach((l) => l(alerts));
      });
    } catch (e) {
      console.warn('subscribeFirestoreAlerts', e);
    }
  }

  private subscribeFirestoreSafety() {
    if (!this.db) return;
    try {
      const q = query(collection(this.db, 'safety_reports'), orderBy('timestamp', 'desc'), limit(100));
      this.safetyUnsub = onSnapshot(q, (snap) => {
        const reports: ResidentSafetyReport[] = [];
        snap.forEach((d) => {
          const data = d.data();
          reports.push({
            id: d.id,
            userId: data.userId || 'anonymous',
            userName: data.userName || 'Resident',
            village: data.village || 'Dzenje Village',
            status: data.status || 'safe',
            peopleCount: data.peopleCount,
            phone: data.phone,
            message: data.message,
            timestamp: data.timestamp || Date.now(),
            formattedTime: data.formattedTime || new Date(data.timestamp || Date.now()).toLocaleTimeString(),
          } as ResidentSafetyReport);
        });
        try { localStorage.setItem('flood_alert_safety_reports_local', JSON.stringify(reports)); } catch {}
        this.safetyListeners.forEach((l) => l(reports));
      });
    } catch (e) {
      console.warn('subscribeFirestoreSafety', e);
    }
  }

  public getAuthState() { return this.currentAuthState; }
  public getIsFirebaseConnected() { return this.isFirebaseActive; }
  public subscribeAuth(cb: (s: AuthState) => void) { this.authListeners.add(cb); cb(this.currentAuthState); return () => this.authListeners.delete(cb); }
  public subscribeAlerts(cb: (a: FloodAlert[]) => void) { this.alertListeners.add(cb); cb(this.getLocalAlerts()); return () => this.alertListeners.delete(cb); }
  public subscribeSafetyReports(cb: (r: ResidentSafetyReport[]) => void) { this.safetyListeners.add(cb); cb(this.getLocalSafetyReports()); return () => this.safetyListeners.delete(cb); }
  public subscribeUsers(cb: (u: UserProfile[]) => void) { this.userListeners.add(cb); return () => this.userListeners.delete(cb); }
  public getLocalAlerts(): FloodAlert[] { try { return JSON.parse(localStorage.getItem('flood_alert_history_local') || '[]'); } catch { return []; } }
  public getLocalSafetyReports(): ResidentSafetyReport[] { try { return JSON.parse(localStorage.getItem('flood_alert_safety_reports_local') || '[]'); } catch { return []; } }

  public async signInWithGoogle(defaultVillage = 'Dzenje Village', phone?: string, smsAlertsEnabled = true, alertLanguage: 'en' | 'ny' = 'ny'): Promise<UserProfile> {
    if (!this.auth) throw new Error('Firebase Auth is not available.');
    const result = await signInWithGoogleBestEffort(this.auth);
    if (!result?.user) return new Promise(() => {});
    const fbUser = result.user;
    const isAdminUser = !!(fbUser.email && fbUser.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase());
    const profile: UserProfile = {
      uid: fbUser.uid,
      name: fbUser.displayName || 'Community Member',
      village: defaultVillage,
      phone: phone?.trim() || undefined,
      email: fbUser.email || undefined,
      smsAlertsEnabled,
      alertLanguage,
      authProvider: 'google',
      role: isAdminUser ? 'admin' : 'resident',
      photoURL: fbUser.photoURL || undefined,
    };
    this.currentAuthState = { user: profile, firebaseUid: fbUser.uid, isAuthenticated: true, isLoading: false };
    this.authListeners.forEach((l) => l(this.currentAuthState));
    try { localStorage.setItem('flood_alert_user_profile', JSON.stringify(profile)); } catch {}
    if (this.db) {
      try { await setDoc(doc(this.db, 'users', fbUser.uid), { ...profile, updatedAt: new Date().toISOString() }, { merge: true }); } catch {}
    }
    return profile;
  }

  public async signInWithNameAndVillage(name: string, village: string, phone?: string, smsAlertsEnabled = true, _pw?: string, alertLanguage: 'en' | 'ny' = 'ny'): Promise<UserProfile> {
    if (!this.auth) throw new Error('Firebase Auth is not available.');
    const cred = await signInAnonymously(this.auth);
    const profile: UserProfile = {
      uid: cred.user.uid,
      name,
      village,
      phone: phone?.trim() || undefined,
      smsAlertsEnabled,
      alertLanguage,
      authProvider: 'name_village',
      role: 'resident',
    };
    try { await updateProfile(cred.user, { displayName: name }); } catch {}
    this.currentAuthState = { user: profile, firebaseUid: cred.user.uid, isAuthenticated: true, isLoading: false };
    this.authListeners.forEach((l) => l(this.currentAuthState));
    try { localStorage.setItem('flood_alert_user_profile', JSON.stringify(profile)); } catch {}
    if (this.db) {
      try { await setDoc(doc(this.db, 'users', cred.user.uid), { ...profile, updatedAt: new Date().toISOString() }, { merge: true }); } catch {}
    }
    return profile;
  }

  public async signOutUser() {
    if (this.auth) await signOut(this.auth);
    try { localStorage.removeItem('flood_alert_user_profile'); } catch {}
    this.currentAuthState = { user: null, firebaseUid: null, isAuthenticated: false, isLoading: false };
    this.authListeners.forEach((l) => l(this.currentAuthState));
  }

  public async updateProfileData(partial: Partial<UserProfile>) {
    if (!this.currentAuthState.user) return;
    const updated = { ...this.currentAuthState.user, ...partial };
    this.currentAuthState = { ...this.currentAuthState, user: updated };
    this.authListeners.forEach((l) => l(this.currentAuthState));
    try { localStorage.setItem('flood_alert_user_profile', JSON.stringify(updated)); } catch {}
    if (this.db && this.currentAuthState.firebaseUid) {
      try { await setDoc(doc(this.db, 'users', this.currentAuthState.firebaseUid), { ...partial, updatedAt: new Date().toISOString() }, { merge: true }); } catch {}
    }
  }

  public async manualRefreshAll() {
    return { success: true, usersCount: 0, alertsCount: this.getLocalAlerts().length, reportsCount: this.getLocalSafetyReports().length, newUsersCount: 0, newUsers: [] as UserProfile[], timestamp: Date.now() };
  }

  public async recordFloodAlert(alert: Omit<FloodAlert, 'id'>) {
    const full: FloodAlert = { ...alert, id: 'local-' + Date.now() } as FloodAlert;
    const list = [full, ...this.getLocalAlerts()].slice(0, 50);
    try { localStorage.setItem('flood_alert_history_local', JSON.stringify(list)); } catch {}
    this.alertListeners.forEach((l) => l(list));
    if (this.db) {
      try {
        const ref = await addDoc(collection(this.db, 'flood_alerts'), alert as any);
        full.id = ref.id;
      } catch {}
    }
    try {
      await FcmGatewayService.broadcastPushAlert({
        title: alert.title || 'Flood Alert',
        body: alert.message || '',
        severity: alert.severity,
        village: alert.village,
      });
    } catch {}
  }

  public async dismissAlert(id: string) {
    const list = this.getLocalAlerts().map((a) => a.id === id ? { ...a, status: 'dismissed' as const } : a);
    try { localStorage.setItem('flood_alert_history_local', JSON.stringify(list)); } catch {}
    this.alertListeners.forEach((l) => l(list));
  }

  public async deleteAlert(id: string) {
    const list = this.getLocalAlerts().filter((a) => a.id !== id);
    try { localStorage.setItem('flood_alert_history_local', JSON.stringify(list)); } catch {}
    this.alertListeners.forEach((l) => l(list));
  }

  public async clearAllAlerts() {
    try { localStorage.setItem('flood_alert_history_local', '[]'); } catch {}
    this.alertListeners.forEach((l) => l([]));
  }

  /** Alias used by App.tsx */
  public async clearAlerts() {
    return this.clearAllAlerts();
  }

  public async registerFcmToken(token: string) {
    if (!token) return;
    try { localStorage.setItem('flood_alert_fcm_token', token); } catch {}
    if (this.db) {
      try {
        const tokenDocId = token.slice(0, 32).replace(/[^a-zA-Z0-9_-]/g, '_');
        await setDoc(doc(this.db, 'fcm_tokens', tokenDocId), {
          token,
          userId: this.currentAuthState.user?.uid || 'anonymous',
          village: this.currentAuthState.user?.village || 'Dzenje Village',
          updatedAt: new Date().toISOString(),
          timestamp: Date.now(),
        }, { merge: true });
      } catch {}
    }
  }
}

export const firebaseFloodService = new FirebaseFloodService();
