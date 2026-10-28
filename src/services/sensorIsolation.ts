/**
 * Sensor mode isolation: only the selected sensor runs.
 * Bell = sound only, Vibration = motion only, Both = both.
 */
import type { SensorDetectionMode } from '../types';
import { motionSensorService } from './motionSensor';
import { acousticSensorService } from './acousticSensorService';
import { wakeLockService } from './wakeLock';

export function stopAllSensors() {
  motionSensorService.stopListening();
  acousticSensorService.stopListening();
}

export function startSensorsForMode(mode: SensorDetectionMode, autoWakeLock: boolean) {
  if (mode === 'motion') {
    acousticSensorService.stopListening();
    motionSensorService.startListening();
  } else if (mode === 'sound') {
    motionSensorService.stopListening();
    acousticSensorService.startListening();
  } else {
    motionSensorService.startListening();
    acousticSensorService.startListening();
  }
  if (autoWakeLock) {
    wakeLockService.request();
  }
}

export function applyAcousticConfig(
  thresholdYellowDb: number,
  thresholdRedDb: number,
  sensitivity: number
) {
  acousticSensorService.setConfig(thresholdYellowDb, thresholdRedDb, sensitivity);
}
