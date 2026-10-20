/**
 * Automatic Flood Alert System
 */
import React, { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileAuthModal } from './components/MobileAuthModal';
import { AboutLegalModal } from './components/AboutLegalModal';
import { AdminSafetyDashboardView } from './components/AdminSafetyDashboardView';
import { SensorNodeView } from './components/SensorNodeView';
import { ReceiverNodeView } from './components/ReceiverNodeView';
import { VillageCommunityView } from './components/VillageCommunityView';
import { SafetyCheckInModal } from './components/SafetyCheckInModal';
import { DirectVoiceSOSModal } from './components/DirectVoiceSOSModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { AlertSoundModal } from './components/AlertSoundModal';
import { SmsGatewayModal } from './components/SmsGatewayModal';
import { FcmGatewayModal } from './components/FcmGatewayModal';
import { CriticalAlarmModal } from './components/CriticalAlarmModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { firebaseFloodService } from './services/firebaseService';
import {
  NodeMode,
  FloodAlert,
  ResidentSafetyReport,
  isAppAdmin,
  AuthState,
  MotionData,
  MotionSensorState,
  AcousticData,
  AcousticSensorState,
  SensorDetectionMode,
} from './types';

export default function App() {
  const [currentMode, setCurrentMode] = useState<NodeMode>('village');
  const [isDarkMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [aboutModalInitialTab, setAboutModalInitialTab] = useState<'thanks' | 'about' | 'privacy' | 'terms'>('thanks');
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isAlertSoundModalOpen, setIsAlertSoundModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isFcmModalOpen, setIsFcmModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isSafetyModalAutoVoice, setIsSafetyModalAutoVoice] = useState(false);
  const [isVoiceSosOpen, setIsVoiceSosOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthState>(() => firebaseFloodService.getAuthState());
  const [alerts, setAlerts] = useState<FloodAlert[]>(() => firebaseFloodService.getLocalAlerts());
  const [safetyReports, setSafetyReports] = useState<ResidentSafetyReport[]>(() =>
    firebaseFloodService.getLocalSafetyReports()
  );
  const [selectedVillage, setSelectedVillage] = useState('Dzenje Village');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState<{ message: string } | null>(null);
  const [isArmed, setIsArmed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeDetectionMode, setActiveDetectionMode] = useState<SensorDetectionMode>('both');
  const [motion] = useState<MotionData>({
    x: 0, y: 0, z: 0, delta: 0, totalMagnitude: 9.81, timestamp: Date.now(),
  });
  const [sensorState] = useState<MotionSensorState>({
    isListening: false, permission: 'prompt', baseline: 9.81, lastPeak: 0,
  } as any);
  const [soundData] = useState<AcousticData>({
    decibels: 0, bellDetectionScore: 0, timestamp: Date.now(),
  } as any);
  const [acousticState] = useState<AcousticSensorState>({
    isListening: false, permission: 'prompt',
  } as any);

  const isAdmin = isAppAdmin(authState.user);
  const activeAlertCount = alerts.filter((a) => a.status === 'active').length;
  const activeAlert = alerts.find((a) => a.status === 'active') || null;

  useEffect(() => {
    const unsubAuth = firebaseFloodService.subscribeAuth((state) => {
      setAuthState(state);
      if (state.user?.village) setSelectedVillage(state.user.village);
    });
    const unsubAlerts = firebaseFloodService.subscribeAlerts((list) => setAlerts(list || []));
    const unsubReports = firebaseFloodService.subscribeSafetyReports((list) => setSafetyReports(list || []));
    return () => {
      unsubAuth?.();
      unsubAlerts?.();
      unsubReports?.();
    };
  }, []);

  const handleSelectMode = useCallback((mode: NodeMode) => setCurrentMode(mode), []);
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await firebaseFloodService.manualRefreshAll();
      setRefreshToast({ message: 'Synced' });
    } catch {
      setRefreshToast({ message: 'Sync failed' });
    }
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshToast(null);
    }, 1200);
  }, []);
  const handleOpenDirectVoiceSOS = () => setIsVoiceSosOpen(true);
  const handleOpenNormalCheckIn = () => {
    setIsSafetyModalAutoVoice(false);
    setIsSafetyModalOpen(true);
  };
  const handleToggleArm = () => setIsArmed((v) => !v);
  const handleSelectDetectionMode = (mode: SensorDetectionMode) => setActiveDetectionMode(mode);
  const handleTurnOnBothSensors = () => {
    setActiveDetectionMode('both');
    setIsArmed(true);
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-[#0F172A] text-[#F8FAFC]' : 'bg-[#F8FAFC] text-[#0F172A]'}`}>
        <TopBar
          currentMode={currentMode}
          onSelectMode={handleSelectMode}
          isDarkMode={isDarkMode}
          isArmed={isArmed}
          isPaused={isPaused}
          isFirebaseConnected={firebaseFloodService.getIsFirebaseConnected()}
          onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
          currentUser={authState.user}
          isAdmin={isAdmin}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenVoiceSOS={handleOpenDirectVoiceSOS}
          activeAlertCount={activeAlertCount}
          selectedVillage={selectedVillage}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
        />

        {refreshToast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg text-xs font-bold bg-emerald-600 text-white border border-emerald-400">
            {refreshToast.message}
          </div>
        )}

        <main id="mobile-main-scroll-area" className="flex-1 w-full overflow-y-auto min-h-0 overscroll-contain">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-3">
            {currentMode === 'admin' && isAdmin && (
              <AdminSafetyDashboardView
                safetyReports={safetyReports}
                alerts={alerts}
                activeAlert={activeAlert}
                currentUser={authState.user}
                isDarkMode={isDarkMode}
                selectedVillage={selectedVillage}
                onSelectVillage={setSelectedVillage}
                onOpenCheckInModal={handleOpenNormalCheckIn}
                onOpenDirectVoiceSOS={handleOpenDirectVoiceSOS}
                onOpenFcmModal={() => setIsFcmModalOpen(true)}
                onOpenSmsModal={() => setIsSmsModalOpen(true)}
                onRefresh={handleManualRefresh}
                isRefreshing={isRefreshing}
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
                onTurnOnBothSensors={handleTurnOnBothSensors}
                isArmed={isArmed}
                isPaused={isPaused}
                isDarkMode={isDarkMode}
                isAdmin={isAdmin}
                currentUser={authState.user}
                onToggleArm={handleToggleArm}
              />
            )}
            {currentMode === 'receiver' && (
              <ReceiverNodeView
                alerts={alerts}
                currentUser={authState.user}
                isDarkMode={isDarkMode}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            )}
            {currentMode === 'village' && (
              <VillageCommunityView
                currentUser={authState.user}
                alerts={alerts}
                safetyReports={safetyReports}
                isDarkMode={isDarkMode}
                selectedVillage={selectedVillage}
                onSelectVillage={setSelectedVillage}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onOpenDirectVoiceSOS={handleOpenDirectVoiceSOS}
                onOpenCheckInModal={handleOpenNormalCheckIn}
              />
            )}
          </div>
        </main>

        <MobileBottomNav
          currentMode={currentMode}
          onSelectMode={handleSelectMode}
          activeAlertCount={activeAlertCount}
          isArmed={isArmed}
          isPaused={isPaused}
          isDarkMode={isDarkMode}
          isAdmin={isAdmin}
        />

        <MobileAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={authState.user}
          isDarkMode={isDarkMode}
          onSignedIn={(isAdminUser) => {
            setCurrentMode(isAdminUser ? 'admin' : 'village');
          }}
          onOpenAboutModal={(tab) => {
            setAboutModalInitialTab(tab || 'about');
            setIsAboutModalOpen(true);
          }}
        />

        <AboutLegalModal
          isOpen={isAboutModalOpen}
          onClose={() => setIsAboutModalOpen(false)}
          initialTab={aboutModalInitialTab}
        />

        <FirebaseConfigModal isOpen={isFirebaseModalOpen} onClose={() => setIsFirebaseModalOpen(false)} />
        <AlertSoundModal isOpen={isAlertSoundModalOpen} onClose={() => setIsAlertSoundModalOpen(false)} />
        <SmsGatewayModal isOpen={isSmsModalOpen} onClose={() => setIsSmsModalOpen(false)} />
        <FcmGatewayModal isOpen={isFcmModalOpen} onClose={() => setIsFcmModalOpen(false)} />
        <SafetyCheckInModal
          isOpen={isSafetyModalOpen}
          onClose={() => setIsSafetyModalOpen(false)}
          currentUser={authState.user}
          autoStartVoice={isSafetyModalAutoVoice}
        />
        <DirectVoiceSOSModal isOpen={isVoiceSosOpen} onClose={() => setIsVoiceSosOpen(false)} currentUser={authState.user} />
        <CriticalAlarmModal alerts={alerts} />
      </div>
    </ErrorBoundary>
  );
}
