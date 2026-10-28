/**
 * Automatic Flood Alert System - Sensor isolation build
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
import { i18nService } from './services/i18n';
import {
  MotionData, AcousticData, AcousticSensorState, SensorDetectionMode,
  FloodAlert, FloodSeverity, SensorConfig, WakeLockState, MotionSensorState,
  NodeMode, AuthState, isAppAdmin, ResidentSafetyReport,
} from './types';
import { wakeLockService } from './services/wakeLock';
import { motionSensorService } from './services/motionSensor';
import { acousticSensorService } from './services/acousticSensorService';
import { firebaseFloodService } from './services/firebaseService';
import { sirenService } from './services/audioSiren';
import { NotificationService } from './services/notificationService';
import { startSensorsForMode, stopAllSensors, applyAcousticConfig } from './services/sensorIsolation';

const DEFAULT_CONFIG: SensorConfig = {
  thresholdDelta: 1.5, thresholdYellow: 1.5, thresholdRed: 2.5,
  thresholdYellowDb: 68, thresholdRedDb: 82, soundResonanceSensitivity: 1.2,
  activeDetectionMode: 'motion', continuousDurationSec: 0.1,
  sensorName: 'Basement Water Vibrator Node',
  nodeId: 'node-vibrator-' + Math.random().toString(36).substring(2, 6),
  sirenVolume: 0.85, autoWakeLock: false, pushEnabled: true,
  soundAlarmOnDevice: true, highContrastAlert: true, baselineGravity: 9.81,
};
const STORAGE_KEY_SETTINGS = 'flood_alert_settings_v1';

export default function App() {
  const isDarkMode = false;
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    try { localStorage.setItem('flood_alert_theme', 'light'); } catch {}
  }, []);

  const [authState, setAuthState] = useState<AuthState>(() => firebaseFloodService.getAuthState());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isAdmin = isAppAdmin(authState.user);
  const [currentMode, setCurrentMode] = useState<NodeMode>(() =>
    isAppAdmin(firebaseFloodService.getAuthState().user) ? 'admin' : 'village'
  );

  useEffect(() => {
    if (!isAdmin && (currentMode === 'admin' || currentMode === 'sensor')) setCurrentMode('village');
  }, [isAdmin, currentMode]);

  const handleSelectMode = (mode: NodeMode) => {
    if (!isAdmin && (mode === 'admin' || mode === 'sensor')) {
      setCurrentMode('village');
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentMode(mode);
  };

  const [selectedVillage, setSelectedVillage] = useState('Dzenje Village');
  const [isOnline, setIsOnline] = useState(() => NotificationService.isOnline());
  const [config, setConfig] = useState<SensorConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_CONFIG;
  });
  const [activeDetectionMode, setActiveDetectionMode] = useState<SensorDetectionMode>(
    config.activeDetectionMode || 'motion'
  );
  const [isArmed, setIsArmed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [motion, setMotion] = useState<MotionData>(() => motionSensorService.getLatestMotion());
  const [sustainedDuration, setSustainedDuration] = useState(0);
  const [triggerProgress, setTriggerProgress] = useState(0);
  const [sensorState, setSensorState] = useState<MotionSensorState>({
    isSupported: motionSensorService.isSupported(), isListening: false,
    permissionStatus: 'prompt', isCalibrating: false, hardwareAvailable: true,
  });
  const [soundData, setSoundData] = useState<AcousticData>(() => acousticSensorService.getLatestData());
  const [acousticState, setAcousticState] = useState<AcousticSensorState>({
    isSupported: acousticSensorService.isSupported(), isListening: false,
    permissionStatus: 'prompt', isPaused: false,
    thresholdYellowDb: config.thresholdYellowDb || 68,
    thresholdRedDb: config.thresholdRedDb || 82, resonanceThreshold: 65,
  });
  const [wakeLockState, setWakeLockState] = useState<WakeLockState>({
    isSupported: wakeLockService.isSupported(), isActive: false,
  });
  const [alerts, setAlerts] = useState<FloodAlert[]>(() => firebaseFloodService.getLocalAlerts());
  const [activeAlert, setActiveAlert] = useState<FloodAlert | null>(null);
  const [safetyReports, setSafetyReports] = useState<ResidentSafetyReport[]>(() =>
    firebaseFloodService.getLocalSafetyReports()
  );
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() =>
    NotificationService.getPermission()
  );

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(config)); } catch {}
    motionSensorService.setConfig(
      config.thresholdYellow ?? config.thresholdDelta,
      config.thresholdRed ?? 2.5,
      config.baselineGravity
    );
    applyAcousticConfig(
      config.thresholdYellowDb ?? 68,
      config.thresholdRedDb ?? 82,
      config.soundResonanceSensitivity ?? 1.2
    );
    sirenService.setVolume(config.sirenVolume);
  }, [config]);

  useEffect(() => {
    const unsub = NotificationService.subscribeNetworkStatus((online) => {
      queueMicrotask(() => setIsOnline(online));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = firebaseFloodService.subscribeAuth((state) => {
      queueMicrotask(() => {
        setAuthState(state);
        if (state.user?.village) setSelectedVillage(state.user.village);
      });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isAdmin && i18nService.getLanguage() !== 'en') i18nService.setLanguage('en');
  }, [isAdmin]);

  useEffect(() => {
    const unlock = () => sirenService.unlockAudio();
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
    const unsubWake = wakeLockService.subscribe((active, err) => {
      queueMicrotask(() => setWakeLockState({
        isSupported: wakeLockService.isSupported(), isActive: active, error: err,
      }));
    });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('click', unlock);
      unsubWake();
    };
  }, []);

  useEffect(() => {
    const unsub = firebaseFloodService.subscribeAlerts((updated) => {
      queueMicrotask(() => {
        setAlerts(updated);
        const current = updated.find((a) => a.status === 'active');
        if (current && (!activeAlert || activeAlert.id !== current.id)) {
          setActiveAlert(current);
          if (!isAdmin) {
            sirenService.unlockAudio();
            if (current.severity === 'yellow') sirenService.startWarningChime();
            else sirenService.startEmergencySiren();
          } else {
            sirenService.stopAllAlarms();
          }
        }
      });
    });
    return () => unsub();
  }, [activeAlert, isAdmin]);

  const handleFloodTrigger = useCallback(
    async (
      peakValue: number,
      severity: FloodSeverity = 'red',
      durationSec: number = 0.1,
      source: 'hardware_sensor' | 'acoustic_sound_sensor' | 'manual_test' | 'simulated' = 'hardware_sensor'
    ) => {
      const userVillage = authState.user?.village || 'Dzenje Village';
      const isYellow = severity === 'yellow';
      const isAcoustic = source === 'acoustic_sound_sensor';
      let title = isYellow ? 'HIGH FLOOD RISK — Stay Alert' : 'CRITICAL FLOOD WARNING — Move to Higher Ground Now';
      let message = isYellow
        ? `River water is rising fast near ${userVillage}. Stay alert.`
        : `Rapid flood water detected near ${userVillage}. Move to high ground immediately.`;
      if (isAcoustic) {
        title = isYellow ? 'HIGH FLOOD RISK — Warning Bell Ringing' : 'CRITICAL FLOOD WARNING — Move to Higher Ground Now';
        message = isYellow
          ? `Emergency flood warning bell ringing near ${userVillage}.`
          : `Continuous emergency warning bell near ${userVillage}! Evacuate!`;
      }
      await firebaseFloodService.recordFloodAlert({
        timestamp: Date.now(),
        formattedTime: new Date().toLocaleTimeString(),
        peakDelta: peakValue,
        durationSeconds: durationSec,
        nodeId: config.nodeId,
        nodeName: config.sensorName,
        village: userVillage,
        status: 'active',
        source,
        severity,
        title,
        message,
        notes: isAcoustic
          ? `Sound sensor: ${peakValue.toFixed(0)} dB (${severity.toUpperCase()})`
          : `Vibration: ${peakValue.toFixed(1)} m/s2 (${severity.toUpperCase()})`,
      });
    },
    [config.nodeId, config.sensorName, authState.user?.village]
  );

  useEffect(() => {
    let animId: number | null = null;
    let pending: { motion: MotionData; sust: number; prog: number } | null = null;
    const unsub = motionSensorService.onMotion((m, sust, prog) => {
      pending = { motion: m, sust, prog };
      if (animId === null) {
        animId = requestAnimationFrame(() => {
          animId = null;
          if (pending) {
            setMotion(pending.motion);
            setSustainedDuration(pending.sust);
            setTriggerProgress(pending.prog);
          }
        });
      }
    });
    const unsubState = motionSensorService.onStateChange((s) => {
      queueMicrotask(() => setSensorState(s));
    });
    const unsubTrigger = motionSensorService.onTrigger((peak, sev, dur, src) => {
      handleFloodTrigger(peak, sev, dur, src === 'simulated' ? 'simulated' : 'hardware_sensor');
    });
    return () => {
      unsub();
      unsubState();
      unsubTrigger();
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, [handleFloodTrigger]);

  useEffect(() => {
    const unsubSound = acousticSensorService.onSoundData((data) => {
      queueMicrotask(() => setSoundData(data));
    });
    const unsubState = acousticSensorService.onStateChange((s) => {
      queueMicrotask(() => setAcousticState(s));
    });
    const unsubTrigger = acousticSensorService.onTrigger((peak, sev, dur, src) => {
      handleFloodTrigger(peak, sev, dur, src);
    });
    return () => {
      unsubSound();
      unsubState();
      unsubTrigger();
    };
  }, [handleFloodTrigger]);

  // STRICT isolation: only selected sensor runs
  useEffect(() => {
    if (isArmed) {
      startSensorsForMode(activeDetectionMode, !!config.autoWakeLock);
    } else {
      stopAllSensors();
    }
  }, [isArmed, activeDetectionMode, config.autoWakeLock]);

  const handleToggleArm = (targetMode?: SensorDetectionMode) => {
    const modeToUse = targetMode || activeDetectionMode;
    if (targetMode && targetMode !== activeDetectionMode) {
      setActiveDetectionMode(targetMode);
      setConfig((prev) => ({ ...prev, activeDetectionMode: targetMode }));
    }
    setIsArmed((prev) => {
      const next = !prev;
      setIsPaused(false);
      if (next) startSensorsForMode(modeToUse, !!config.autoWakeLock);
      else stopAllSensors();
      return next;
    });
  };

  const handleTurnOnBothSensors = () => {
    setActiveDetectionMode('both');
    setConfig((prev) => ({ ...prev, activeDetectionMode: 'both' }));
    setIsPaused(false);
    setIsArmed(true);
    startSensorsForMode('both', !!config.autoWakeLock);
  };

  const handleSelectDetectionMode = (mode: SensorDetectionMode) => {
    setActiveDetectionMode(mode);
    setConfig((prev) => ({ ...prev, activeDetectionMode: mode }));
    setIsPaused(false);
    if (isArmed) startSensorsForMode(mode, !!config.autoWakeLock);
    else stopAllSensors();
  };

  const handleTogglePause = () => {
    if (activeDetectionMode === 'motion') {
      setIsPaused(motionSensorService.togglePause());
    } else if (activeDetectionMode === 'sound') {
      setIsPaused(acousticSensorService.togglePause());
    } else {
      const p1 = motionSensorService.togglePause();
      const p2 = acousticSensorService.togglePause();
      setIsPaused(p1 || p2);
    }
  };

  const handleCalibrateBaseline = async () => {
    const b = await motionSensorService.calibrateBaseline();
    setConfig((prev) => ({ ...prev, baselineGravity: b }));
    return b;
  };

  const handleSimulateTest = (severity: 'yellow' | 'red' = 'red') => {
    motionSensorService.simulateTest(severity);
  };

  const handleSimulateSoundTest = (severity: 'yellow' | 'red' = 'red') => {
    acousticSensorService.simulateSoundTest(severity);
  };

  const handleDismissAlert = async () => {
    if (activeAlert) {
      await firebaseFloodService.dismissAlert(activeAlert.id);
      setActiveAlert(null);
      sirenService.stopAllAlarms();
    }
  };

  const handleTurnOffSensorAndDismiss = async () => {
    setIsArmed(false);
    stopAllSensors();
    await handleDismissAlert();
  };

  const handleRequestNotificationPermission = async () => {
    const p = await NotificationService.requestPermission();
    setNotificationPermission(p);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <TopBar
        isOnline={isOnline}
        isAdmin={isAdmin}
        user={authState.user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={() => firebaseFloodService.signOut()}
      />
      <main className="flex-1 overflow-y-auto pb-20 px-3 pt-2">
        {currentMode === 'village' && (
          <VillageCommunityView
            selectedVillage={selectedVillage}
            onSelectVillage={setSelectedVillage}
            safetyReports={safetyReports}
            alerts={alerts}
            currentUser={authState.user}
          />
        )}
        {currentMode === 'sensor' && (
          <SensorNodeView
            motion={motion}
            sensorState={sensorState}
            soundData={soundData}
            acousticState={acousticState}
            activeDetectionMode={activeDetectionMode}
            onSelectDetectionMode={handleSelectDetectionMode}
            wakeLockState={wakeLockState}
            config={config}
            isArmed={isArmed}
            isPaused={isPaused}
            sustainedDuration={sustainedDuration}
            triggerProgress={triggerProgress}
            isDarkMode={isDarkMode}
            isAdmin={isAdmin}
            currentUser={authState.user}
            onToggleArm={handleToggleArm}
            onTurnOnBothSensors={handleTurnOnBothSensors}
            onTogglePause={handleTogglePause}
            onCalibrate={handleCalibrateBaseline}
            onSimulateTest={handleSimulateTest}
            onSimulateSoundTest={handleSimulateSoundTest}
            onGoToReceiver={() => handleSelectMode('receiver')}
            onGoToAdmin={() => handleSelectMode('admin')}
          />
        )}
        {currentMode === 'receiver' && (
          <ReceiverNodeView
            alerts={alerts}
            notificationPermission={notificationPermission}
            onRequestNotificationPermission={handleRequestNotificationPermission}
          />
        )}
        {currentMode === 'admin' && isAdmin && (
          <AdminSafetyDashboardView
            alerts={alerts}
            safetyReports={safetyReports}
            users={[]}
          />
        )}
      </main>
      <MobileBottomNav
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        isAdmin={isAdmin}
      />
      <MobileAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      {activeAlert && (
        <CriticalAlarmModal
          alert={activeAlert}
          onDismiss={handleDismissAlert}
          onTurnOffSensorAndDismiss={handleTurnOffSensorAndDismiss}
        />
      )}
    </div>
  );
}
