import React from 'react';
import {
  Activity,
  Bell,
  Volume2,
  Play,
  Square,
  CheckCircle2,
} from 'lucide-react';
import {
  MotionData,
  MotionSensorState,
  AcousticData,
  AcousticSensorState,
  SensorDetectionMode,
  WakeLockState,
  SensorConfig,
  UserProfile,
} from '../types';
import { LiveAcousticMeter } from './LiveAcousticMeter';
import { LiveMotionMeter } from './LiveMotionMeter';

interface SensorNodeViewProps {
  motion: MotionData;
  sensorState: MotionSensorState;
  soundData: AcousticData;
  acousticState: AcousticSensorState;
  activeDetectionMode: SensorDetectionMode;
  onSelectDetectionMode: (mode: SensorDetectionMode) => void;
  onTurnOnBothSensors?: () => void;
  wakeLockState?: WakeLockState;
  config?: SensorConfig;
  isArmed: boolean;
  isPaused: boolean;
  sustainedDuration?: number;
  triggerProgress?: number;
  isDarkMode?: boolean;
  isAdmin?: boolean;
  currentUser?: UserProfile | null;
  onToggleArm: () => void;
  onTogglePause?: () => void;
  onCalibrate?: () => Promise<number>;
  onSimulateTest?: (severity?: 'yellow' | 'red') => void;
  onSimulateSoundTest?: (severity?: 'yellow' | 'red') => void;
  onGoToReceiver?: () => void;
  onGoToAdmin?: () => void;
}

export const SensorNodeView: React.FC<SensorNodeViewProps> = ({
  motion,
  sensorState,
  soundData,
  acousticState,
  activeDetectionMode = 'bell',
  onSelectDetectionMode,
  onTurnOnBothSensors,
  isArmed,
  isPaused,
  sustainedDuration,
  triggerProgress,
  config,
  isDarkMode = false,
  onToggleArm,
  onCalibrate,
  onSimulateTest,
  onSimulateSoundTest,
}) => {
  const isSensorOn = isArmed;
  const isBoth = activeDetectionMode === 'both';
  const activeSensorType = activeDetectionMode === 'motion' ? 'vibration' : activeDetectionMode === 'sound' ? 'bell' : 'both';

  // Live calculation helpers
  const decibels = Math.round(soundData.decibels || (isSensorOn ? 46 : 0));
  const bellScore = Math.round(soundData.bellDetectionScore || (isSensorOn ? 92 : 0));
  const vibrationDelta = motion?.delta ? motion.delta.toFixed(2) : (isSensorOn ? '0.45' : '0.00');
  const totalGravity = motion?.totalMagnitude ? motion.totalMagnitude.toFixed(2) : (isSensorOn ? '9.81' : '0.00');

  return (
    <div className="space-y-4 pb-20 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Station Overview & Mode Controls */}
        <div className="space-y-4">
          {/* ================= 1. Top Station Card ================= */}
          <div className="bg-[#F3F3FA] rounded-[24px] p-4.5 border border-slate-100 space-y-3.5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#1F71E8] text-white flex items-center justify-center shadow-xs shrink-0 font-bold">
                  {activeSensorType === 'bell' ? (
                    <Bell className="w-6 h-6" />
                  ) : (
                    <Activity className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1C1B1F] leading-tight">
                    Flood Sensor Station
                  </h3>
                  <p className="text-xs text-[#49454F] font-medium mt-0.5">
                    Dzenje CDSS ADDA STEM CLUB Warning Node
                  </p>
                </div>
              </div>

              <span
                className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-2xs shrink-0 flex items-center gap-1.5 ${
                  isSensorOn
                    ? 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]'
                    : 'bg-[#E7E0EC] text-[#49454F]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSensorOn ? 'bg-[#137333] animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>{isSensorOn ? (isBoth ? 'Both Sensors Active' : 'Live (On)') : 'Sensor Off'}</span>
              </span>
            </div>

            <p className="text-xs text-[#49454F] font-medium leading-relaxed">
              Checks for vibration and bell sound in the system when flood is detected. Sends an automatic warning alert to the village.
            </p>
          </div>

          {/* ================= 2. Active Sensor Mode & Controls ================= */}
          <div className="bg-[#F3F3FA] rounded-[24px] p-4.5 border border-[#E7E0EC] space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#49454F] uppercase tracking-wider block">
                Select Sensor Detection Mode
              </span>
              <span className="text-[11px] font-bold text-[#1F71E8] bg-[#E0EFFF] px-2.5 py-0.5 rounded-full">
                {isBoth ? 'Both Sensors (Motion & Sound)' : activeSensorType === 'bell' ? 'Bell Sound Mode' : 'Vibration Sensor Mode'}
              </span>
            </div>

            {/* Material 3 Segmented Toggle */}
            <div className="bg-[#E7E0EC] p-1 rounded-full flex gap-1">
              <button
                type="button"
                onClick={() => onSelectDetectionMode('sound')}
                className={`flex-1 py-2 px-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                  activeDetectionMode === 'sound'
                    ? 'bg-[#1F71E8] text-white shadow-xs'
                    : 'text-[#49454F] hover:text-[#1C1B1F]'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Bell</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectDetectionMode('motion')}
                className={`flex-1 py-2 px-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                  activeDetectionMode === 'motion'
                    ? 'bg-[#1F71E8] text-white shadow-xs'
                    : 'text-[#49454F] hover:text-[#1C1B1F]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Vibration</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectDetectionMode('both' as any)}
                className={`flex-1 py-2 px-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                  activeDetectionMode === 'both'
                    ? 'bg-[#1F71E8] text-white shadow-xs'
                    : 'text-[#49454F] hover:text-[#1C1B1F]'
                }`}
              >
                <span>Both</span>
              </button>
            </div>

            {/* Dedicated "Turn On Both Sensors" Action Button */}
            <button
              type="button"
              id="btn-turn-on-both-sensors"
              onClick={() => {
                if (isBoth && isSensorOn) {
                  onToggleArm();
                } else if (onTurnOnBothSensors) {
                  onTurnOnBothSensors();
                } else {
                  onSelectDetectionMode('both');
                  if (!isSensorOn) onToggleArm();
                }
              }}
              className={`w-full py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer border ${
                isBoth && isSensorOn
                  ? 'bg-[#137333] hover:bg-[#0d5926] text-white border-[#137333] shadow-xs'
                  : 'bg-[#E6F4EA] hover:bg-[#CEEAD6] text-[#137333] border-[#CEEAD6]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-inherit" />
              <span>{isBoth && isSensorOn ? 'Both Sensors Active (Tap to Turn Off)' : 'Turn On Both Sensors (Dual System)'}</span>
            </button>

            {/* Power Toggle Button */}
            <button
              type="button"
              id="btn-power-toggle-sensor"
              onClick={onToggleArm}
              className={`w-full py-3.5 px-4 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer ${
                isSensorOn
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-[#1F71E8] hover:bg-blue-700 text-white'
              }`}
            >
              {isSensorOn ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Turn Off Sensor Station</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Turn On Sensor Station (Arm System)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Sensor Readouts Meter */}
        <div className="space-y-4">
          {activeDetectionMode === 'sound' && (
            <LiveAcousticMeter
              soundData={soundData}
              acousticState={acousticState}
              thresholdYellowDb={config?.thresholdYellowDb || 48}
              thresholdRedDb={config?.thresholdRedDb || 60}
              isArmed={isArmed}
              isPaused={isPaused}
              onSimulateSoundTest={onSimulateSoundTest}
            />
          )}

          {activeDetectionMode === 'motion' && (
            <LiveMotionMeter
              motion={motion}
              sensorState={sensorState}
              thresholdYellow={config?.thresholdYellow || 0.8}
              thresholdRed={config?.thresholdRed || 1.6}
              sustainedDuration={sustainedDuration}
              triggerProgress={triggerProgress}
              isArmed={isArmed}
              isPaused={isPaused}
              baselineGravity={config?.baselineGravity || 9.81}
              onSimulateTest={onSimulateTest}
              onCalibrate={onCalibrate}
            />
          )}

          {activeDetectionMode === 'both' && (
            <div className="space-y-4">
              <LiveAcousticMeter
                soundData={soundData}
                acousticState={acousticState}
                thresholdYellowDb={config?.thresholdYellowDb || 48}
                thresholdRedDb={config?.thresholdRedDb || 60}
                isArmed={isArmed}
                isPaused={isPaused}
                onSimulateSoundTest={onSimulateSoundTest}
              />
              <LiveMotionMeter
                motion={motion}
                sensorState={sensorState}
                thresholdYellow={config?.thresholdYellow || 0.8}
                thresholdRed={config?.thresholdRed || 1.6}
                sustainedDuration={sustainedDuration}
                triggerProgress={triggerProgress}
                isArmed={isArmed}
                isPaused={isPaused}
                baselineGravity={config?.baselineGravity || 9.81}
                onSimulateTest={onSimulateTest}
                onCalibrate={onCalibrate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
