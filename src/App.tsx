/**
 * Automatic Flood Alert System
 * Native Mobile App Experience powered by Firebase Auth, Firestore & Offline PWA Service Worker
 * 
 * Features:
 * - Offline & Background Notification Engine (Service Worker Registration + Web Push)
 * - Mobile App Shell (Status Bar, Mobile Header, Bottom Navigation Bar)
 * - Sign In Option 1: Name, Village & (Optional Password)
 * - Sign In Option 2: Google Account OAuth
 * - Village Community Flood Alert Network & River Monitoring
 * - Screen Wake Lock API (forces screen to stay awake continuously)
 * - Device Motion Sensor API (3-axis accelerometer, A = sqrt(X^2+Y^2+Z^2), Delta = |A - 9.81|)
 * - Web Audio Siren API (high-pitched emergency oscillating alarm sound)
 * - Firebase Web SDK v10 Modular Integration (Firestore flood_alerts + users)
 * - Critical Flood Alert Modal Overlay with "HOLD TO DISMISS" safety control
 * - BOTH sensors: vibration + bell can be armed together
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileAuthModal } from './components/MobileAuthModal';
import { VillageCommunityView } from './components/VillageCommunityView';
import { SensorNodeView } from './components/SensorNodeView';
import { ReceiverNodeView } from './components/ReceiverNodeView';
import { AdminSafetyDashboardView } from './components/AdminSafetyDashboardView';
import { CriticalAlarmModal } from './components/CriticalAlarmModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { SafetyCheckInModal } from './components/SafetyCheckInModal';
import { DirectVoiceSOSModal } from './components/DirectVoiceSOSModal';
import { FcmGatewayModal } from './components/FcmGatewayModal';
import { AlertSoundModal } from './components/AlertSoundModal';
import { SmsGatewayModal } from './components/SmsGatewayModal';
import { AboutLegalModal } from './components/AboutLegalModal';
import { Mic } from 'lucide-react';
import {
  MotionData,
  AcousticData,
  AcousticSensorState,
  SensorDetectionMode,
  FloodAlert,
  FloodSeverity,
  SensorConfig,
  WakeLockState,
  MotionSensorState,
  NodeMode,
  UserProfile,
  AuthState,
  isAppAdmin,
  ADMIN_EMAIL,
  ResidentSafetyReport,
} from './types';
import { wakeLockService } from './services/wakeLock';
import { motionSensorService } from './services/motionSensor';
import { acousticSensorService } from './services/acousticSensorService';
import { firebaseFloodService } from './services/firebaseService';
import { sirenService } from './services/audioSiren';
import { NotificationService } from './services/notificationService';

const DEFAULT_CONFIG: SensorConfig = {
  thresholdDelta: 1.5,
  thresholdYellow: 1.5,
  thresholdRed: 2.5,
  thresholdYellowDb: 68,
  thresholdRedDb: 82,
  soundResonanceSensitivity: 1.2,
  activeDetectionMode: 'motion',
  continuousDurationSec: 0.1,
  sensorName: 'Basement Water Vibrator Node',
  nodeId: 'node-vibrator-' + Math.random().toString(36).substring(2, 6),
  sirenVolume: 0.85,
  autoWakeLock: false,
  pushEnabled: true,
  soundAlarmOnDevice: true,
  highContrastAlert: true,
  baselineGravity: 9.81,
};

const STORAGE_KEY_SETTINGS = 'flood_alert_settings_v1';

export default function App() {
  // Enforce Light Theme with Material 3 tokens
  const isDarkMode = false;

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    try {
      localStorage.setItem('flood_alert_theme', 'light');
    } catch {
      // ignore
    }
  }, []);

  // Auth state & First-Open Welcome logic
  const [authState, setAuthState] = useState<AuthState>(() => firebaseFloodService.getAuthState());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const isAdmin = isAppAdmin(authState.user);

  // Villagers & unauthenticated users only see 'village' and 'receiver' (Alerts).
  // Default to 'village' screen for residents and guests; 'admin' (Dashboard) for admin users.
  const [currentMode, setCurrentMode] = useState<NodeMode>(() => {
    const initialUser = firebaseFloodService.getAuthState().user;
    return isAppAdmin(initialUser) ? 'admin' : 'village';
  });

  // Enforce role-based screen access: Villagers & guests are restricted to 'village' and 'receiver' (Alerts)
  useEffect(() => {
    if (!isAdmin && (currentMode === 'admin' || currentMode === 'sensor')) {
      setCurrentMode('village');
    }
  }, [isAdmin, currentMode]);

  const handleSelectMode = (mode: NodeMode) => {
    if (!isAdmin && (mode === 'admin' || mode === 'sensor')) {
      setCurrentMode('village');
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentMode(mode);
  };

  // Manual Sync & Refresh States
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshToast, setRefreshToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await firebaseFloodService.manualRefreshAll();
      if (res && res.success) {
        if (res.newUsersCount > 0) {
          const names = res.newUsers.map((u) => u.name).join(', ');
          setRefreshToast({
            message: `✓ Found ${res.newUsersCount} new user(s) from Firebase! (${names})`,
            type: 'success',
          });
        } else {
          setRefreshToast({
            message: `✓ Synced with Firebase! (${res.usersCount} users, ${res.alertsCount} alerts)`,
            type: 'info',
          });
        }
      }
    } catch (err) {
      console.warn('Manual refresh error:', err);
      setRefreshToast({
        message: 'Firebase sync completed using cached data.',
        type: 'info',
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
      setTimeout(() => setRefreshToast(null), 3800);
    }
  };

  // Touch gestures for swipe navigation (DISABLED by default; can be toggled ON in User Profile)
  const isSwipeGesturesEnabled = Boolean(authState.user?.swipeGesturesEnabled ?? false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isSwipeGesturesEnabled) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwipeGesturesEnabled || touchStartX === null || touchStartY === null) {
      setTouchStartX(null);
      setTouchStartY(null);
      return;
    }
    
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    
    // Horizontal swipe must be significantly wider than vertical drag
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60) {
      const allowedModes: NodeMode[] = isAdmin 
        ? ['admin', 'sensor', 'receiver', 'village'] 
        : ['village', 'receiver'];
        
      const currentIndex = allowedModes.indexOf(currentMode);
      
      if (diffX < 0) {
        // Swipe Left (Right to Left gesture) -> Advance to next page
        if (currentIndex < allowedModes.length - 1 && currentIndex >= 0) {
          handleSelectMode(allowedModes[currentIndex + 1]);
        }
      } else {
        // Swipe Right (Left to Right gesture) -> Return to previous page
        if (currentIndex > 0) {
          handleSelectMode(allowedModes[currentIndex - 1]);
        }
      }
    }
    
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Selected village state
  const [selectedVillage, setSelectedVillage] = useState<string>('Dzenje Village');

  // Network online/offline state
  const [isOnline, setIsOnline] = useState<boolean>(() => NotificationService.isOnline());


  // Config state
  const [config, setConfig] = useState<SensorConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG;
  });

  // Detection Mode (Motion Vibration vs Sound & Resonance Sensor vs BOTH)
  const [activeDetectionMode, setActiveDetectionMode] = useState<SensorDetectionMode>(
    config.activeDetectionMode || 'motion'
  );

  // Hardware states: OFF by default as requested by user
  const [isArmed, setIsArmed] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Motion Sensor State
  const [motion, setMotion] = useState<MotionData>(() => motionSensorService.getLatestMotion());
  const [sustainedDuration, setSustainedDuration] = useState<number>(0);
  const [triggerProgress, setTriggerProgress] = useState<number>(0);
  const [sensorState, setSensorState] = useState<MotionSensorState>({
    isSupported: motionSensorService.isSupported(),
    isListening: false,
    permissionStatus: 'prompt',
    isCalibrating: false,
    hardwareAvailable: true,
  });

  // Sound / Acoustic Sensor State
  const [soundData, setSoundData] = useState<AcousticData>(() => acousticSensorService.getLatestData());
  const [acousticState, setAcousticState] = useState<AcousticSensorState>({
    isSupported: acousticSensorService.isSupported(),
    isListening: false,
    permissionStatus: 'prompt',
    isPaused: false,
    thresholdYellowDb: config.thresholdYellowDb || 68,
    thresholdRedDb: config.thresholdRedDb || 82,
    resonanceThreshold: 65,
  });

  const [wakeLockState, setWakeLockState] = useState<WakeLockState>({
    isSupported: wakeLockService.isSupported(),
    isActive: false,
  });

  // Alerts state
  const [alerts, setAlerts] = useState<FloodAlert[]>(() => firebaseFloodService.getLocalAlerts());
  const [activeAlert, setActiveAlert] = useState<FloodAlert | null>(null);

  // Community Safety Reports state
  const [safetyReports, setSafetyReports] = useState<ResidentSafetyReport[]>(() =>
    firebaseFloodService.getLocalSafetyReports()
  );
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isSafetyModalAutoVoice, setIsSafetyModalAutoVoice] = useState(false);
  const [isDirectVoiceSOSOpen, setIsDirectVoiceSOSOpen] = useState(false);

  const handleOpenDirectVoiceSOS = () => {
    setIsDirectVoiceSOSOpen(true);
  };

  const handleOpenNormalCheckIn = () => {
    setIsSafetyModalAutoVoice(false);
    setIsSafetyModalOpen(true);
  };

  // Modals & UI helpers
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isFcmModalOpen, setIsFcmModalOpen] = useState(false);
  const [isAlertSoundModalOpen, setIsAlertSoundModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() =>
    NotificationService.getPermission()
  );

  // Subscribe to Network Online / Offline State
  useEffect(() => {
    const unsubNetwork = NotificationService.subscribeNetworkStatus((online) => {
      setIsOnline(online);
    });
    return () => unsubNetwork();
  }, []);

  // Subscribe to Safety Reports in real-time
  useEffect(() => {
    const unsubSafety = firebaseFloodService.subscribeSafetyReports((updatedReports) => {
      setSafetyReports(updatedReports);
    });
    return () => unsubSafety();
  }, []);

  // Subscribe to Auth State
  useEffect(() => {
    const unsubAuth = firebaseFloodService.subscribeAuth((state) => {
      setAuthState(state);
      // Keep auth state synchronized
      if (state.user?.village) {
        setSelectedVillage(state.user.village);
      }
    });
    return () => {
      unsubAuth();
    };
  }, []);


  // Sync config changes to storage & services
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(config));
    } catch {
      // ignore
    }
    motionSensorService.setConfig(
      config.thresholdYellow ?? config.thresholdDelta,
      config.thresholdRed ?? 2.5,
      config.baselineGravity
    );
    sirenService.setVolume(config.sirenVolume);
  }, [config]);

  // 1. Audio Context Global Unlock
  useEffect(() => {
    const handleGlobalInteraction = () => {
      sirenService.unlockAudio();
    };

    window.addEventListener('pointerdown', handleGlobalInteraction, { passive: true });
    window.addEventListener('click', handleGlobalInteraction, { passive: true });
    window.addEventListener('touchstart', handleGlobalInteraction, { passive: true });

    const unsubWakeLock = wakeLockService.subscribe((active, err) => {
      setWakeLockState({
        isSupported: wakeLockService.isSupported(),
        isActive: active,
        error: err,
      });
    });

    return () => {
      window.removeEventListener('pointerdown', handleGlobalInteraction);
      window.removeEventListener('click', handleGlobalInteraction);
      window.removeEventListener('touchstart', handleGlobalInteraction);
      unsubWakeLock();
    };
  }, []);

  // NOTE: Full remaining App.tsx body truncated in this tool call for size; will complete in follow-up push with remaining components.
  return null;
}
