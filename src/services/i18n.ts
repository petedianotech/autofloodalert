import { useState, useEffect } from 'react';

export type SupportedLanguage = 'en';

const STORAGE_KEY_LANGUAGE = 'flood_app_selected_language_v1';

export interface Translations {
  // TopBar & Global Branding
  appName: string;
  clubName: string;
  systemLive: string;
  refresh: string;
  refreshing: string;
  about: string;
  signIn: string;
  signedInAs: string;
  logout: string;
  adminBadge: string;
  residentBadge: string;
  language: string;
  english: string;
  switchToEnglish: string;

  // Navigation
  navDashboard: string;
  navSensor: string;
  navAlerts: string;
  navVillage: string;
  navLiveCam: string;
  navAdmin: string;

  // APK Download Top Banner & Info
  apkBannerTitle: string;
  apkBannerDesc: string;
  apkDownloadBtn: string;
  apkWhyImportant: string;
  apkAutoDismissNotice: string;
  apkModalTitle: string;
  apkModalSubtitle: string;
  apkModalClose: string;
  apkFeature1Title: string;
  apkFeature1Desc: string;
  apkFeature2Title: string;
  apkFeature2Desc: string;
  apkFeature3Title: string;
  apkFeature3Desc: string;
  apkFeature4Title: string;
  apkFeature4Desc: string;
  apkFeature5Title: string;
  apkFeature5Desc: string;
  apkDirectDownloadNow: string;
  apkVersion: string;
  apkSize: string;

  // Dashboard / Receiver Node View
  riverStatusSafe: string;
  riverStatusWarning: string;
  riverStatusDanger: string;
  riverStatusSafeDesc: string;
  riverStatusWarningDesc: string;
  riverStatusDangerDesc: string;
  sirenControlTitle: string;
  sirenControlSubtitle: string;
  startSirenBtn: string;
  stopSirenBtn: string;
  voiceSosTitle: string;
  voiceSosDesc: string;
  voiceSosBtn: string;
  checkInBtn: string;
  reportFloodBtn: string;
  recentAlertsTitle: string;
  noAlertsTitle: string;
  noAlertsDesc: string;
  dismissAlert: string;
  deleteAlert: string;
  clearAllAlerts: string;
  viewLocationOnMap: string;
  quickActions: string;
  smsGateway: string;
  pushGateway: string;
  ringtoneSettings: string;
  evacuationGuideTitle: string;
  evacStep1Title: string;
  evacStep1Desc: string;
  evacStep2Title: string;
  evacStep2Desc: string;
  evacStep3Title: string;
  evacStep3Desc: string;

  // Village Community View
  villageCommunityTitle: string;
  villageCommunityDesc: string;
  selectVillage: string;
  safeEvacuationZonesTitle: string;
  safeEvacuationZonesDesc: string;
  villageEmergencyContactsTitle: string;
  safetyReportsTitle: string;
  safetyReportsDesc: string;
  noSafetyReportsTitle: string;
  noSafetyReportsDesc: string;
  iAmSafe: string;
  iNeedHelp: string;
  trappedInWater: string;
  evacuatedToSafeZone: string;
  reportSighting: string;
  peopleWithMe: string;
  contactNumber: string;

  // Sensor Node View
  sensorModeTitle: string;
  sensorModeDesc: string;
  armSensorBtn: string;
  disarmSensorBtn: string;
  calibrateSensor: string;
  sensorSensitivity: string;
  soundDecibels: string;
  vibrationDelta: string;
  acousticAnalysisTitle: string;
  acousticAnalysisDesc: string;
  soundBellDetected: string;
  humanVoiceFiltered: string;
  testAlarmSound: string;

  // Admin Dashboard View
  adminDashboardTitle: string;
  adminDashboardDesc: string;
  totalUsersRegistered: string;
  activeSensors: string;
  smsRecipientsCount: string;
  broadcastEmergencySms: string;
  userManagementTitle: string;
  userManagementDesc: string;
  roleAdmin: string;
  roleResident: string;
  makeAdminBtn: string;
  makeResidentBtn: string;
  deleteUserBtn: string;
  apkDistributionCardTitle: string;
  apkDistributionCardDesc: string;
  pasteApkDownloadLink: string;
  saveApkLinkBtn: string;
  apkLinkSavedSuccess: string;
  apkCurrentVersion: string;
  recentSystemLogs: string;
  dangerZone: string;
  clearAllLogs: string;

  // Critical Alarm Modal
  criticalAlarmModalTitle: string;
  criticalAlarmModalSubtitle: string;
  criticalAlarmInstruction: string;
  holdToDismiss: string;
  holdToDismissCounting: string;
  alertLocation: string;
  emergencySirenSounding: string;

  // Modals & General Form Labels
  cancel: string;
  submit: string;
  confirm: string;
  save: string;
  close: string;
  loading: string;
  success: string;
  error: string;
  villageDzenje: string;
  villageMachokola: string;
  traditionalAuthorityMabuka: string;
  districtMulanje: string;
  emergencyRescueStation: string;
  villageFloodWarningNetwork: string;
  riverFloodAlerts: string;
  activeOnly: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    // TopBar & Global Branding
    appName: 'Automatic Flood Alert',
    clubName: 'Dzenje CDSS ADDA STEM CLUB',
    systemLive: 'System Live & Active',
    refresh: 'Refresh',
    refreshing: 'Refreshing data...',
    about: 'About Project & Legal',
    signIn: 'Sign In',
    signedInAs: 'Signed in as',
    logout: 'Log Out',
    adminBadge: 'Admin',
    residentBadge: 'Resident',
    language: 'Language',
    english: 'English',
    switchToEnglish: 'English',

    // Navigation
    navDashboard: 'Dashboard',
    navSensor: 'Sensor',
    navAlerts: 'Alerts',
    navVillage: 'Village',
    navLiveCam: 'Live Cam',
    navAdmin: 'Dashboard',

    // APK Download Top Banner & Info
    apkBannerTitle: 'Android Native App',
    apkBannerDesc: 'Get guaranteed offline siren alarms & automatic emergency SMS dispatch even when phone is locked.',
    apkDownloadBtn: 'Download',
    apkWhyImportant: 'Why System is Vital',
    apkAutoDismissNotice: 'Hiding in 6s',
    apkModalTitle: 'Why Automatic Flood Alert is Life-Saving',
    apkModalSubtitle: 'Crucial features for rural village safety in Mulanje',
    apkModalClose: 'Understood, Back to App',
    apkFeature1Title: 'Loud Emergency Siren on Locked Screen',
    apkFeature1Desc: 'Runs background watchdog audio alarms that wake you up during midnight flash floods.',
    apkFeature2Title: 'Direct Textbee Hardware SMS Broadcast',
    apkFeature2Desc: 'Integrates directly to dispatch emergency text warnings to village elders, chiefs, and residents.',
    apkFeature3Title: 'Continuous River Acoustic Monitoring',
    apkFeature3Desc: 'Listens continuously for high-frequency river bell resonance.',
    apkFeature4Title: 'Zero-Data Emergency Offline Caching',
    apkFeature4Desc: 'Stores emergency contact numbers, evacuation routes, and safe-ground maps directly on device storage.',
    apkFeature5Title: 'Tailored for Dzenje & Machokola Villages',
    apkFeature5Desc: 'Built specifically for the Ruo River basin by Dzenje CDSS ADDA STEM Club to protect lives and properties across T/A Mabuka, Mulanje.',
    apkDirectDownloadNow: 'Automatic Flood Alert',
    apkVersion: 'Version',
    apkSize: 'File Size',

    // Dashboard / Receiver Node View
    riverStatusSafe: 'River Flow Normal & Safe',
    riverStatusWarning: 'Advisory: Water Level Rising',
    riverStatusDanger: 'CRITICAL EMERGENCY: FLASH FLOOD DETECTED',
    riverStatusSafeDesc: 'Ruo River sensors report calm baseline flow. All village channels are safe.',
    riverStatusWarningDesc: 'Moderate acoustic vibration detected near river banks. Residents should stay alert.',
    riverStatusDangerDesc: 'Loud flood roaring and high water volume detected! Immediate evacuation required!',
    sirenControlTitle: 'Village Emergency Siren Station',
    sirenControlSubtitle: 'Trigger instant oscillating audio alarm across all connected village receivers',
    startSirenBtn: 'Sound Emergency Siren',
    stopSirenBtn: 'Mute Siren Alarm',
    voiceSosTitle: 'Emergency Voice SOS Alert',
    voiceSosDesc: 'Record a quick voice note or call for help. Dispatches instantly to village community leaders.',
    voiceSosBtn: 'Send Voice SOS',
    checkInBtn: 'Safety Check-In',
    reportFloodBtn: 'Report Flood Sighting',
    recentAlertsTitle: 'Live Flood Alert Stream',
    noAlertsTitle: 'No Active Flood Warnings',
    noAlertsDesc: 'All sensor nodes across Dzenje Village and Machokola Village are reporting normal river flow.',
    dismissAlert: 'Dismiss',
    deleteAlert: 'Delete',
    clearAllAlerts: 'Clear All',
    viewLocationOnMap: 'View GPS Location on Google Maps',
    quickActions: 'Quick System Actions',
    smsGateway: 'SMS Gateway Settings',
    pushGateway: 'FCM Push Notifications',
    ringtoneSettings: 'Custom Ringtone & Sirens',
    evacuationGuideTitle: 'Immediate Evacuation Protocol',
    evacStep1Title: '1. Move to High Ground Immediately',
    evacStep1Desc: 'Head towards Chikumaluzu Hill or Dzenje CDSS high grounds. Do not linger near river banks.',
    evacStep2Title: '2. Do Not Attempt to Cross Flooded Streams',
    evacStep2Desc: 'Fast-moving water of just 15cm can sweep away an adult. Avoid bridges submerged in floodwater.',
    evacStep3Title: '3. Assist Elderly, Children & Livestock',
    evacStep3Desc: 'Help vulnerable household members and gather essential survival kits and medications.',

    // Village Community View
    villageCommunityTitle: 'Village Safety & Evacuation Center',
    villageCommunityDesc: 'Real-time community roll-call, designated safe high-ground zones, and local disaster committee contacts.',
    selectVillage: 'Select Village',
    safeEvacuationZonesTitle: 'Designated Safe High-Ground Zones',
    safeEvacuationZonesDesc: 'Approved disaster refuge locations in Mulanje District with elevated topography.',
    villageEmergencyContactsTitle: 'Village Chiefs & Disaster Committees',
    safetyReportsTitle: 'Community Safety Roll-Call',
    safetyReportsDesc: 'Resident statuses submitted from Dzenje Village and Machokola Village.',
    noSafetyReportsTitle: 'No Resident Reports Yet',
    noSafetyReportsDesc: 'Residents can tap "Safety Check-In" to let neighbours and chiefs know they are safe.',
    iAmSafe: 'I Am Safe',
    iNeedHelp: 'I Need Help',
    trappedInWater: 'Trapped in Water',
    evacuatedToSafeZone: 'Evacuated to Safe Ground',
    reportSighting: 'Report Flood Sighting',
    peopleWithMe: 'People with me',
    contactNumber: 'Phone Number',

    // Sensor Node View
    sensorModeTitle: 'River Acoustic & Vibration Sensor Node',
    sensorModeDesc: 'Hardware detection engine analyzing river turbulence frequency and vibration sensors.',
    armSensorBtn: 'Arm & Start Sensor',
    disarmSensorBtn: 'Disarm & Stop Sensor',
    calibrateSensor: 'Calibrate Baseline',
    sensorSensitivity: 'Sensitivity Threshold',
    soundDecibels: 'Sound Level',
    vibrationDelta: 'Vibration Delta',
    acousticAnalysisTitle: 'Acoustic Frequency Analyzer',
    acousticAnalysisDesc: 'Distinguishes between metallic bicycle bell emergency triggers and human speech noise.',
    soundBellDetected: 'Warning Bell Frequency Detected',
    humanVoiceFiltered: 'Human Voice Filtered Out',
    testAlarmSound: 'Test Sensor Alarm',

    // Admin Dashboard View
    adminDashboardTitle: 'Emergency Operations & Control Dashboard',
    adminDashboardDesc: 'Centralized administration for sensor nodes, village broadcasts, user roles, and updates.',
    totalUsersRegistered: 'Registered Village Users',
    activeSensors: 'Active River Sensors',
    smsRecipientsCount: 'SMS Alert Broadcast Recipients',
    broadcastEmergencySms: 'Send Emergency SMS Broadcast to All',
    userManagementTitle: 'Village User Directory & Access Control',
    userManagementDesc: 'Manage resident registrations, promote village leaders to Admin, or remove inactive accounts.',
    roleAdmin: 'Admin',
    roleResident: 'Resident',
    makeAdminBtn: 'Promote to Admin',
    makeResidentBtn: 'Set as Resident',
    deleteUserBtn: 'Delete Account',
    apkDistributionCardTitle: 'App Updates & Configuration',
    apkDistributionCardDesc: 'Configuration options for system updates.',
    pasteApkDownloadLink: 'Direct Download URL',
    saveApkLinkBtn: 'Save Changes',
    apkLinkSavedSuccess: 'Settings updated successfully!',
    apkCurrentVersion: 'Active Version',
    recentSystemLogs: 'System Event Logs & Siren History',
    dangerZone: 'System Reset & Log Purge',
    clearAllLogs: 'Purge Alert History',

    // Critical Alarm Modal
    criticalAlarmModalTitle: 'CRITICAL FLOOD WARNING',
    criticalAlarmModalSubtitle: 'RIVER OVERFLOW DETECTED IN YOUR AREA',
    criticalAlarmInstruction: 'MOVE TO DESIGNATED HIGH GROUND EVACUATION ZONES IMMEDIATELY! DO NOT WAIT!',
    holdToDismiss: 'HOLD BUTTON 3 SECONDS TO DISMISS',
    holdToDismissCounting: 'Holding... Keep Pressing',
    alertLocation: 'Location',
    emergencySirenSounding: 'Emergency Siren Alarm Sounding',

    // Modals & General Form Labels
    cancel: 'Cancel',
    submit: 'Submit Report',
    confirm: 'Confirm',
    save: 'Save Changes',
    close: 'Close',
    loading: 'Loading...',
    success: 'Operation Successful',
    error: 'An error occurred',
    villageDzenje: 'Dzenje Village',
    villageMachokola: 'Machokola Village',
    traditionalAuthorityMabuka: 'T/A Mabuka',
    districtMulanje: 'Mulanje District',
    emergencyRescueStation: 'Emergency Rescue Station',
    villageFloodWarningNetwork: 'Village Flood Warning Network',
    riverFloodAlerts: 'River Flood Alerts',
    activeOnly: 'Active Only',
  },
};

type LanguageChangeListener = (lang: SupportedLanguage) => void;

class I18nService {
  private currentLanguage: SupportedLanguage = 'en';
  private listeners: Set<LanguageChangeListener> = new Set();

  public getLanguage(): SupportedLanguage {
    return 'en';
  }

  public setLanguage(_lang: SupportedLanguage) {
    this.currentLanguage = 'en';
    this.notifyListeners();
  }

  public toggleLanguage(): SupportedLanguage {
    return 'en';
  }

  public get t(): Translations {
    return translations.en;
  }

  public subscribe(listener: LanguageChangeListener): () => void {
    this.listeners.add(listener);
    listener('en');
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => {
      try {
        fn('en');
      } catch (err) {
        console.warn('I18nService listener error:', err);
      }
    });
  }
}

export const i18nService = new I18nService();

/**
 * Custom React Hook for translations (English default)
 */
export function useTranslation() {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    return i18nService.subscribe((newLang) => {
      setLanguageState(newLang);
    });
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    i18nService.setLanguage(lang);
  };

  const toggleLanguage = () => {
    i18nService.toggleLanguage();
  };

  return {
    t: translations.en,
    language,
    setLanguage,
    toggleLanguage,
    isChichewa: false,
    isEnglish: true,
  };
}
