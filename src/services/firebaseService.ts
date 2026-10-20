/**
 * Firebase Integration Service (v10+ Modular SDK)
 * - Connects Firestore & Firebase Authentication
 * - Supports Name + Village sign-in & Google OAuth sign-in
 * - Stores user profiles in `/users/{userId}`
 * - Realtime flood telemetry alerts in `/flood_alerts/{alertId}`
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  getDocFromServer,
  getDocsFromServer,
  Firestore,
  Unsubscribe,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  Auth,
} from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { FloodAlert, UserProfile, AuthState, ADMIN_EMAIL, isAppAdmin, ResidentSafetyReport, SafetyStatusType } from '../types';
import { FcmGatewayService } from './fcmGatewayService';
import { smsGatewayService } from './smsGatewayService';

const STORAGE_KEY_USER_PROFILE = 'flood_alert_user_profile';
const STORAGE_KEY_ALERTS = 'flood_alert_history_local';
const STORAGE_KEY_HIDDEN_ALERTS = 'flood_alert_hidden_records_local';
const STORAGE_KEY_SAFETY_REPORTS = 'flood_alert_safety_reports_local';
const STORAGE_KEY_CACHED_USERS = 'fldt_cached_users_v2';
const BROADCAST_CHANNEL_NAME = 'flood_alert_system_sync';

function cleanFirestorePayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = cleanFirestorePayload(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: { providerId?: string | null; email?: string | null }[];
  };
}

class FirebaseFloodService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private auth: Auth | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private alertListeners: Set<(alerts: FloodAlert[]) => void> = new Set();
  private safetyListeners: Set<(reports: ResidentSafetyReport[]) => void> = new Set();
  private authListeners: Set<(state: AuthState) => void> = new Set();
  private userListeners: Set<(users: UserProfile[]) => void> = new Set();
  private firestoreUnsubscribe: Unsubscribe | null = null;
  private safetyFirestoreUnsubscribe: Unsubscribe | null = null;
  private userFirestoreUnsubscribe: Unsubscribe | null = null;
  private cachedUsers: UserProfile[] = [];
  private isFirebaseActive: boolean = false;
  private currentAuthState: AuthState = {
    user: null,
    firebaseUid: null,
    isAuthenticated: false,
    isLoading: true,
  };

  constructor() {
    this.cachedUsers = this.loadCachedUsers();
    this.initBroadcastChannel();
    this.initFirebase();
  }

  private loadCachedUsers(): UserProfile[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CACHED_USERS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }

  private saveCachedUsers(users: UserProfile[]) {
    try {
      this.cachedUsers = users;
      localStorage.setItem(STORAGE_KEY_CACHED_USERS, JSON.stringify(users));
    } catch {}
  }

  private upsertCachedUser(profile: UserProfile) {
    const existing = [...this.cachedUsers];
    const index = existing.findIndex((u) => u.uid === profile.uid || (profile.email && u.email === profile.email));
    if (index >= 0) existing[index] = { ...existing[index], ...profile };
    else existing.unshift(profile);
    this.saveCachedUsers(existing);
    this.notifyUsers(existing);
  }

  private handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
    const currentFbUser = this.auth?.currentUser;
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: currentFbUser?.uid,
        email: currentFbUser?.email,
        emailVerified: currentFbUser?.emailVerified,
        isAnonymous: currentFbUser?.isAnonymous,
        tenantId: currentFbUser?.tenantId,
        providerInfo: currentFbUser?.providerData?.map((p) => ({ providerId: p.providerId, email: p.email })) || [],
      },
      operationType,
      path,
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      } catch {}
    }
  }

  private async initFirebase() {
    try {
      if (!getApps().length) this.app = initializeApp(firebaseConfigJson);
      else this.app = getApp();
      this.db = getFirestore(this.app, (firebaseConfigJson as any).firestoreDatabaseId);
      this.auth = getAuth(this.app);
      this.isFirebaseActive = true;
      onAuthStateChanged(this.auth, async (fbUser) => {
        if (fbUser) await this.syncUserProfile(fbUser);
        else {
          const cached = this.getCachedProfile();
          this.updateAuthState({
            user: cached,
            firebaseUid: cached?.uid || null,
            isAuthenticated: !!cached,
            isLoading: false,
          });
        }
      });
      this.subscribeFirestoreAlerts();
      this.subscribeFirestoreSafetyReports();
      this.subscribeFirestoreUsers();
      if (this.db) smsGatewayService.syncUsersFromFirestore(this.db);
    } catch (err) {
      console.warn('Firebase init error:', err);
      this.isFirebaseActive = false;
      const cached = this.getCachedProfile();
      this.updateAuthState({
        user: cached,
        firebaseUid: cached?.uid || null,
        isAuthenticated: !!cached,
        isLoading: false,
      });
    }
  }

  public getAuthState(): AuthState {
    return this.currentAuthState;
  }

  private updateAuthState(state: AuthState) {
    this.currentAuthState = state;
    this.authListeners.forEach((cb) => cb(state));
  }

  public subscribeAuth(cb: (state: AuthState) => void): () => void {
    this.authListeners.add(cb);
    cb(this.currentAuthState);
    return () => this.authListeners.delete(cb);
  }

  public subscribeUsers(cb: (users: UserProfile[]) => void): () => void {
    this.userListeners.add(cb);
    cb(this.cachedUsers);
    return () => this.userListeners.delete(cb);
  }

  private notifyUsers(users: UserProfile[]) {
    this.userListeners.forEach((cb) => cb(users));
  }

  public subscribeAlerts(cb: (alerts: FloodAlert[]) => void): () => void {
    this.alertListeners.add(cb);
    cb(this.getLocalAlerts());
    return () => this.alertListeners.delete(cb);
  }

  private notifyAlerts(alerts: FloodAlert[]) {
    this.alertListeners.forEach((cb) => cb(alerts));
  }

  public subscribeSafetyReports(cb: (reports: ResidentSafetyReport[]) => void): () => void {
    this.safetyListeners.add(cb);
    cb(this.getLocalSafetyReports());
    return () => this.safetyListeners.delete(cb);
  }

  private notifySafetyReports(reports: ResidentSafetyReport[]) {
    this.safetyListeners.forEach((cb) => cb(reports));
  }

  private getCachedProfile(): UserProfile | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveCachedProfile(profile: UserProfile) {
    try {
      localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(profile));
    } catch {}
  }

  public getLocalAlerts(): FloodAlert[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveLocalAlerts(alerts: FloodAlert[]) {
    try {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    } catch {}
  }

  public getLocalSafetyReports(): ResidentSafetyReport[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAFETY_REPORTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveLocalSafetyReports(reports: ResidentSafetyReport[]) {
    try {
      localStorage.setItem(STORAGE_KEY_SAFETY_REPORTS, JSON.stringify(reports));
    } catch {}
  }

  private async syncUserProfile(fbUser: User) {
    const cached = this.getCachedProfile();
    if (cached) {
      this.updateAuthState({
        user: cached,
        firebaseUid: fbUser.uid,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  }

  private subscribeFirestoreAlerts() {
    if (!this.db) return;
    try {
      const q = query(collection(this.db, 'flood_alerts'), orderBy('timestamp', 'desc'), limit(50));
      this.firestoreUnsubscribe = onSnapshot(q, (snap) => {
        const alerts: FloodAlert[] = [];
        snap.forEach((d) => {
          const data = d.data();
          alerts.push({ id: d.id, ...(data as any) });
        });
        this.saveLocalAlerts(alerts);
        this.notifyAlerts(alerts);
      });
    } catch (err) {
      console.warn('alerts subscribe:', err);
    }
  }

  private subscribeFirestoreSafetyReports() {
    if (!this.db) return;
    try {
      const q = query(collection(this.db, 'safety_reports'), orderBy('timestamp', 'desc'), limit(100));
      this.safetyFirestoreUnsubscribe = onSnapshot(q, (snap) => {
        const reports: ResidentSafetyReport[] = [];
        snap.forEach((d) => {
          const data = d.data();
          reports.push({ id: d.id, ...(data as any) });
        });
        this.saveLocalSafetyReports(reports);
        this.notifySafetyReports(reports);
      });
    } catch (err) {
      console.warn('safety subscribe:', err);
    }
  }

  private subscribeFirestoreUsers() {
    if (!this.db) return;
    try {
      this.userFirestoreUnsubscribe = onSnapshot(collection(this.db, 'users'), (snap) => {
        const users: UserProfile[] = [];
        snap.forEach((d) => {
          const data = d.data();
          users.push({
            uid: d.id,
            name: data.name || 'Community Member',
            village: data.village || 'Dzenje Village',
            phone: data.phone,
            email: data.email,
            smsAlertsEnabled: data.smsAlertsEnabled !== false,
            alertLanguage: data.alertLanguage || 'en',
            authProvider: data.authProvider || 'name_village',
            role: data.role || 'resident',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        this.saveCachedUsers(users);
        this.notifyUsers(users);
      });
    } catch (err) {
      console.warn('users subscribe:', err);
    }
  }

  public async updateUserSmsAlerts(userId: string, enabled: boolean): Promise<void> {
    const updatedAt = new Date().toISOString();
    if (this.db) {
      try {
        await setDoc(doc(this.db, 'users', userId), { smsAlertsEnabled: enabled, updatedAt }, { merge: true });
        try {
          await setDoc(doc(this.db, 'sms_recipients', userId), { enabled, updatedAt }, { merge: true });
        } catch {}
      } catch (err) {
        this.handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
      }
    }
    this.cachedUsers = this.cachedUsers.map((u) =>
      u.uid === userId ? { ...u, smsAlertsEnabled: enabled, updatedAt } : u
    );
    this.notifyUsers(this.cachedUsers);
    const target = this.cachedUsers.find((u) => u.uid === userId);
    if (target?.phone) {
      smsGatewayService.addOrUpdateUserRecipient({
        uid: target.uid,
        name: target.name,
        phone: target.phone,
        village: target.village,
        role: target.role === 'admin' ? 'Village Admin' : 'Registered Resident',
        enabled,
      });
      smsGatewayService.toggleRecipient(userId, enabled);
    }
  }

  public async updateUserRole(userId: string, newRole: 'admin' | 'resident'): Promise<void> {
    const updatedAt = new Date().toISOString();
    if (this.db) {
      await setDoc(doc(this.db, 'users', userId), { role: newRole, updatedAt }, { merge: true });
    }
    this.cachedUsers = this.cachedUsers.map((u) =>
      u.uid === userId ? { ...u, role: newRole, updatedAt } : u
    );
    this.notifyUsers(this.cachedUsers);
  }

  public async deleteUser(userId: string): Promise<void> {
    if (this.db) {
      await deleteDoc(doc(this.db, 'users', userId));
      try {
        await deleteDoc(doc(this.db, 'sms_recipients', userId));
      } catch {}
    }
    this.cachedUsers = this.cachedUsers.filter((u) => u.uid !== userId);
    this.notifyUsers(this.cachedUsers);
    smsGatewayService.removeRecipient(userId);
  }

  public async manualRefreshAll(): Promise<any> {
    if (!this.db) {
      return {
        success: false,
        usersCount: this.cachedUsers.length,
        alertsCount: this.getLocalAlerts().length,
        reportsCount: this.getLocalSafetyReports().length,
        newUsersCount: 0,
        newUsers: [],
        timestamp: Date.now(),
      };
    }
    try {
      const usersSnap = await getDocsFromServer(collection(this.db, 'users'));
      const freshUsers: UserProfile[] = [];
      usersSnap.forEach((d) => {
        const data = d.data();
        freshUsers.push({
          uid: d.id,
          name: data.name || 'Community Member',
          village: data.village || 'Dzenje Village',
          phone: data.phone,
          email: data.email,
          smsAlertsEnabled: data.smsAlertsEnabled !== false,
          alertLanguage: data.alertLanguage || 'en',
          authProvider: data.authProvider || 'name_village',
          role: data.role || 'resident',
        });
      });
      this.saveCachedUsers(freshUsers);
      this.notifyUsers(freshUsers);
      if (this.db) smsGatewayService.syncUsersFromFirestore(this.db);
      return {
        success: true,
        usersCount: freshUsers.length,
        alertsCount: this.getLocalAlerts().length,
        reportsCount: this.getLocalSafetyReports().length,
        newUsersCount: 0,
        newUsers: [],
        timestamp: Date.now(),
      };
    } catch (err) {
      console.warn('manualRefreshAll:', err);
      return {
        success: false,
        usersCount: this.cachedUsers.length,
        alertsCount: this.getLocalAlerts().length,
        reportsCount: this.getLocalSafetyReports().length,
        newUsersCount: 0,
        newUsers: [],
        timestamp: Date.now(),
      };
    }
  }

  public async dismissAlert(id: string): Promise<void> {
    if (this.db) {
      try {
        await updateDoc(doc(this.db, 'flood_alerts', id), {
          status: 'dismissed',
          dismissedAt: Date.now(),
        });
      } catch {}
    }
    const alerts = this.getLocalAlerts().map((a) =>
      a.id === id ? { ...a, status: 'dismissed' as const } : a
    );
    this.saveLocalAlerts(alerts);
    this.notifyAlerts(alerts);
  }

  public async clearAllAlerts(): Promise<void> {
    this.saveLocalAlerts([]);
    this.notifyAlerts([]);
  }

  public async deleteSafetyReport(id: string): Promise<void> {
    if (this.db) {
      try {
        await deleteDoc(doc(this.db, 'safety_reports', id));
      } catch {}
    }
    const reports = this.getLocalSafetyReports().filter((r) => r.id !== id);
    this.saveLocalSafetyReports(reports);
    this.notifySafetyReports(reports);
  }

  public async recordFloodAlert(payload: Partial<FloodAlert>): Promise<FloodAlert> {
    const alert: FloodAlert = {
      id: 'local_' + Date.now(),
      timestamp: payload.timestamp || Date.now(),
      formattedTime: payload.formattedTime || new Date().toLocaleTimeString(),
      peakDelta: payload.peakDelta || 0,
      durationSeconds: payload.durationSeconds || 0,
      nodeId: payload.nodeId || 'node',
      nodeName: payload.nodeName || 'Sensor',
      village: payload.village,
      status: payload.status || 'active',
      severity: payload.severity || 'red',
      title: payload.title,
      message: payload.message,
      source: payload.source || 'manual_test',
      notes: payload.notes,
      latitude: payload.latitude,
      longitude: payload.longitude,
      mapsUrl: payload.mapsUrl,
      riverName: payload.riverName,
    } as FloodAlert;
    if (this.db) {
      try {
        const ref = await addDoc(collection(this.db, 'flood_alerts'), cleanFirestorePayload(alert as any));
        alert.id = ref.id;
      } catch (err) {
        console.warn('recordFloodAlert firestore:', err);
      }
    }
    const alerts = [alert, ...this.getLocalAlerts()].slice(0, 50);
    this.saveLocalAlerts(alerts);
    this.notifyAlerts(alerts);
    return alert;
  }

  public async submitSafetyReport(payload: any): Promise<ResidentSafetyReport> {
    const report: any = {
      id: 'local_' + Date.now(),
      userId: payload.userId || 'guest',
      userName: payload.userName || 'Resident',
      village: payload.village || 'Dzenje Village',
      status: payload.status || 'safe',
      phone: payload.phone,
      message: payload.message,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString(),
      latitude: payload.latitude,
      longitude: payload.longitude,
      mapsUrl: payload.mapsUrl,
    };
    if (this.db) {
      try {
        const ref = await addDoc(collection(this.db, 'safety_reports'), cleanFirestorePayload(report));
        report.id = ref.id;
      } catch (err) {
        console.warn('submitSafetyReport:', err);
      }
    }
    const reports = [report, ...this.getLocalSafetyReports()].slice(0, 100);
    this.saveLocalSafetyReports(reports);
    this.notifySafetyReports(reports);
    return report;
  }

  public async signInWithNameAndVillage(
    name: string,
    village: string,
    phone?: string
  ): Promise<UserProfile> {
    const uid = 'nv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const now = new Date().toISOString();
    const profile: UserProfile = {
      uid,
      name: name.trim(),
      village: village.trim() || 'Dzenje Village',
      phone: phone?.trim(),
      authProvider: 'name_village',
      role: 'resident',
      smsAlertsEnabled: true,
      createdAt: now,
      updatedAt: now,
    } as UserProfile;
    if (this.auth && !this.auth.currentUser) {
      try {
        await signInAnonymously(this.auth);
      } catch {}
    }
    if (this.db) {
      try {
        await setDoc(doc(this.db, 'users', uid), cleanFirestorePayload(profile as any), { merge: true });
      } catch (err) {
        console.warn('signIn name village firestore:', err);
      }
    }
    this.saveCachedProfile(profile);
    this.upsertCachedUser(profile);
    this.updateAuthState({
      user: profile,
      firebaseUid: this.auth?.currentUser?.uid || uid,
      isAuthenticated: true,
      isLoading: false,
    });
    if (profile.phone) {
      smsGatewayService.addOrUpdateUserRecipient({
        uid: profile.uid,
        name: profile.name,
        phone: profile.phone,
        village: profile.village,
        enabled: true,
      });
    }
    return profile;
  }

  public async signInWithGoogle(village?: string): Promise<UserProfile> {
    if (!this.auth) throw new Error('Firebase Auth not ready');
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const fbUser = result.user;
    const now = new Date().toISOString();
    const profile: UserProfile = {
      uid: fbUser.uid,
      name: fbUser.displayName || 'User',
      email: fbUser.email || undefined,
      village: village || 'Dzenje Village',
      authProvider: 'google',
      role: isAppAdmin({ email: fbUser.email || '', role: 'resident' } as any) ? 'admin' : 'resident',
      smsAlertsEnabled: true,
      photoURL: fbUser.photoURL || undefined,
      createdAt: now,
      updatedAt: now,
    } as UserProfile;
    if (this.db) {
      await setDoc(doc(this.db, 'users', fbUser.uid), cleanFirestorePayload(profile as any), { merge: true });
    }
    this.saveCachedProfile(profile);
    this.upsertCachedUser(profile);
    this.updateAuthState({
      user: profile,
      firebaseUid: fbUser.uid,
      isAuthenticated: true,
      isLoading: false,
    });
    return profile;
  }

  public async signOutUser(): Promise<void> {
    if (this.auth) await signOut(this.auth);
    try {
      localStorage.removeItem(STORAGE_KEY_USER_PROFILE);
    } catch {}
    this.updateAuthState({
      user: null,
      firebaseUid: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }

  public async signOut(): Promise<void> {
    await this.signOutUser();
  }

  public async updateProfileData(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = this.currentAuthState.user;
    if (!current) throw new Error('Not signed in');
    const updated: UserProfile = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    } as UserProfile;
    if (this.db) {
      await setDoc(doc(this.db, 'users', current.uid), cleanFirestorePayload(updated as any), { merge: true });
    }
    this.saveCachedProfile(updated);
    this.upsertCachedUser(updated);
    this.updateAuthState({ ...this.currentAuthState, user: updated });
    if (updated.phone) {
      smsGatewayService.addOrUpdateUserRecipient({
        uid: updated.uid,
        name: updated.name,
        phone: updated.phone,
        village: updated.village,
        enabled: updated.smsAlertsEnabled !== false,
      });
    }
    return updated;
  }

  public isFirebaseConnected(): boolean {
    return this.isFirebaseActive && this.db !== null;
  }

  public getIsFirebaseConnected(): boolean {
    return this.isFirebaseConnected();
  }

  public async deleteAlert(alertId: string, _forceAdmin: boolean = false): Promise<void> {
    await this.dismissAlert(alertId);
    if (this.db) {
      try {
        await deleteDoc(doc(this.db, 'flood_alerts', alertId));
      } catch (err) {
        console.warn('deleteAlert firestore:', err);
      }
    }
  }

  public async clearAlerts(_forceAdmin: boolean = false): Promise<void> {
    await this.clearAllAlerts();
  }
}

export const firebaseFloodService = new FirebaseFloodService();
