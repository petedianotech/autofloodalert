import { useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'ny';

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
  chichewa: string;
  english: string;
  switchToChichewa: string;
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
    chichewa: 'Chichewa',
    english: 'English',
    switchToChichewa: 'Sinthani ku Chichewa',
    switchToEnglish: 'Switch to English',

    // Navigation
    navDashboard: 'Dashboard',
    navSensor: 'Sensor',
    navAlerts: 'Alerts',
    navVillage: 'Village',
    navLiveCam: 'Live Cam',
    navAdmin: 'Dashboard',

    // APK Download Top Banner & Info
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
  },

  ny: {
    // TopBar & Global Branding
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

    // Navigation
    navDashboard: 'Malo Aakulu',
    navSensor: 'Sensa',
    navAlerts: 'Machenjezo',
    navVillage: 'Mudzi',
    navLiveCam: 'Kanema',
    navAdmin: 'Malo Aakulu',

    // APK Download Top Banner & Info
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

    // Dashboard / Receiver Node View
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

    // Village Community View
    villageCommunityTitle: 'Chitetezo ndi Malo Othawirako a m\'Mudzi',
    villageCommunityDesc: 'Kuwona ngati aliyense ali otetezeka, malo okwezeka ovomerezeka othawirako, ndi manambala a komiti ya ngozi.',
    selectVillage: 'Sankhani Mudzi',
    safeEvacuationZonesTitle: 'Malo Okwezeka Otetezeka Othawirako',
    safeEvacuationZonesDesc: 'Malo ovomerezeka m\'boma la Mulanje omwe ndi okwezeka ndipo madzi sangafikeko.',
    villageEmergencyContactsTitle: 'Atsogoleri a Mudzi ndi Makomiti a Ngozi za Chilengedwe',
    safetyReportsTitle: 'Mndandanda wa Chitetezo cha Anthu m\'Mudzi',
    safetyReportsDesc: 'Malipoti operekedwa ndi anthu okhala m\'mudzi wa Dzenje Village ndi Machokola Village.',
    noSafetyReportsTitle: 'Palibe Malipoti Omwe Aperekedwa Pakadali Pano',
    noSafetyReportsDesc: 'Anthu akhoza kukanikiza batani la "Nenani za Chitetezo" kuti adziwitse anansi ndi mafumu kuti ali bwino.',
    iAmSafe: 'Ndili Bwino / Ndili Otetezeka',
    iNeedHelp: 'Ndikufuna Thandizo Mwachangu',
    trappedInWater: 'Ndazingidwa ndi Madzi',
    evacuatedToSafeZone: 'Ndathawira Kumalo Okwezeka',
    reportSighting: 'Perekani Lipoti la Madzi',
    peopleWithMe: 'Anthu omwe ndili nawo',
    contactNumber: 'Nambala ya Foni',

    // Sensor Node View
    sensorModeTitle: 'Sensa Yoyesa Phokoso ndi Kugwedezeka kwa Mtsinje',
    sensorModeDesc: 'Chida chozindikira kusefukira kwa madzi kudzera pa phokoso la belo ndi kugwedezeka.',
    armSensorBtn: 'Yambitsani Sensa Kuti Ilozero',
    disarmSensorBtn: 'Imitsani Sensa',
    calibrateSensor: 'Konzani Mulingo Woyambira',
    sensorSensitivity: 'Kutha Kuzindikira kwa Sensa',
    soundDecibels: 'Msinkhu wa Phokoso (dB)',
    vibrationDelta: 'Kugwedezeka kwa Sensa',
    acousticAnalysisTitle: 'Chounika Phokoso la Mtsinje',
    acousticAnalysisDesc: 'Chimalekanitsa phokoso la belo la pa njinga logwedezedwa ndi madzi ndi phokoso la mau a anthu.',
    soundBellDetected: 'Phokoso la Belo Lopezeka',
    humanVoiceFiltered: 'Phokoso la Mau a Anthu Laletsedwa',
    testAlarmSound: 'Yesani Kulira kwa Alamu',

    // Admin Dashboard View
    adminDashboardTitle: 'Malo Aakulu Oyendetsera Ntchito za Chitetezo',
    adminDashboardDesc: 'Kuyang\'anira masensa, kutumiza mameseji ku mudzi wonse, kuyang\'anira anthu, ndi kusintha pulogalamu ya APK.',
    totalUsersRegistered: 'Anthu Olembetsa m\'Mudzi',
    activeSensors: 'Masensa Othandiza Mumtsinje',
    smsRecipientsCount: 'Anthu Olandira Mauthenga a SMS',
    broadcastEmergencySms: 'Tumizani Uthenga wa SMS ku Mudzi Wonse',
    userManagementTitle: 'Mndandanda wa Anthu ndi Maulendo awo',
    userManagementDesc: 'Yang\'anirani anthu olembetsa, sankhani atsogoleri kukhala Admin, kapena fufutani anthu osagwira ntchito.',
    roleAdmin: 'Mtsogoleri (Admin)',
    roleResident: 'Wokhala m\'Mudzi',
    makeAdminBtn: 'Khazikitsani kukhala Admin',
    makeResidentBtn: 'Khazikitsani kukhala Resident',
    deleteUserBtn: 'Fufutani Munthu Uyu',
    apkDistributionCardTitle: 'Kusintha Ulalo Wotsitsira Pulogalamu ya Android (APK)',
    apkDistributionCardDesc: 'Namizani ulalo wotsitsira pulogalamu ya Android (APK) apa. Mukasunga, anthu onse awona ulalo watsopano m\'foni mwawo.',
    pasteApkDownloadLink: 'Ulalo (URL) Wotsitsira Pulogalamu ya Android APK',
    saveApkLinkBtn: 'Sungani Ulalo wa APK',
    apkLinkSavedSuccess: 'Ulalo watsopano wa APK wasungidwa bwino ndipo waikidwa mu pulogalamu yonse!',
    apkCurrentVersion: 'Mtundu wa APK womwe ulipo',
    recentSystemLogs: 'Mbiri ya Zochitika ndi Kulira kwa Siren',
    dangerZone: 'Kufufuta Zolemba Zonse Zakale',
    clearAllLogs: 'Fufutani Zolemba Zakale Zonse',

    // Critical Alarm Modal
    criticalAlarmModalTitle: 'CHENJEZO LOOPSA LA MADZI OSEFUKIRA',
    criticalAlarmModalSubtitle: 'MTSINJE WASEFUKIRA KWAMBIRI M\'DERA LANU',
    criticalAlarmInstruction: 'THAWIRANI KUMALO OKWEZEKA OTETEZEKA NTHAWI YOMWEYO! MUSAYESE KUCHEDWA!',
    holdToDismiss: 'KANIKIZANI BATANI KWA MASEKONDI 3 KUTI MUZIMITSE',
    holdToDismissCounting: 'Mukanikiza... Pitirizani Kukanikiza',
    alertLocation: 'Malo Okhudzidwa',
    emergencySirenSounding: 'Siren ya Mwadzidzidzi Ikulira',

    // Modals & General Form Labels
    cancel: 'Lekani',
    submit: 'Tumizani Lipoti',
    confirm: 'Tsimikizani',
    save: 'Sungani Zosintha',
    close: 'Tsekani',
    loading: 'Kudikirira...',
    success: 'Zatheka Bwino',
    error: 'Pachitika Vuto',
    villageDzenje: 'Mudzi wa Dzenje',
    villageMachokola: 'Mudzi wa Machokola',
    traditionalAuthorityMabuka: 'T/A Mabuka',
    districtMulanje: 'Boma la Mulanje',
  },
};

type LanguageChangeListener = (lang: SupportedLanguage) => void;

class I18nService {
  private currentLanguage: SupportedLanguage;
  private listeners: Set<LanguageChangeListener> = new Set();

  constructor() {
    this.currentLanguage = this.loadInitialLanguage();
  }

  private loadInitialLanguage(): SupportedLanguage {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANGUAGE);
      if (saved === 'en' || saved === 'ny') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
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
    return translations[this.currentLanguage];
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
 * Custom React Hook for real-time translation & language switching
 */
export function useTranslation() {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => i18nService.getLanguage());

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
    t: translations[language],
    language,
    setLanguage,
    toggleLanguage,
    isChichewa: language === 'ny',
    isEnglish: language === 'en',
  };
}
