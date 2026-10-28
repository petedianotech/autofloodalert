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
  const isBellOnly = activeDetectionMode === 'sound';
  const isMotionOnly = activeDetectionMode === 'motion';
  const activeSensorType = isMotionOnly ? 'vibration' : isBellOnly ? 'bell' : 'both';

  // Real values only — never fake live numbers for the inactive sensor
  const decibels = Math.round(soundData?.decibels ?? 0);
  const bellScore = Math.round(soundData?.bellDetectionScore ?? 0);
  const vibrationDelta = motion?.delta != null ? motion.delta.toFixed(2) : '0.00';
  const totalGravity = motion?.totalMagnitude != null ? motion.totalMagnitude.toFixed(2) : '0.00';

  return (
    <div className="space-y-4 pb-20 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-[24px] p-4.5 border border-slate-200 space-y-3.5 shadow-xs">
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
                  <h3 className="font-bold text-base text-slate-900 leading-tight">Flood Sensor Station</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Dzenje CDSS ADDA STEM CLUB Warning Node</p>
                </div>
              </div>
              <span
                className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-2xs shrink-0 flex items-center gap-1.5 border ${
                  isSensorOn
                    ? 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSensorOn ? 'bg-[#137333] animate-pulse' : 'bg-slate-400'}`} />
                <span>
                  {!isSensorOn
                    ? 'Sensor Off'
                    : isBoth
                      ? 'Both Sensors Active'
                      : isBellOnly
                        ? 'Bell Sensor Live'
                        : 'Vibration Sensor Live'}
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Select <strong>Bell</strong>, <strong>Vibration</strong>, or <strong>Both</strong>, then turn on.
              Only the selected sensor runs — the other stays off. Continuous motor-driven bicycle bell is detected by sustained metallic strikes.
            </p>
          </div>

          <div className="bg-slate-50 rounded-[24px] p-4.5 border border-slate-200 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Select Sensor Detection Mode</span>
              <span className="text-[11px] font-bold text-[#1F71E8] bg-[#E0EFFF] border border-[#C2E7FF] px-2.5 py-0.5 rounded-full">
                {isBoth ? 'Both Sensors (Motion & Sound)' : activeSensorType === 'bell' ? 'Bell Sound Mode' : 'Vibration Sensor Mode'}
              </span>
            </div>

            <div className="bg-slate-200/70 border border-slate-200 p-1 rounded-full flex gap-1">
              <button
                type="button"
                onClick={() => onSelectDetectionMode('sound')}
                className={`flex-1 py-2 px-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                  activeDetectionMode === 'sound' ? 'bg-[#1F71E8] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Bell</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectDetectionMode('motion')}
                className={`flex-1 py-2 px-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                  activeDetectionMode === 'motion' ? 'bg-[#1F71E8] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Vibration</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectDetectionMode('both' as any)}
                className={`flex-1 py-2 px-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                  activeDetectionMode === 'both' ? 'bg-[#1F71E8] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Both</span>
              </button>
            </div>

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

            <button
              type="button"
              id="btn-power-toggle-sensor"
              onClick={onToggleArm}
              className={`w-full py-3.5 px-4 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer ${
                isSensorOn ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-[#1F71E8] hover:bg-blue-700 text-white'
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

        <div className="w-full space-y-3">
          {/* Only the selected mode shows a live meter — other sensor stays fully off */}
          {activeDetectionMode === 'sound' ? (
            <LiveAcousticMeter
              soundData={soundData}
              acousticState={acousticState}
              thresholdYellowDb={config?.thresholdYellowDb ?? 68}
              thresholdRedDb={config?.thresholdRedDb ?? 82}
              isArmed={isArmed}
              isPaused={isPaused}
            />
          ) : activeDetectionMode === 'motion' ? (
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
              onCalibrate={onCalibrate}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2 w-full">
              <LiveAcousticMeter
                soundData={soundData}
                acousticState={acousticState}
                thresholdYellowDb={config?.thresholdYellowDb ?? 68}
                thresholdRedDb={config?.thresholdRedDb ?? 82}
                isArmed={isArmed}
                isPaused={isPaused}
                isCompact={true}
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
                isCompact={true}
                onCalibrate={onCalibrate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
