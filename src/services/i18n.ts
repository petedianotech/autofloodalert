import { useState, useEffect } from 'react';
import {
  getCurrentLanguage,
  setAppLanguage,
  subscribeLanguage,
} from './languageStore';

export type SupportedLanguage = 'en' | 'ny';

const STORAGE_KEY_LANGUAGE = 'flood_app_selected_language_v1';

export interface Translations {
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
  chichewa: string;
  english: string;
  switchToChichewa: string;
  switchToEnglish: string;
  navDashboard: string;
  navSensor: string;
  navAlerts: string;
  navVillage: string;
  navLiveCam: string;
  navAdmin: string;
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
  criticalAlarmModalTitle: string;
  criticalAlarmModalSubtitle: string;
  criticalAlarmInstruction: string;
  holdToDismiss: string;
  holdToDismissCounting: string;
  alertLocation: string;
  emergencySirenSounding: string;
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
  totalPeopleCheckedIn: string;
  resident: string;
  residents: string;
  personCheckedIn: string;
  peopleCheckedIn: string;
  safeAreasLabel: string;
  mulanjeRuoArea: string;
  changeVillage: string;
  criticalFloodWarningShort: string;
  highFloodRiskShort: string;
  riverRisingSafeGroundReady: string;
  normalMonitoringNoFloods: string;
  riverSensorsWatching: string;
  checkInsLabel: string;
  safeLabel: string;
  peopleLabel: string;
  markIAmSafe: string;
  reportFloods: string;
  emergencyVoiceSosRescue: string;
  switchVillage: string;
  safetyGuide: string;
  safeHighGroundEvacAreas: string;
  designatedSheltersFor: string;
  highGroundBadge: string;
  highGroundEvacShelter: string;
  capacityLabel: string;
  selectYourVillage: string;
  activeBadge: string;
  whatToDoFloodWarning: string;
  clearSafetySteps: string;
  moveToHighGroundNow: string;
  neverCrossFastWater: string;
  assistNeighborsChildren: string;
  sendVoiceSosIfTrapped: string;
  villageSirenBroadcast: string;
  dzenjeStemStationWarning: string;
  adminLabel: string;
  manuallySoundSilenceSirens: string;
  stopEmergencySiren: string;
  soundEmergencySiren: string;
  soundLabel: string;
  pushLabel: string;
  smsLabel: string;
  rescueBadge: string;
  cutOffByFloodVoiceHelp: string;
  sendEmergencyVoiceSos: string;
  alertsTotal: string;
  clearDatabaseAdmin: string;
  clearMyView: string;
  filterAll: string;
  filterResolved: string;
  noticeLabel: string;
  recentUpdatesAtStation: string;
  riverChannelsClear: string;
  alertTitleRiverClear: string;
  alertTitleCriticalMove: string;
  alertTitleHighRisk: string;
  alertTitleMonitoring: string;
  alertMsgRiverClear: string;
  alertMsgCriticalMove: string;
  alertMsgHighRisk: string;
  alertMsgMonitoring: string;
  stateActiveWarning: string;
  stateResolved: string;
  stateUpdated: string;
  stateCriticalWarning: string;
  stateHighFloodRisk: string;
  stateMonitoring: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'Automatic Flood Alert',
    clubName: 'Dzenje CDSS ADDA STEM CLUB',
    systemLive: 'System Live & Active',
    refresh: 'Refresh',
    refreshing: 'Refreshing data...',
    about: 'About Project & Legal',
    signIn: 'Sign in',
    signedInAs: 'Signed in as',
    logout: 'Log Out',
    adminBadge: 'Admin',
    residentBadge: 'Resident',
    language: 'Language',
    chichewa: 'Chichewa',
    english: 'English',
    switchToChichewa: 'Sinthani ku Chichewa',
    switchToEnglish: 'Switch to English',
    navDashboard: 'Dashboard',
    navSensor: 'Sensor',
    navAlerts: 'Alerts',
    navVillage: 'Village',
    navLiveCam: 'Live Cam',
    navAdmin: 'Dashboard',
    apkBannerTitle: 'Download Android APK (Native App)',
    apkBannerDesc: 'Get guaranteed offline siren alarms & automatic emergency SMS dispatch even when phone is locked.',
    apkDownloadBtn: 'Download APK',
    apkWhyImportant: 'Why APK is Vital',
    apkAutoDismissNotice: 'Hiding in 6s',
    apkModalTitle: 'Why the Native Android APK is Life-Saving',
    apkModalSubtitle: 'Crucial differences between the Web App and the Native Android APK for rural village safety in Mulanje',
    apkModalClose: 'Understood, Back to App',
    apkFeature1Title: 'Loud Emergency Siren on Locked Screen',
    apkFeature1Desc: 'Web browsers sleep when the screen turns off. The native Android APK runs a background watchdog service with high-priority audio alarms that wake you up during midnight flash floods.',
    apkFeature2Title: 'Direct Textbee Hardware SMS Broadcast',
    apkFeature2Desc: 'Integrates directly with local Android GSM SIM cards to dispatch emergency text warnings to village elders, chiefs, and residents without needing mobile data or cloud servers.',
    apkFeature3Title: 'Continuous River Acoustic Monitoring',
    apkFeature3Desc: 'Listens continuously for high-frequency river bell resonance without being suspended or throttled by browser power management.',
    apkFeature4Title: 'Zero-Data Emergency Offline Caching',
    apkFeature4Desc: 'Stores emergency contact numbers, evacuation routes, and safe-ground maps directly on device storage for instant offline access during torrential rainstorms.',
    apkFeature5Title: 'Tailored for Dzenje & Machokola Villages',
    apkFeature5Desc: 'Built specifically for the Ruo River basin by Dzenje CDSS ADDA STEM Club to protect lives and properties across T/A Mabuka, Mulanje.',
    apkDirectDownloadNow: 'Download Android APK Directly (8.4 MB)',
    apkVersion: 'Version',
    apkSize: 'File Size',
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
    adminDashboardTitle: 'Emergency Operations & Control Dashboard',
    adminDashboardDesc: 'Centralized administration for sensor nodes, village broadcasts, user roles, and APK updates.',
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
    apkDistributionCardTitle: 'Android APK Download Link Configuration',
    apkDistributionCardDesc: 'Paste the direct download URL for the standalone Android APK. Changes are instantly reflected across the entire app.',
    pasteApkDownloadLink: 'Android APK Direct Download URL',
    saveApkLinkBtn: 'Save & Publish APK Link',
    apkLinkSavedSuccess: 'APK download link updated and published successfully!',
    apkCurrentVersion: 'Active APK Version',
    recentSystemLogs: 'System Event Logs & Siren History',
    dangerZone: 'System Reset & Log Purge',
    clearAllLogs: 'Purge Alert History',
    criticalAlarmModalTitle: 'CRITICAL FLOOD WARNING',
    criticalAlarmModalSubtitle: 'RIVER OVERFLOW DETECTED IN YOUR AREA',
    criticalAlarmInstruction: 'MOVE TO DESIGNATED HIGH GROUND EVACUATION ZONES IMMEDIATELY! DO NOT WAIT!',
    holdToDismiss: 'HOLD BUTTON 3 SECONDS TO DISMISS',
    holdToDismissCounting: 'Holding... Keep Pressing',
    alertLocation: 'Location',
    emergencySirenSounding: 'Emergency Siren Alarm Sounding',
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
    totalPeopleCheckedIn: 'Total People Checked In Across All Villages',
    resident: 'Resident',
    residents: 'Residents',
    personCheckedIn: 'person checked in',
    peopleCheckedIn: 'people checked in',
    safeAreasLabel: 'Safe Areas',
    mulanjeRuoArea: 'Mulanje District · Ruo River Area',
    changeVillage: 'Change',
    criticalFloodWarningShort: 'CRITICAL FLOOD WARNING',
    highFloodRiskShort: 'HIGH FLOOD RISK',
    riverRisingSafeGroundReady: 'River water rising. Safe high ground areas ready.',
    normalMonitoringNoFloods: 'Normal Monitoring · No Active Floods',
    riverSensorsWatching: 'River sensors watching water levels continuously.',
    checkInsLabel: 'Check-Ins',
    safeLabel: 'Safe',
    peopleLabel: 'People',
    markIAmSafe: 'Mark I Am Safe',
    reportFloods: 'Report Floods',
    emergencyVoiceSosRescue: 'Emergency Voice SOS (Rescue Line)',
    switchVillage: 'Switch Village',
    safetyGuide: 'Safety Guide',
    safeHighGroundEvacAreas: 'Safe High Ground Evacuation Areas',
    designatedSheltersFor: 'Designated shelters for residents in',
    highGroundBadge: 'High Ground',
    highGroundEvacShelter: 'High Ground Evacuation Shelter',
    capacityLabel: 'Capacity',
    selectYourVillage: 'Select Your Village',
    activeBadge: 'Active',
    whatToDoFloodWarning: 'What To Do In A Flood Warning',
    clearSafetySteps: 'Clear safety steps for families in the village',
    moveToHighGroundNow: 'Move to High Ground Now',
    neverCrossFastWater: 'Never Cross Fast River Water',
    assistNeighborsChildren: 'Assist Neighbors & Children',
    sendVoiceSosIfTrapped: 'Send Voice SOS If Trapped',
    villageSirenBroadcast: 'Village Siren Broadcast',
    dzenjeStemStationWarning: 'Dzenje CDSS STEM Station Warning',
    adminLabel: 'Admin',
    manuallySoundSilenceSirens: 'Manually sound or silence the evacuation sirens on connected community devices.',
    stopEmergencySiren: 'Stop Emergency Siren',
    soundEmergencySiren: 'Sound Emergency Siren',
    soundLabel: 'Sound',
    pushLabel: 'Push',
    smsLabel: 'SMS',
    rescueBadge: 'Rescue',
    cutOffByFloodVoiceHelp: 'If you are cut off by flood water or need emergency assistance, transmit an instant voice message with your phone\'s GPS location.',
    sendEmergencyVoiceSos: 'Send Emergency Voice SOS',
    alertsTotal: 'total',
    clearDatabaseAdmin: 'Clear Database (Admin)',
    clearMyView: 'Clear My View',
    filterAll: 'All',
    filterResolved: 'Resolved',
    noticeLabel: 'Notice',
    recentUpdatesAtStation: 'Recent Updates at this Station',
    riverChannelsClear: 'River Channels Clear · No Active Warnings',
    alertTitleRiverClear: 'MONITORING — River Clear',
    alertTitleCriticalMove: 'CRITICAL FLOOD WARNING — Move to Higher Ground Now',
    alertTitleHighRisk: 'HIGH FLOOD RISK — Stay Alert',
    alertTitleMonitoring: 'MONITORING — Stay Informed',
    alertMsgRiverClear: 'Water levels have receded. Normal monitoring in effect.',
    alertMsgCriticalMove: 'Rapid river rise detected. Move your family and animals to designated safe high ground immediately.',
    alertMsgHighRisk: 'River water is rising fast. Stay alert, keep phones charged, and prepare to move to high ground.',
    alertMsgMonitoring: 'River sensor is currently monitoring water levels. No action required.',
    stateActiveWarning: 'Active Warning',
    stateResolved: 'Resolved',
    stateUpdated: 'Updated',
    stateCriticalWarning: 'Critical Warning',
    stateHighFloodRisk: 'High Flood Risk',
    stateMonitoring: 'Monitoring',
  },
  ny: {
    appName: 'Dongosolo Lochenjeza za Kusefukira kwa Madzi',
    clubName: 'Dzenje CDSS ADDA STEM CLUB',
    systemLive: 'Dongosolo Lili Pa Ntchito Ndi Kulondera',
    refresh: 'Konzani Data',
    refreshing: 'Kukonzanso mauthenga...',
    about: 'Zambiri za Ntchitoyi ndi Malamulo',
    signIn: 'Lowani mu Pulogalamu',
    signedInAs: 'Mwalowa ngati',
    logout: 'Tulukani',
    adminBadge: 'Mtsogoleri',
    residentBadge: 'Mkhalidwe',
    language: 'Chilankhulo',
    chichewa: 'Chichewa',
    english: 'Chingerezi',
    switchToChichewa: 'Sinthani ku Chichewa',
    switchToEnglish: 'Switch to English',
    navDashboard: 'Dashboard',
    navSensor: 'Sensa',
    navAlerts: 'Machenjezo',
    navVillage: 'Mudzi',
    navLiveCam: 'Kamera',
    navAdmin: 'Dashboard',
    apkBannerTitle: 'Tsitsani APK ya Android (App Yachilendo)',
    apkBannerDesc: 'Pezerani ma siren a mwadzidzidzi ndi ma SMS a mwadzidzidzi ngakhale foni yatsekedwa.',
    apkDownloadBtn: 'Tsitsani APK',
    apkWhyImportant: 'Chifukwa APK Ndi Yofunika',
    apkAutoDismissNotice: 'Kubisala mu 6s',
    apkModalTitle: 'Chifukwa APK ya Android Ndi Yopulumutsa Moyo',
    apkModalSubtitle: 'Kusiyana kwa Web App ndi APK ya Android pa chitetezo cha midzi ya Mulanje',
    apkModalClose: 'Ndamva, Bwererani ku App',
    apkFeature1Title: 'Siren Yolira Kwambiri pa Screen Yotsekedwa',
    apkFeature1Desc: 'Ma browser amagona screen ikazimitsidwa. APK ya Android imayenda ndi ma alarm a mwadzidzidzi omwe amakudzutsa usiku.',
    apkFeature2Title: 'SMS za Textbee pa SIM Card',
    apkFeature2Desc: 'Imatumiza ma SMS a mwadzidzidzi kwa akuluakulu ndi nzika za mudzi popanda data ya intaneti.',
    apkFeature3Title: 'Kuyang\'anira Mitsinje Mosalekeza',
    apkFeature3Desc: 'Imamva ma bell a mwadzidzidzi osayimitsidwa ndi browser.',
    apkFeature4Title: 'Kusunga Zofunika Popanda Data',
    apkFeature4Desc: 'Imasunga nambala za mwadzidzidzi ndi njira zothawira pa foni yanu.',
    apkFeature5Title: 'Yopangidwira Dzenje ndi Machokola',
    apkFeature5Desc: 'Yopangidwa ndi Dzenje CDSS ADDA STEM Club kuti iteteze miyoyo ku T/A Mabuka, Mulanje.',
    apkDirectDownloadNow: 'Tsitsani APK ya Android (8.4 MB)',
    apkVersion: 'Mtundu',
    apkSize: 'Kukula kwa Failo',
    riverStatusSafe: 'Madzi a Mtsinje Ali Bwino',
    riverStatusWarning: 'Chenjezo: Madzi Akukwera',
    riverStatusDanger: 'NGOZI YAITSA: MAFULO APEZEKA',
    riverStatusSafeDesc: 'Masensa a Ruo akuwonetsa kuti madzi ali bwino. Mitsinje yonse ili yotetezeka.',
    riverStatusWarningDesc: 'Kuyenda kwa madzi kwachulukirapo. Khalani tcheru.',
    riverStatusDangerDesc: 'Mafulo akulira kwambiri! Thawirani nthawi yomweyo!',
    sirenControlTitle: 'Sitolo ya Siren ya Mudzi',
    sirenControlSubtitle: 'Yambitsani siren yolira pa zipangizo zonse za mudzi',
    startSirenBtn: 'Lizani Siren ya Mwadzidzidzi',
    stopSirenBtn: 'Letsani Siren',
    voiceSosTitle: 'Mau a SOS a Mwadzidzidzi',
    voiceSosDesc: 'Lembani uthenga wamau kapena itanani thandizo. Zimatumizidwa kwa atsogoleri a mudzi.',
    voiceSosBtn: 'Tumizani Mau a SOS',
    checkInBtn: 'Ndi Ndine Wotetezeka',
    reportFloodBtn: 'Nenenani za Mafulo',
    recentAlertsTitle: 'Machenjezo a Mafulo Apano',
    noAlertsTitle: 'Palibe Machenjezo a Mafulo',
    noAlertsDesc: 'Masensa onse ku Dzenje ndi Machokola akuwonetsa kuti madzi ali bwino.',
    dismissAlert: 'Chotsani',
    deleteAlert: 'Fufutani',
    clearAllAlerts: 'Chotsani Zonse',
    viewLocationOnMap: 'Onani Malo pa Google Maps',
    quickActions: 'Zochita Zachangu',
    smsGateway: 'Zokhudza SMS',
    pushGateway: 'Zokhudza Push',
    ringtoneSettings: 'Ma Ringtone ndi Siren',
    evacuationGuideTitle: 'Malangizo a Kuthawa',
    evacStep1Title: '1. Thawirani Kumalo Okwezeka',
    evacStep1Desc: 'Pitani ku Chikumaluzu Hill kapena Dzenje CDSS. Musakhale pafupi ndi mtsinje.',
    evacStep2Title: '2. Musayese Kuwoloka Mitsinje',
    evacStep2Desc: 'Madzi othamanga a 15cm atha kukutenga. Pewani milatho yomwe ili pansi pa madzi.',
    evacStep3Title: '3. Thandizani Akuluakulu, Ana ndi Ziweto',
    evacStep3Desc: 'Thandizani anthu ofowoka ndi tenge mankhwala ndi zofunika.',
    villageCommunityTitle: 'Malo a Chitetezo ndi Kuthawa',
    villageCommunityDesc: 'Kuwunika anthu a mudzi, malo okwezeka, ndi ma contact a komiti ya ngozi.',
    selectVillage: 'Sankhani Mudzi',
    safeEvacuationZonesTitle: 'Malo Okwezeka Otetezeka',
    safeEvacuationZonesDesc: 'Malo ovomerezeka a chitetezo ku Mulanje.',
    villageEmergencyContactsTitle: 'Mafumu ndi Makomiti a Ngozi',
    safetyReportsTitle: 'Malipoti a Chitetezo cha Mudzi',
    safetyReportsDesc: 'Zomwe nzika za Dzenje ndi Machokola zanena.',
    noSafetyReportsTitle: 'Palibe Malipoti Pakadali Pano',
    noSafetyReportsDesc: 'Nzika zitha kutinira "Ndi Ndine Wotetezeka" kuti afumu adziwe.',
    iAmSafe: 'Ndi Ndine Wotetezeka',
    iNeedHelp: 'Ndikufuna Thandizo',
    trappedInWater: 'Ndachingidwa ndi Madzi',
    evacuatedToSafeZone: 'Ndathawa Kumalo Okwezeka',
    reportSighting: 'Nenenani za Mafulo',
    peopleWithMe: 'Anthu omwe ndili nawo',
    contactNumber: 'Nambala ya Foni',
    sensorModeTitle: 'Sensa ya Mtsinje',
    sensorModeDesc: 'Kuwunika kuyenda kwa madzi ndi phokoso.',
    armSensorBtn: 'Yambitsani Sensa',
    disarmSensorBtn: 'Imitsani Sensa',
    calibrateSensor: 'Konzani Baseline',
    sensorSensitivity: 'Kukhudzika',
    soundDecibels: 'Phokoso',
    vibrationDelta: 'Kuyenda',
    acousticAnalysisTitle: 'Kuunika Phokoso',
    acousticAnalysisDesc: 'Kusiya phokoso la anthu ndi ma bell a mwadzidzidzi.',
    soundBellDetected: 'Bell ya Chenjezo Yapezeka',
    humanVoiceFiltered: 'Mau a Anthu Achotsedwa',
    testAlarmSound: 'Yesani Alarm',
    adminDashboardTitle: 'Dashboard ya Ops',
    adminDashboardDesc: 'Kuwongolera masensa, ma broadcast, ndi ma user.',
    totalUsersRegistered: 'Anthu Olembetsa',
    activeSensors: 'Masensa Ogwira Ntchito',
    smsRecipientsCount: 'Omwe Alandira SMS',
    broadcastEmergencySms: 'Tumizani SMS ya Mwadzidzidzi kwa Onse',
    userManagementTitle: 'Kuwongolera Anthu',
    userManagementDesc: 'Sinthani ma role ndi kuchotsa ma account.',
    roleAdmin: 'Mtsogoleri',
    roleResident: 'Mkhalidwe',
    makeAdminBtn: 'Pangani Mtsogoleri',
    makeResidentBtn: 'Pangani Mkhalidwe',
    deleteUserBtn: 'Fufutani Account',
    apkDistributionCardTitle: 'Link ya APK',
    apkDistributionCardDesc: 'Ikani URL ya APK. Zidzasinthika nthawi yomweyo.',
    pasteApkDownloadLink: 'URL ya APK',
    saveApkLinkBtn: 'Sungani Link ya APK',
    apkLinkSavedSuccess: 'Link ya APK yasinthidwa bwino!',
    apkCurrentVersion: 'Mtundu wa APK',
    recentSystemLogs: 'Mbiri ya Dongosolo',
    dangerZone: 'Kuchotsa Data',
    clearAllLogs: 'Fufutani Mbiri',
    criticalAlarmModalTitle: 'CHENJEZO LA NGOZI',
    criticalAlarmModalSubtitle: 'MAFULO APEZEKA M\'DERA LANU',
    criticalAlarmInstruction: 'THAWIRANI KUMALO OKWEZEKA NTHAWI YOMWEYO!',
    holdToDismiss: 'KAKAMIRANI BATANI KWA MASEKONDI 3',
    holdToDismissCounting: 'Mukukakamira... Pitirizani',
    alertLocation: 'Malo',
    emergencySirenSounding: 'Siren ya Mwadzidzidzi Ikulira',
    cancel: 'Letsani',
    submit: 'Tumizani',
    confirm: 'Tsimikizani',
    save: 'Sungani',
    close: 'Tsekani',
    loading: 'Ikuyenda...',
    success: 'Zachita Bwino',
    error: 'Pali vuto',
    villageDzenje: 'Mudzi wa Dzenje',
    villageMachokola: 'Mudzi wa Machokola',
    traditionalAuthorityMabuka: 'T/A Mabuka',
    districtMulanje: 'Boma la Mulanje',
    emergencyRescueStation: 'Malo a Chipulumutso',
    villageFloodWarningNetwork: 'Dongosolo la Chenjezo la Mudzi',
    riverFloodAlerts: 'Machenjezo a Mtsinje',
    activeOnly: 'Zomwe Zikuchitika',
    totalPeopleCheckedIn: 'Anthu Onse Omwe Adziwitsa',
    resident: 'Mkhalidwe',
    residents: 'Anthu',
    personCheckedIn: 'munthu adziwitsa',
    peopleCheckedIn: 'anthu adziwitsa',
    safeAreasLabel: 'Malo Otetezeka',
    mulanjeRuoArea: 'Boma la Mulanje · Dera la Ruo',
    changeVillage: 'Sinthani',
    criticalFloodWarningShort: 'CHENJEZO LA NGOZI',
    highFloodRiskShort: 'CHIWOPSEZO CHACHIKULU',
    riverRisingSafeGroundReady: 'Madzi akukwera. Malo okwezeka ali okonzeka.',
    normalMonitoringNoFloods: 'Kulondera Kwabwino · Palibe Mafulo',
    riverSensorsWatching: 'Masensa akuonera madzi mosalekeza.',
    checkInsLabel: 'Omwe Adziwitsa',
    safeLabel: 'Otetezeka',
    peopleLabel: 'Anthu',
    markIAmSafe: 'Ndi Ndine Wotetezeka',
    reportFloods: 'Nenenani za Mafulo',
    emergencyVoiceSosRescue: 'Mau a SOS a Mwadzidzidzi',
    switchVillage: 'Sinthani Mudzi',
    safetyGuide: 'Malangizo a Chitetezo',
    safeHighGroundEvacAreas: 'Malo Okwezeka Otetezeka',
    designatedSheltersFor: 'Malo otetezeka kwa anthu a',
    highGroundBadge: 'Malo Okwezeka',
    highGroundEvacShelter: 'Malo Okwezeka otetezeka',
    capacityLabel: 'Kutha',
    selectYourVillage: 'Sankhani Mudzi Wanu',
    activeBadge: 'Zikuchitika',
    whatToDoFloodWarning: 'Zochita Mukalandira Chenjezo la Madzi',
    clearSafetySteps: 'Malangizo omveka bwino a chitetezo kwa mabanja a m\'mudzi',
    moveToHighGroundNow: 'Thawirani Kumalo Okwezeka Tsopano',
    neverCrossFastWater: 'Musayese Kuwoloka Madzi Othamanga',
    assistNeighborsChildren: 'Thandizani Anzanu ndi Ana',
    sendVoiceSosIfTrapped: 'Tumizani Mau a SOS Ngati Mwachingidwa',
    villageSirenBroadcast: 'Kuliza Siren ya Mudzi',
    dzenjeStemStationWarning: 'Chenjezo la Sitolo ya STEM ya Dzenje CDSS',
    adminLabel: 'Mtsogoleri',
    manuallySoundSilenceSirens: 'Lizani kapena letsani ma siren a kuthawa pa zipangizo za mudzi zomwe zalumikizidwa.',
    stopEmergencySiren: 'Letsani Siren ya Mwadzidzidzi',
    soundEmergencySiren: 'Lizani Siren ya Mwadzidzidzi',
    soundLabel: 'Phokoso',
    pushLabel: 'Push',
    smsLabel: 'SMS',
    rescueBadge: 'Chipulumutso',
    cutOffByFloodVoiceHelp: 'Ngati mwachingidwa ndi madzi kapena mukufuna thandizo la mwadzidzidzi, tumizani uthenga wamau ndi malo anu a GPS.',
    sendEmergencyVoiceSos: 'Tumizani Mau a SOS a Mwadzidzidzi',
    alertsTotal: 'zonse',
    clearDatabaseAdmin: 'Fufutani Database (Admin)',
    clearMyView: 'Chotsani pa Foni Yangayi',
    filterAll: 'Zonse',
    filterResolved: 'Zatha',
    noticeLabel: 'Chidziwitso',
    recentUpdatesAtStation: 'Zosintha Zaposachedwa pa Malo Awa',
    riverChannelsClear: 'Mitsinje Ili Bwino · Palibe Machenjezo',
    alertTitleRiverClear: 'KULONDERA — Mtsinje Wabwino',
    alertTitleCriticalMove: 'CHENJEZO LA NGOZI — Thawirani Kumalo Okwezeka Tsopano',
    alertTitleHighRisk: 'CHIWOPSEZO CHACHIKULU — Khalani Tcheru',
    alertTitleMonitoring: 'KULONDERA — Khalani Odziwa',
    alertMsgRiverClear: 'Madzi atsika. Kulondera kwachikhala mwamwambo.',
    alertMsgCriticalMove: 'Madzi akukwera mofulumira. Thawirani ndi banja lanu ndi ziweto kumalo okwezeka otetezeka nthawi yomweyo.',
    alertMsgHighRisk: 'Madzi a mtsinje akukwera mofulumira. Khalani tcheru, sungani batire ya foni, ndipo konzekani kuthawa kumalo okwezeka.',
    alertMsgMonitoring: 'Sensa ya mtsinje ikuyang\'anira msinkhu wa madzi. Palibe chochita pakadali pano.',
    stateActiveWarning: 'Chenjezo Lili Ntchito',
    stateResolved: 'Zatha',
    stateUpdated: 'Zasinthidwa',
    stateCriticalWarning: 'Chenjezo la Ngozi',
    stateHighFloodRisk: 'Chiwopsezo Chachikulu cha Madzi',
    stateMonitoring: 'Kulondera',
  },
};

export function getStoredLanguage(): SupportedLanguage {
  return getCurrentLanguage();
}

export function setStoredLanguage(lang: SupportedLanguage): void {
  setAppLanguage(lang);
}

/**
 * App-wide translations. Language changes apply instantly on every screen
 * that uses this hook (shared languageStore + listeners).
 */
export function useTranslation() {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => getCurrentLanguage());

  useEffect(() => {
    const unsub = subscribeLanguage((lang) => {
      setLanguageState(lang as SupportedLanguage);
    });
    setLanguageState(getCurrentLanguage());
    return unsub;
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setAppLanguage(lang);
  };

  const t = translations[language];

  return {
    t,
    language,
    setLanguage,
    isChichewa: language === 'ny',
    isEnglish: language === 'en',
  };
}
