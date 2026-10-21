import { useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'ny';

const STORAGE_KEY_LANGUAGE = 'flood_app_selected_language_v2';

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
  chichewa: string;
  switchToEnglish: string;
  switchToChichewa: string;

  // Navigation
  navDashboard: string;
  navSensor: string;
  navAlerts: string;
  navVillage: string;
  navLiveCam: string;
  navAdmin: string;

  // Exact User Specified Mappings
  village: string;
  alerts: string;
  change: string;
  switchVillage: string;
  safetyGuide: string;
  riverFloodAlerts: string;
  total: string;
  all: string;
  activeOnly: string;
  resolved: string;
  checkIns: string;
  safe: string;
  people: string;
  markIAmSafe: string;
  reportFloods: string;
  emergencyRescueSos: string;
  instantVoiceGpsDispatch: string;
  liveGps: string;
  recordSendVoiceSos: string;
  safeAreas: string;
  safeHighGroundEvacuationAreas: string;
  designatedSheltersInDzenje: string;
  highGround: string;
  highGroundEvacuationShelter: string;
  capacity: string;
  aboutPeople: string;

  // On Village Screen Specific Texts
  riverChannelsClearNoAlerts: string;
  riverSensorsActiveDesc: string;
  normalMonitoringNoFloods: string;
  riverSensorsWatchingContinuously: string;
  villageDzenjeName: string;
  mulanjeDistrictRuoArea: string;
  dzenjeCdssHallName: string;

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
    chichewa: 'Chichewa',
    switchToEnglish: 'Switch to English',
    switchToChichewa: 'Sinthani ku Chichewa',

    // Navigation
    navDashboard: 'Dashboard',
    navSensor: 'Sensor',
    navAlerts: 'Alerts',
    navVillage: 'Village',
    navLiveCam: 'Live Cam',
    navAdmin: 'Dashboard',

    // Exact User Specified Mappings
    village: 'Village',
    alerts: 'Alerts',
    change: 'Change',
    switchVillage: 'Switch Village',
    safetyGuide: 'Safety Guide',
    riverFloodAlerts: 'RIVER FLOOD ALERTS',
    total: 'total',
    all: 'All',
    activeOnly: 'Active Only',
    resolved: 'Resolved',
    checkIns: 'Check-Ins',
    safe: 'Safe',
    people: 'People',
    markIAmSafe: 'Mark I Am Safe',
    reportFloods: 'Report Floods',
    emergencyRescueSos: 'Emergency Rescue SOS',
    instantVoiceGpsDispatch: 'Instant voice & GPS dispatch to rescue team',
    liveGps: 'Live GPS',
    recordSendVoiceSos: 'Record & Send Voice SOS',
    safeAreas: 'Safe Areas',
    safeHighGroundEvacuationAreas: 'SAFE HIGH GROUND EVACUATION AREAS',
    designatedSheltersInDzenje: 'Designated shelters for residents in Dzenje Village',
    highGround: 'High Ground',
    highGroundEvacuationShelter: 'High Ground Evacuation Shelter',
    capacity: 'Capacity:',
    aboutPeople: 'About people',

    // On Village Screen Specific Texts
    riverChannelsClearNoAlerts: 'River Channels Clear • No Active Warnings',
    riverSensorsActiveDesc:
      'River sensors along the Ruo River and surrounding streams are active. You will receive audible warnings and notifications immediately if water levels rise.',
    normalMonitoringNoFloods: 'Normal Monitoring • No Active Floods',
    riverSensorsWatchingContinuously: 'River sensors watching water levels continuously.',
    villageDzenjeName: 'Dzenje Village',
    mulanjeDistrictRuoArea: 'Mulanje District • Ruo River Area',
    dzenjeCdssHallName: 'Dzenje CDSS Hall',

    // APK Download Top Banner & Info
    apkBannerTitle: 'Android Native App',
    apkBannerDesc:
      'Get guaranteed offline siren alarms & automatic emergency SMS dispatch even when phone is locked.',
    apkDownloadBtn: 'Download',
    apkWhyImportant: 'Why System is Vital',
    apkAutoDismissNotice: 'Hiding in 6s',
    apkModalTitle: 'Why Automatic Flood Alert is Life-Saving',
    apkModalSubtitle: 'Crucial features for rural village safety in Mulanje',
    apkModalClose: 'Understood, Back to App',
    apkFeature1Title: 'Loud Emergency Siren on Locked Screen',
    apkFeature1Desc:
      'Runs background watchdog audio alarms that wake you up during midnight flash floods.',
    apkFeature2Title: 'Emergency SMS Flood Alerts',
    apkFeature2Desc:
      'Integrates directly to dispatch emergency text warnings to village elders, chiefs, and residents.',
    apkFeature3Title: 'Continuous River Acoustic Monitoring',
    apkFeature3Desc: 'Listens continuously for high-frequency river bell resonance.',
    apkFeature4Title: 'Zero-Data Emergency Offline Caching',
    apkFeature4Desc:
      'Stores emergency contact numbers, evacuation routes, and safe-ground maps directly on device storage.',
    apkFeature5Title: 'Tailored for Dzenje & Machokola Villages',
    apkFeature5Desc:
      'Built specifically for the Ruo River basin by Dzenje CDSS ADDA STEM Club to protect lives and properties across T/A Mabuka, Mulanje.',
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
    villageCommunityDesc:
      'Real-time community roll-call, designated safe high-ground zones, and local disaster committee contacts.',
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
  },

  ny: {
    // TopBar & Global Branding
    appName: 'Automatic Flood Alert',
    clubName: 'Dzenje CDSS ADDA STEM CLUB',
    systemLive: 'Dongosolo Lili Bwino',
    refresh: 'Tsitsani Tsopano',
    refreshing: 'Kutsitsanso uthenga...',
    about: 'Za Pulojekiti & Malamulo',
    signIn: 'Lowani',
    signedInAs: 'Mwalowa ngati',
    logout: 'Tulukani',
    adminBadge: 'Mtsogoleri',
    residentBadge: 'Wokhala Mmudzi',
    language: 'Chilankhulo',
    english: 'English',
    chichewa: 'Chichewa',
    switchToEnglish: 'Sinthani ku Chingerezi',
    switchToChichewa: 'Sinthani ku Chichewa',

    // Navigation (User improved)
    navDashboard: 'Dashboard',
    navSensor: 'Makina',
    navAlerts: 'chenjezo',
    navVillage: 'Mudzi',
    navLiveCam: 'Kamera',
    navAdmin: 'Dashboard',

    // Exact User Specified Mappings
    village: 'Mudzi',
    alerts: 'chenjezo',
    change: 'Sinthani',
    switchVillage: 'Sintha Mudzi',
    safetyGuide: 'Malangizo',
    riverFloodAlerts: "CHENJEZO LA M'MTSINJE",
    total: 'zonse',
    all: 'Zonse',
    activeOnly: 'Zomwe Ziripo',
    resolved: 'Zatha',
    checkIns: 'Olembetsa',
    safe: 'otetezeka',
    people: 'Anthu',
    markIAmSafe: 'Ndili Bwino',
    reportFloods: 'kenena za Chigumula',
    emergencyRescueSos: 'Thandizo la SOS',
    instantVoiceGpsDispatch: 'Tumizani mawu ndi malo omwe muli',
    liveGps: 'GPS',
    recordSendVoiceSos: 'Tumizani SOS',
    safeAreas: 'Malo Otetezeka',
    safeHighGroundEvacuationAreas: 'MALO OKWERA OTHAWIRAKO',
    designatedSheltersInDzenje: "Malo othawirako a anthu m'mudzi wa Dzenje",
    highGround: 'Malo Okwera',
    highGroundEvacuationShelter: 'Malo Okwera Othawirako',
    capacity: 'Malire:',
    aboutPeople: 'Anthu pafupifupi',

    // On Village Screen Specific Texts
    riverChannelsClearNoAlerts: 'Mitsinje Ili Bwino • Palibe Chenjezo',
    riverSensorsActiveDesc:
      'Makina a m’mtsinje wa Ruo ndi ena  akugwira ntchito. Mupeza chenjezo  ndi uthenga madzi akakwera.',
    normalMonitoringNoFloods: 'Zilili Bwino • Palibe Chigumula',
    riverSensorsWatchingContinuously: "Makina akuyang'anira msinkhu wa madzi nthawi zonse.",
    villageDzenjeName: 'Mudzi wa Dzenje',
    mulanjeDistrictRuoArea: 'Boma la Mulanje • Dera la Mtsinje wa Ruo',
    dzenjeCdssHallName: 'Holo ya Dzenje CDSS',

    // APK Download Top Banner & Info
    apkBannerTitle: 'Pulogalamu ya Foni ya Android',
    apkBannerDesc:
      'Landirani ma alamu a siren ngakhale foni ili yotseka komanso mameseji a SMS.',
    apkDownloadBtn: 'Koperani (Download)',
    apkWhyImportant: 'Chifukwa Chake Ndi Yofunika',
    apkAutoDismissNotice: 'Zibisika masekondi 6',
    apkModalTitle: 'Chifukwa Chake Dongosolo Limapulumutsa Miyoyo',
    apkModalSubtitle: 'Ubwino wapadera poteteza anthu ku Mulanje',
    apkModalClose: 'Ndamva, Bwererani',
    apkFeature1Title: 'Alamu Yaphokoso Pamene Foni Yakhoma',
    apkFeature1Desc: 'Imalira kwambiri kukudzuttsani pakati pausiku pamene madzi afika.',
    apkFeature2Title: 'Mauthenga a Chenjezo a SMS ku Mudzi',
    apkFeature2Desc: 'Kutumiza mameseji a chenjezo nthawi yomweyo kwa ma fumu ndi anthu amudzi.',
    apkFeature3Title: 'Kutsatira Phokoso la Mtsinje Nthawi Zonse',
    apkFeature3Desc: 'Imamva zizindikiro za chigumula ndi mabelu a chenjezo.',
    apkFeature4Title: 'Kugwira Ntchito Popanda Intaneti',
    apkFeature4Desc: 'Imasunga nambala za thandizo ndi mapu a malo okwera mufoni mwanu.',
    apkFeature5Title: 'Yapadera kwa Midzi ya Dzenje ndi Machokola',
    apkFeature5Desc: 'Yapangidwa ndi ana a sukulu a Dzenje CDSS ADDA STEM Club ku T/A Mabuka.',
    apkDirectDownloadNow: 'Automatic Flood Alert',
    apkVersion: 'Mtundu',
    apkSize: 'Kukula',

    // Dashboard / Receiver Node View
    riverStatusSafe: 'Madzi ali Bwino mu Mtsinje',
    riverStatusWarning: 'Chenjezo: Madzi Akukwera Pang\'ono',
    riverStatusDanger: 'CHENJEZO LA CHIGUMULA: THAWIRANI KU MALO OKWERA!',
    riverStatusSafeDesc: 'Makina a Ruo akuti madzi akuyenda bwino. Palibe chiopsezo chilichonse.',
    riverStatusWarningDesc: 'Madzi a m’mtsinje wayamba kukwera. Khalani maso ndi okonzeka.',
    riverStatusDangerDesc: 'Chigumula chachikulu chabwera! Thawirani ku malo okwera mwachangu!',
    sirenControlTitle: 'Malo Oyimbira Alamu ya Mudzi',
    sirenControlSubtitle: 'Yambitsani alamu yaphokoso pa mafoni onse a m’mudzi',
    startSirenBtn: 'Yambitsani Alamu',
    stopSirenBtn: 'Tseketsani Alamu',
    voiceSosTitle: 'Kutumiza Mawu a Thandizo la SOS',
    voiceSosDesc: 'Jambulani mawu opeza thandizo kapena malo omwe muli. Apezeka kwa atsogoleri a mudzi.',
    voiceSosBtn: 'Tumizani Mawu a SOS',
    checkInBtn: 'Dziwitsani Kuti Muli Bwino',
    reportFloodBtn: 'Kenena za Chigumula',
    recentAlertsTitle: 'Mndandanda wa Machenjezo',
    noAlertsTitle: 'Palibe Machenjezo a Chigumula',
    noAlertsDesc: 'Makina onse a m’mudzi wa Dzenje ndi Machokola akuti mitsinje ili bwino.',
    dismissAlert: 'Tsekani',
    deleteAlert: 'Fafazani',
    clearAllAlerts: 'Chotsani Zonse',
    viewLocationOnMap: 'Onani Malo pa Mapu a Google',
    quickActions: 'Ntchito Zachangu',
    smsGateway: 'Zokhudza Mauthenga a SMS',
    pushGateway: 'Mauthenga a Push',
    ringtoneSettings: 'Kusankha Alamu',
    evacuationGuideTitle: 'Zoyenera Kuchita Pakagwa Chigumula',
    evacStep1Title: '1. Thawirani ku Malo Okwera Nthawi Yomweyo',
    evacStep1Desc: 'Pitani ku Phiri la Chikumaluzu kapena sukulu ya Dzenje CDSS. Osayandikira mtsinje.',
    evacStep2Title: '2. Musaoloke Madzi Akuyenda Kwambiri',
    evacStep2Desc: 'Madzi othamanga ngakhale ofika pamapazi amatha kukukokolani. Osadutsa pa milatho yomira.',
    evacStep3Title: '3. Thandizani Okalamba, Ana ndi Zoweta',
    evacStep3Desc: 'Thandizani anthu ofooka ndipo tengani zinthu zofunikira monga mankhwala.',

    // Village Community View
    villageCommunityTitle: 'Malo Otetezeka a Mudzi & Kuthawa Chigumula',
    villageCommunityDesc:
      'Kuwerengera anthu otetezeka, malo okwera othawirako, ndi nambala za komiti yoona za ngozi zogwa mwadzidzidzi.',
    selectVillage: 'Sankhani Mudzi',
    safeEvacuationZonesTitle: 'Malo Otetezeka Othawirako ku Mulanje',
    safeEvacuationZonesDesc: 'Malo ovomerezeka okwera omwe madzi sangafikeko ku Mulanje.',
    villageEmergencyContactsTitle: 'Mafumu ndi Makomiti a Ngozi Zogwa Mwadzidzidzi',
    safetyReportsTitle: 'Kuwerengera Anthu Otetezeka',
    safetyReportsDesc: 'Malipoti ochokera kwa anthu a m’mudzi wa Dzenje ndi Machokola.',
    noSafetyReportsTitle: 'Palibe Lipoti La anthu Padakali Pano',
    noSafetyReportsDesc: 'Anthu amatha kukanikiza "Ndili Bwino" kuti adziwitse anansi awo ndi mafumu.',
    iAmSafe: 'Ndili Bwino',
    iNeedHelp: 'Ndikufuna Thandizo',
    trappedInWater: 'Ndakatsekeredwa m’Madzi',
    evacuatedToSafeZone: 'Ndafika ku Malo Okwera',
    reportSighting: 'Kenena za Chigumula',
    peopleWithMe: 'Anthu omwe ndili nawo',
    contactNumber: 'Nambala ya Foni',

    // Sensor Node View
    sensorModeTitle: 'Makina Oyeza Phokoso ndi Kugwedezeka kwa Mtsinje',
    sensorModeDesc: 'Dongosolo lozindikira kukwera kwa madzi kudzera mu mabelu a machenjezo ndi kugwedezeka.',
    armSensorBtn: 'Yatsani Makina',
    disarmSensorBtn: 'Zimitsani Makina',
    calibrateSensor: 'Konzani Makina',
    sensorSensitivity: 'Mulingo Wozindikira',
    soundDecibels: 'Mulingo wa Phokoso',
    vibrationDelta: 'Kugwedezeka',
    acousticAnalysisTitle: 'Kuyeza Phokoso la Mtsinje',
    acousticAnalysisDesc: 'Kulekanitsa phokoso la belu la chenjezo ndi mawu a anthu olankhula.',
    soundBellDetected: 'Phokoso la Belu Lazindikiridwa',
    humanVoiceFiltered: 'Mawu a Anthu Asefedwa',
    testAlarmSound: 'Yesani Alamu',

    // Admin Dashboard View
    adminDashboardTitle: 'Dashboard ya Utsogoleri ndi Mayendetsedwe',
    adminDashboardDesc: 'Kuyang\'anira makina a m\'mitsinje, mauthenga ku mudzi, ndi ogwiritsa ntchito.',
    totalUsersRegistered: 'Anthu Onse Olembetsedwa',
    activeSensors: 'Makina Ogwira Ntchito',
    smsRecipientsCount: 'Nambala Zolandira SMS',
    broadcastEmergencySms: 'Tumizani Uthenga wa SMS ku Mudzi Wonse',
    userManagementTitle: 'Mndandanda wa Anthu & Maudindo',
    userManagementDesc: 'Kuyang\'anira zolemba za anthu, kupatsa udindo wa admin, kapena kuchotsa maakaunti.',
    roleAdmin: 'Mtsogoleri (Admin)',
    roleResident: 'Wokhala Mmudzi',
    makeAdminBtn: 'Patsani Utsogoleri',
    makeResidentBtn: 'Chotsani Utsogoleri',
    deleteUserBtn: 'Fafazani Akaunti',
    apkDistributionCardTitle: 'Kusintha Pulogalamu',
    apkDistributionCardDesc: 'Zokhudzana ndi kusintha pulogalamu.',
    pasteApkDownloadLink: 'Ulalo Wokopera (Link)',
    saveApkLinkBtn: 'Sungani Zosintha',
    apkLinkSavedSuccess: 'Zasungidwa bwino!',
    apkCurrentVersion: 'Mtundu Womwe Ulipo',
    recentSystemLogs: 'Mbiri ya Ntchito za Dongosolo',
    dangerZone: 'Malo Owopsa',
    clearAllLogs: 'Chotsani Mbiri Yonse',

    // Critical Alarm Modal
    criticalAlarmModalTitle: 'CHENJEZO LOOPSA LA CHIGUMULA',
    criticalAlarmModalSubtitle: 'MADZI A M’MTSINJE ADZAZA NDIPO AKUSEFUKIRA',
    criticalAlarmInstruction: 'THAWIRANI KU MALO OKWERA NTHAWI YOMWEYO! OSAYANG\'ANIRA!',
    holdToDismiss: 'KANIKIZANI MASEKONDI 3 KUTSEKA',
    holdToDismissCounting: 'Gwirani... Osamasula',
    alertLocation: 'Malo',
    emergencySirenSounding: 'Alamu ya Phokoso Ikulira',

    // Modals & General Form Labels
    cancel: 'Lekani',
    submit: 'Tumizani',
    confirm: 'Tsimikizani',
    save: 'Sungani',
    close: 'Tsekani',
    loading: 'Zikukonzedwa...',
    success: 'Zatheka bwino',
    error: 'Palakwika kanthu',
    villageDzenje: 'Mudzi wa Dzenje',
    villageMachokola: 'Mudzi wa Machokola',
    traditionalAuthorityMabuka: 'T/A Mabuka',
    districtMulanje: 'Boma la Mulanje',
    emergencyRescueStation: 'Malo Othandizira Odzidzimutsa',
    villageFloodWarningNetwork: 'Dongosolo la Chenjezo ku Mudzi',
  },
};

type LanguageChangeListener = (lang: SupportedLanguage) => void;

class I18nService {
  private currentLanguage: SupportedLanguage = 'en';
  private listeners: Set<LanguageChangeListener> = new Set();

  constructor() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANGUAGE);
      if (saved === 'ny' || saved === 'en') {
        this.currentLanguage = saved;
      }
    } catch {
      this.currentLanguage = 'en';
    }
  }

  public getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  public setLanguage(lang: SupportedLanguage) {
    if (this.currentLanguage === lang) return;
    this.currentLanguage = lang;
    try {
      localStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
    } catch {
      // ignore
    }
    this.notifyListeners();
  }

  public toggleLanguage(): SupportedLanguage {
    const nextLang: SupportedLanguage = this.currentLanguage === 'en' ? 'ny' : 'en';
    this.setLanguage(nextLang);
    return nextLang;
  }

  public get t(): Translations {
    return translations[this.currentLanguage] || translations.en;
  }

  public subscribe(listener: LanguageChangeListener): () => void {
    this.listeners.add(listener);
    listener(this.currentLanguage);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.currentLanguage);
      } catch (err) {
        console.warn('I18nService listener error:', err);
      }
    });
  }
}

export const i18nService = new I18nService();

/**
 * Custom React Hook for translations with live reactive re-render on language switch
 */
export function useTranslation(forceEnglish: boolean = false) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => i18nService.getLanguage());

  useEffect(() => {
    return i18nService.subscribe((newLang) => {
      setLanguageState(newLang);
    });
  }, []);

  const effectiveLang: SupportedLanguage = forceEnglish ? 'en' : language;

  const setLanguage = (lang: SupportedLanguage) => {
    if (forceEnglish) return;
    i18nService.setLanguage(lang);
  };

  const toggleLanguage = () => {
    if (forceEnglish) return;
    i18nService.toggleLanguage();
  };

  return {
    t: translations[effectiveLang] || translations.en,
    language: effectiveLang,
    setLanguage,
    toggleLanguage,
    isChichewa: effectiveLang === 'ny',
    isEnglish: effectiveLang === 'en',
  };
}
