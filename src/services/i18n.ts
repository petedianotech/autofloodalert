import { useState, useEffect } from 'react';

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
    signIn: 'Sign In',
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
    signedInAs: 'Mwalowa monga',
    logout: 'Tulukani',
    adminBadge: 'Mtsogoleri (Admin)',
    residentBadge: 'Wokhala m\'Mudzi',
    language: 'Chiyankhulo',
    chichewa: 'Chichewa',
    english: 'Chingerezi',
    switchToChichewa: 'Sinthani ku Chichewa',
    switchToEnglish: 'Sinthani ku Chingerezi (English)',
    navDashboard: 'Malo Aakulu',
    navSensor: 'Sensa',
    navAlerts: 'Machenjezo',
    navVillage: 'Mudzi',
    navLiveCam: 'Kanema',
    navAdmin: 'Malo Aakulu',
    apkBannerTitle: 'Tsitsani Pulogalamu ya Android (APK)',
    apkBannerDesc: 'Imaliza siren mokweza kwambiri ngakhale foni ili yokhoma ndipo imatumiza mameseji a SMS popanda intaneti.',
    apkDownloadBtn: 'Tsitsani APK',
    apkWhyImportant: 'Chifukwa Chake Ndi Yofunika',
    apkAutoDismissNotice: 'Ibisika mu masekondi 6',
    apkModalTitle: 'Chifukwa Chiyani Pulogalamu ya Android (APK) Ndi Yopulumutsa Miyoyo',
    apkModalSubtitle: 'Kusiyana kwakukulu pakati pa Webusaiti ndi Pulogalamu Yeniyeni ya Android pofuna kuteteza midzi ya m\'boma la Mulanje',
    apkModalClose: 'Ndamvetsetsa, Bwererani',
    apkFeature1Title: 'Siren Yolira Mokweza Ngakhale Foni Ili Yokhoma',
    apkFeature1Desc: 'Mawebusaiti amagona foni ikazimitsidwa. Pulogalamu ya APK imagwira ntchito pansi pamtima ndipo imadzutsa anthu usiku madzi a mtsinje wa Ruo akasefukira mwadzidzidzi.',
    apkFeature2Title: 'Kutumiza Mauthenga a SMS Popanda Intaneti',
    apkFeature2Desc: 'Imatha kulumikizana ndi ma line a foni a m\'manja kuti itumize mameseji achenjezo kwa mafumu, atsogoleri ndi anthu onse m\'mudzi mwamsanga popanda kufuna data ya intaneti.',
    apkFeature3Title: 'Kumvera Phokoso la Mtsinje Nthawi Zonse',
    apkFeature3Desc: 'Imamvetsera phokoso la belo la pa njinga logwedezedwa ndi madzi a mtsinje nthawi zonse popanda foni kuzimitsa sensa chifukwa chosunga batire.',
    apkFeature4Title: 'Kusunga Mauthenga ndi Mamapu a Malo Otetezeka mu Foni',
    apkFeature4Desc: 'Imasunga manambala a atsogoleri, njira zothawira, ndi malo okwezeka m\'foni mwanu kotero kuti muzitha kupeza zonse ngakhale mvula ikugwa mwamphamvu ndipo mulibe intaneti.',
    apkFeature5Title: 'Yopangidwira Midzi ya Dzenje ndi Machokola',
    apkFeature5Desc: 'Yapangidwa ndi ana a sukulu ya Dzenje CDSS ADDA STEM Club pansi pa Mfumu Mabuka m\'boma la Mulanje kuti iteteze miyoyo ndi katundu wa anthu.',
    apkDirectDownloadNow: 'Tsitsani Pulogalamu ya Android Tsopano (8.4 MB)',
    apkVersion: 'Mtundu wa Pulogalamu (Version)',
    apkSize: 'Kukula kwa Fayilo',
    riverStatusSafe: 'Mtsinje Uli Bwino & Palibe Ngozi',
    riverStatusWarning: 'Chenjerani: Madzi Akukwera Mumtsinje',
    riverStatusDanger: 'NGOZI YAIKULU: MADZI OSEFUKIRA AFESHA!',
    riverStatusSafeDesc: 'Masensa a mumtsinje wa Ruo akuonetsa kuti madzi akuyenda mwa bata. Mipata yonse ndi yotetezeka.',
    riverStatusWarningDesc: 'Phokoso logwedezeka kwa madzi laonjezeka m\'mphepete mwa mtsinje. Anthu akhale tcheru.',
    riverStatusDangerDesc: 'Phokoso lalikulu ndi madzi amphamvu asefukira! Thawirani kumalo okwezeka nthawi yomweyo!',
    sirenControlTitle: 'Malo Olizira Siren ya Mudzi ya Mwadzidzidzi',
    sirenControlSubtitle: 'Lizani siren yamphamvu kuti anthu onse m\'mudzi amve kuchenjezedwa nthawi yomweyo',
    startSirenBtn: 'Lizani Siren ya Mwadzidzidzi',
    stopSirenBtn: 'Letsani Siren',
    voiceSosTitle: 'Pemfani Thandizo Mwachangu (Mau a SOS)',
    voiceSosDesc: 'Jambulani mau anu mwachangu kupempha thandizo. Mauthenga amapita kwa atsogoleri a mudzi nthawi yomweyo.',
    voiceSosBtn: 'Tumizani Mau a SOS',
    checkInBtn: 'Nenani za Chitetezo Chanu',
    reportFloodBtn: 'Perekani Lipoti la Madzi Osefukira',
    recentAlertsTitle: 'Mndandanda wa Machenjezo a Madzi',
    noAlertsTitle: 'Palibe Chenjezo la Ngozi Pakadali Pano',
    noAlertsDesc: 'Masensa onse a m\'mudzi wa Dzenje ndi Machokola Village akuonetsa kuti mtsinje ukuyenda bwinobwino.',
    dismissAlert: 'Zimitsani',
    deleteAlert: 'Fufutani',
    clearAllAlerts: 'Fufutani Zonse',
    viewLocationOnMap: 'Onani Malo pa Mapu a Google Maps',
    quickActions: 'Ntchito Zachangu',
    smsGateway: 'Zokhudza Mameseji a SMS',
    pushGateway: 'Mauthenga a Push (FCM)',
    ringtoneSettings: 'Kusintha Kulira kwa Siren',
    evacuationGuideTitle: 'Malangizo Othandiza Pakagwa Ngozi Yadzidzidzi',
    evacStep1Title: '1. Thawirani Kumalo Okwezeka Nthawi Yomweyo',
    evacStep1Desc: 'Pitani ku Phiri la Chikumaluzu kapena malo okwezeka a pa sukulu ya Dzenje CDSS. Musachedwe m\'mbali mwa mtsinje.',
    evacStep2Title: '2. Musayese Kuwoloka Madzi Osefukira',
    evacStep2Desc: 'Madzi othamanga a msinkhu wochepa amatha kugwetsa ndi kukukokolani. Pewani milatho yomwe yamizidwa ndi madzi.',
    evacStep3Title: '3. Thandizani Okalamba, Ana ndi Ziweto',
    evacStep3Desc: 'Thandizani anthu ofooka pabanja panu ndipo tengani zinthu zofunika kwambiri monga mankhwala ndi zikalata zanu.',
    villageCommunityTitle: 'Malo a Chitetezo ndi Kuthawa kwa Mudzi',
    villageCommunityDesc: 'Kuwerengera anthu, malo okwezeka otetezeka, ndi ma kontakiti a komiti ya tsoka.',
    selectVillage: 'Sankhani Mudzi',
    safeEvacuationZonesTitle: 'Malo Okwezeka Othawirako',
    safeEvacuationZonesDesc: 'Malo ovomerezeka a chitetezo m\'boma la Mulanje omwe ali okwezeka.',
    villageEmergencyContactsTitle: 'Mafumu ndi Makomiti a Tsoka a Mudzi',
    safetyReportsTitle: 'Kuwerengera Chitetezo cha Anthu',
    safetyReportsDesc: 'Mauthenga a okhala a m\'mudzi wa Dzenje ndi Machokola.',
    noSafetyReportsTitle: 'Palibe Lipoti la Okhala Pakadali Pano',
    noSafetyReportsDesc: 'Okhala atha kufunsa "Neni kuti Ndili Otetezeka" kuti mafumu ndi anzanu adziwe kuti ali otetezeka.',
    iAmSafe: 'Ndili Otetezeka',
    iNeedHelp: 'Ndikufuna Thandizo',
    trappedInWater: 'Ndachingidwa ndi Madzi',
    evacuatedToSafeZone: 'Ndathawa ku Malo Otetezeka',
    reportSighting: 'Nenani za Madzi Osefukira',
    peopleWithMe: 'Anthu omwe ali nane',
    contactNumber: 'Nambala ya Foni',
    sensorModeTitle: 'Sensa ya Phokoso ndi Kugwedezeka kwa Mtsinje',
    sensorModeDesc: 'Chida chowunikira phokoso la madzi ndi kugwedezeka kwa mtsinje.',
    armSensorBtn: 'Yambitsani Sensa',
    disarmSensorBtn: 'Imitsani Sensa',
    calibrateSensor: 'Konzani Moyo Woyambira',
    sensorSensitivity: 'Msinkhu wa Kumva',
    soundDecibels: 'Msinkhu wa Phokoso',
    vibrationDelta: 'Kusintha kwa Kugwedezeka',
    acousticAnalysisTitle: 'Chosanthula Phokoso',
    acousticAnalysisDesc: 'Siyanitsa phokoso la belo la njinga ndi mawu a anthu.',
    soundBellDetected: 'Phokoso la Belo Lapezeka',
    humanVoiceFiltered: 'Mawu a Anthu Achotsedwa',
    testAlarmSound: 'Yesani Alarm ya Sensa',
    adminDashboardTitle: 'Bolodi la Ntchito za Mwadzidzidzi',
    adminDashboardDesc: 'Kuwongolera masensa, mauthenga a mudzi, maudindo, ndi zosintha za APK.',
    totalUsersRegistered: 'Okhala Omwe Adalembetsa',
    activeSensors: 'Masensa a Mtsinje Ogwira Ntchito',
    smsRecipientsCount: 'Omwe Aalandira SMS',
    broadcastEmergencySms: 'Tumizani SMS ya Mwadzidzidzi kwa Onse',
    userManagementTitle: 'Mndandanda wa Okhala ndi Ulamuliro',
    userManagementDesc: 'Wongolani olembetsa, sinthani udindo, kapena chotsani maakaunti.',
    roleAdmin: 'Mtsogoleri',
    roleResident: 'Wokhala',
    makeAdminBtn: 'Pangani Mtsogoleri',
    makeResidentBtn: 'Pangani Wokhala',
    deleteUserBtn: 'Fufutani Akaunti',
    apkDistributionCardTitle: 'Kukonza Link ya APK',
    apkDistributionCardDesc: 'Ikkani URL yotsitsira APK. Zisintha zimawoneka mu pulogalamu yonse.',
    pasteApkDownloadLink: 'URL Yotsitsira APK',
    saveApkLinkBtn: 'Sungani ndi Fufutani Link',
    apkLinkSavedSuccess: 'Link ya APK yasinthidwa bwino!',
    apkCurrentVersion: 'Mtundu wa APK Wogwira Ntchito',
    recentSystemLogs: 'Mbiri ya Zochitika ndi Siren',
    dangerZone: 'Kukonza Dongosolo ndi Kufufuta Mbiri',
    clearAllLogs: 'Fufutani Mbiri ya Machenjezo',
    criticalAlarmModalTitle: 'CHENJEZO LA NGOZI YA MADZI',
    criticalAlarmModalSubtitle: 'MADZI ASEFUKIRA M\'DERA LANU',
    criticalAlarmInstruction: 'THAWIRANI KUMALO OKWEZEKA NTHAWI YOMWEYO! MUSADIKIRE!',
    holdToDismiss: 'GWIRANI BATANI KWA MASEKONDI 3 KUTI MUZIMITSE',
    holdToDismissCounting: 'Mukugwira... Pitirizani',
    alertLocation: 'Malo',
    emergencySirenSounding: 'Siren ya Mwadzidzidzi Ikulira',
    cancel: 'Letsani',
    submit: 'Tumizani Lipoti',
    confirm: 'Tsimikizani',
    save: 'Sungani Zosintha',
    close: 'Tsekani',
    loading: 'Ikukonza...',
    success: 'Zatheka Bwino',
    error: 'Pali cholakwika',
    villageDzenje: 'Mudzi wa Dzenje',
    villageMachokola: 'Mudzi wa Machokola',
    traditionalAuthorityMabuka: 'T/A Mabuka',
    districtMulanje: 'Boma la Mulanje',
    emergencyRescueStation: 'Malo a Chipulumutso cha Mwadzidzidzi',
    villageFloodWarningNetwork: 'Netiweki ya Machenjezo a Madzi a Mudzi',
    riverFloodAlerts: 'Machenjezo a Madzi a Mtsinje',
    activeOnly: 'Zomwe Zikuchitika',
    totalPeopleCheckedIn: 'Chiwerengero Cha Anthu Onse Omwe Analemba m\'Midzi Yonse',
    resident: 'Wokhala m\'Mudzi',
    residents: 'Okhala m\'Mudzi',
    personCheckedIn: 'munthu walemba',
    peopleCheckedIn: 'anthu alemba',
    safeAreasLabel: 'Malo Otetezeka',
    mulanjeRuoArea: 'Boma la Mulanje · Dera la Mtsinje wa Ruo',
    changeVillage: 'Sinthani',
    criticalFloodWarningShort: 'CHENJEZO LA NGOZI YA MADZI',
    highFloodRiskShort: 'CHIWOPSEZO CHACHIKULU CHA MADZI',
    riverRisingSafeGroundReady: 'Madzi akukwera. Malo okwezeka otetezeka ali okonzeka.',
    normalMonitoringNoFloods: 'Kulondera Mwamwambo · Palibe Madzi Osefukira',
    riverSensorsWatching: 'Masensa a mtsinje akuyang\'anira msinkhu wa madzi nthawi zonse.',
    checkInsLabel: 'Olemba',
    safeLabel: 'Otetezeka',
    peopleLabel: 'Anthu',
    markIAmSafe: 'Neni kuti Ndili Otetezeka',
    reportFloods: 'Nenani za Madzi Osefukira',
    emergencyVoiceSosRescue: 'Mau a SOS a Mwadzidzidzi (Mzere wa Chipulumutso)',
    switchVillage: 'Sinthani Mudzi',
    safetyGuide: 'Malangizo a Chitetezo',
    safeHighGroundEvacAreas: 'Malo Okwezeka Othawirako',
    designatedSheltersFor: 'Malo otetezeka opangidwira anthu a',
    highGroundBadge: 'Malo Okwezeka',
    highGroundEvacShelter: 'Pothawirapo la Malo Okwezeka',
    capacityLabel: 'Kutha Kuchititsa',
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
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LANGUAGE);
    if (stored === 'ny' || stored === 'en') return stored;
  } catch {}
  return 'en';
}

export function setStoredLanguage(lang: SupportedLanguage): void {
  try {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
  } catch {}
}

export function useTranslation() {
  const [language, setLanguageState] = useState<SupportedLanguage>(getStoredLanguage);

  useEffect(() => {
    setStoredLanguage(language);
  }, [language]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    setStoredLanguage(lang);
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
