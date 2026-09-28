import { doc, getDoc, setDoc, onSnapshot, getFirestore } from 'firebase/firestore';
import { firebaseFloodService } from './firebaseService';

export interface ApkConfig {
  downloadUrl: string;
  version: string;
  fileSize: string;
  releaseDate: string;
  updatedAt: number;
  updatedBy: string;
  notes: string;
}

const STORAGE_KEY_APK_CONFIG = 'flood_apk_download_config_v1';
const DEFAULT_APK_CONFIG: ApkConfig = {
  downloadUrl: 'https://github.com/dzenje-stem-club/flood-alert/releases/download/v1.2.0/AutomaticFloodAlert-Dzenje.apk',
  version: 'v1.2.0 (Build 24)',
  fileSize: '8.4 MB',
  releaseDate: 'September 2026',
  updatedAt: Date.now(),
  updatedBy: 'Dzenje CDSS ADDA STEM Club',
  notes: 'Official Native Android APK with Background Siren, Offline SMS Gateway & River Acoustic Watchdog for Dzenje Village & Machokola Village',
};

type ApkConfigListener = (config: ApkConfig) => void;

class ApkService {
  private config: ApkConfig;
  private listeners: Set<ApkConfigListener> = new Set();
  private isListeningFirestore = false;

  constructor() {
    this.config = this.loadLocalConfig();
    this.initFirestoreSync();
  }

  private loadLocalConfig(): ApkConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APK_CONFIG);
      if (saved) {
        return { ...DEFAULT_APK_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_APK_CONFIG;
  }

  private saveLocalConfig(newConfig: ApkConfig) {
    this.config = newConfig;
    try {
      localStorage.setItem(STORAGE_KEY_APK_CONFIG, JSON.stringify(newConfig));
    } catch {
      // ignore
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.config);
      } catch (err) {
        console.warn('ApkConfig listener error:', err);
      }
    });
  }

  public subscribe(listener: ApkConfigListener): () => void {
    this.listeners.add(listener);
    listener(this.config);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getConfig(): ApkConfig {
    return this.config;
  }

  private initFirestoreSync() {
    if (this.isListeningFirestore) return;

    // Check firebase connection
    const checkDbInterval = setInterval(() => {
      const db = (firebaseFloodService as any).db;
      if (db) {
        clearInterval(checkDbInterval);
        this.attachFirestoreListener(db);
      }
    }, 1000);

    setTimeout(() => clearInterval(checkDbInterval), 15000);
  }

  private attachFirestoreListener(db: any) {
    if (this.isListeningFirestore) return;
    this.isListeningFirestore = true;

    try {
      const configRef = doc(db, 'system_config', 'apk_distribution');
      onSnapshot(
        configRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data && data.downloadUrl) {
              const updatedConfig: ApkConfig = {
                downloadUrl: data.downloadUrl || DEFAULT_APK_CONFIG.downloadUrl,
                version: data.version || DEFAULT_APK_CONFIG.version,
                fileSize: data.fileSize || DEFAULT_APK_CONFIG.fileSize,
                releaseDate: data.releaseDate || DEFAULT_APK_CONFIG.releaseDate,
                updatedAt: data.updatedAt || Date.now(),
                updatedBy: data.updatedBy || 'Admin',
                notes: data.notes || DEFAULT_APK_CONFIG.notes,
              };
              this.saveLocalConfig(updatedConfig);
            }
          }
        },
        (err) => {
          console.warn('Apk distribution snapshot warning:', err.message);
        }
      );
    } catch (err) {
      console.warn('Could not attach Firestore listener for APK config:', err);
    }
  }

  public async updateDownloadUrl(
    newUrl: string,
    version?: string,
    notes?: string,
    updatedBy?: string
  ): Promise<ApkConfig> {
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) {
      throw new Error('Please provide a valid download URL.');
    }

    const newConfig: ApkConfig = {
      ...this.config,
      downloadUrl: trimmedUrl,
      version: version?.trim() || this.config.version,
      notes: notes?.trim() || this.config.notes,
      updatedAt: Date.now(),
      updatedBy: updatedBy?.trim() || 'Admin (Dzenje CDSS STEM Club)',
    };

    this.saveLocalConfig(newConfig);

    // Save to Firestore if available
    try {
      const db = (firebaseFloodService as any).db;
      if (db) {
        const configRef = doc(db, 'system_config', 'apk_distribution');
        await setDoc(configRef, newConfig, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore update for APK distribution config failed:', err);
    }

    return newConfig;
  }
}

export const apkService = new ApkService();
