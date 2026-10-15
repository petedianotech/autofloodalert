export const ADMIN_EMAIL = 'petedianotech@gmail.com';

export const isAppAdmin = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.email && user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()) {
    return true;
  }
  const cleanName = (user.name || '').toLowerCase().trim().replace(/\s+/g, ' ');
  const cleanVillage = (user.village || '').toLowerCase().trim().replace(/\s+/g, ' ');
  const isMatchAdminName =
    cleanName === 'dzenje cdss adda stem club' ||
    cleanName === 'dzenje cdss' ||
    cleanName === 'adda stem club' ||
    cleanName.includes('adda stem');
  const isMatchAdminVillage =
    cleanVillage === 'dzenje village' || cleanVillage === 'dzenje';

  if (isMatchAdminName && isMatchAdminVillage) {
    return true;
  }
  return false;
};

export interface UserProfile {
  uid: string;
  name: string;
  village: string;
  phone?: string;
  smsAlertsEnabled?: boolean;
  swipeGesturesEnabled?: boolean;
  alertLanguage?: 'en' | 'ny';
  email?: string;
  photoURL?: string;
  authProvider: 'name_village' | 'google';
  hasPassword?: boolean;
  role?: 'resident' | 'warden' | 'operator' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: UserProfile | null;
  firebaseUid: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export interface MotionData {
  x: number;
  y: number;
  z: number;
  totalMagnitude: number;
  delta: number;
  timestamp: number;
}

export type FloodSeverity = 'yellow' | 'red';

export interface GeoLocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  timestamp: number;
}

export interface SensorLocation {
  riverName: string;
  village: string;
  traditionalAuthority: string;
  district: string;
  region: string;
  fullAddress: string;
  coordinates?: GeoLocationCoordinates | null;
  isGpsLive?: boolean;
  gpsAccuracy?: number;
  mapsUrl?: string;
}

export interface FloodAlert {
  id: string;
  timestamp: number;
  formattedTime: string;
  peakDelta: number;
  durationSeconds: number;
  nodeId: string;
  nodeName: string;
  village?: string;
  location?: SensorLocation;
  locationLabel?: string;
  riverName?: string;
  traditionalAuthority?: string;
  district?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  mapsUrl?: string;
  userId?: string;
  status: 'active' | 'resolved' | 'dismissed';
  severity?: FloodSeverity;
  title?: string;
  message?: string;
  dismissedBy?: string;
  dismissedAt?: number;
  source: 'hardware_sensor' | 'acoustic_sound_sensor' | 'manual_test' | 'simulated';
  notes?: string;
}

export type SensorDetectionMode = 'motion' | 'sound' | 'both';

export interface AcousticData {
  decibels: number;
  rms: number;
  peakRms: number;
  resonanceScore: number;
  frequencyData: number[];
  isWaterRoarDetected: boolean;
  sustainedDurationSec: number;
  triggerProgress: number;
  timestamp: number;
  bellDetectionScore: number;
  isBellRingingDetected: boolean;
  soundClassification: 'bell_ringing' | 'human_voice' | 'whistle' | 'ambient_noise' | 'water_roar' | 'quiet';
  voiceRejectionActive: boolean;
  whistleRejectionActive: boolean;
  motorCadenceHz: number;
  bellBandDb: number;
  speechBandDb: number;
}

export interface AcousticSensorState {
  isSupported: boolean;
  isListening: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  isPaused: boolean;
  error?: string;
  thresholdYellowDb: number;
  thresholdRedDb: number;
  resonanceThreshold: number;
}

export interface SensorConfig {
  thresholdYellow: number;
  thresholdRed: number;
  thresholdDelta: number;
  thresholdYellowDb?: number;
  thresholdRedDb?: number;
  soundResonanceSensitivity?: number;
  activeDetectionMode?: SensorDetectionMode;
  continuousDurationSec: number;
  sensorName: string;
  nodeId: string;
  location?: SensorLocation;
  sirenVolume: number;
  autoWakeLock: boolean;
  pushEnabled: boolean;
  soundAlarmOnDevice: boolean;
  highContrastAlert: boolean;
  baselineGravity: number;
}

export interface WakeLockState {
  isSupported: boolean;
  isActive: boolean;
  error?: string;
  releaseTime?: number;
}

export interface MotionSensorState {
  isSupported: boolean;
  isListening: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  isCalibrating: boolean;
  error?: string;
  hardwareAvailable: boolean;
  isPaused?: boolean;
}

export interface BatteryState {
  isSupported: boolean;
  charging: boolean;
  level: number;
  chargingTime?: number;
  dischargingTime?: number;
}

export type SafetyStatusType = 'safe' | 'in_flooding' | 'needs_help' | 'evacuated' | 'flood_sighting';

export interface ResidentSafetyReport {
  id: string;
  userId: string;
  userName: string;
  village: string;
  status: SafetyStatusType;
  statusLabel?: string;
  peopleCount?: number;
  phone?: string;
  message?: string;
  timestamp: number;
  formattedTime: string;
  latitude?: number;
  longitude?: number;
  mapsUrl?: string;
  floodLevel?: 'low' | 'medium' | 'high' | 'critical';
  waterDescription?: string;
  landmark?: string;
  reportType?: 'safety_status' | 'flood_sighting';
  voiceAudioBase64?: string;
  voiceDurationSec?: number;
  hasVoiceNote?: boolean;
  updatedAt?: string;
}

export type NodeMode = 'sensor' | 'receiver' | 'village' | 'diagnostics' | 'admin' | 'settings';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  isConfigured: boolean;
}
