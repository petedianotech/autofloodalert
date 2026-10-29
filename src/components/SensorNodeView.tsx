import React from 'react';
import {
  Activity,
  Bell,
  Square,
  CheckCircle2,
} from 'lucide-react';
import {
  MotionData,
  MotionSensorState,
  AcousticData,
  AcousticSensorState,
  SensorDetectionMode,
  normalizeDetectionMode,
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
  activeDetectionMode: rawMode = 'sound',
  onSelectDetectionMode,
  isArmed,
  isPaused,
  sustainedDuration,
  triggerProgress,
  config,
  onToggleArm,
  onCalibrate,
}) => {
  const isSensorOn = isArmed;
  const currentMode = normalizeDetectionMode(rawMode);
  const isSound = currentMode === 'sound';
  const isMotion = currentMode === 'motion';
  const isBoth = currentMode === 'both';

  return (
    <div className="space-y-4 pb-20 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Station Overview & Mode Controls */}
        <div className="space-y-4">
          {/* ================= 1. Top Station Card ================= */}
          <div className="bg-slate-50 rounded-[24px] p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
            {/* Header with clean responsive layout: title never gets squeezed vertically */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-[#1F71E8] text-white flex items-center justify-center shadow-xs shrink-0 font-bold">
                  {isSound ? (
                    <Bell className="w-6 h-6" />
                  ) : isMotion ? (
                    <Activity className="w-6 h-6" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base text-slate-900 leading-tight">
                    Flood Sensor Station
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 truncate leading-normal">
                    Dzenje CDSS ADDA STEM CLUB Warning Node
                  </p>
                </div>
              </div>

              {/* Status Badge: clean pill that stays on its own neat line on mobile */}
              <div className="flex items-center self-start sm:self-auto shrink-0">
                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-2xs flex items-center gap-1.5 border ${
                    isSensorOn
                      ? 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSensorOn ? 'bg-[#137333] animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>
                    {isSensorOn
                      ? isBoth
                        ? 'Both Sensors Active'
                        : isSound
                        ? 'Bell Sensor Active'
                        : 'Vibration Sensor Active'
                      : 'All Sensors Off'}
                  </span>
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1 border-t border-slate-200/60">
              Checks for vibration and bell sound in the system when flood is detected. Sends an automatic warning alert to the village.
            </p>
          </div>

          {/* ================= 2. Active Sensor Mode & Controls ================= */}
          <div className="bg-slate-50 rounded-[24px] p-4.5 border border-slate-200 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Select Sensor Detection Mode
              </span>
              <span className="text-[11px] font-bold text-[#1F71E8] bg-[#E0EFFF] border border-[#C2E7FF] px-2.5 py-0.5 rounded-full">
                {isBoth
                  ? 'Both Sensors Mode'
                  : isSound
                  ? 'Bell Sensor Only'
                  : 'Vibration Sensor Only'}
              </span>
            </div>

            {/* Segmented Toggle */}
            <div className="bg-slate-200/70 border border-slate-200 p-1 rounded-full flex gap-1">
              <button
                type="button"
                onClick={() => onSelectDetectionMode('sound')}
                className={`flex-1 py-2 px-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  isSound
                    ? 'bg-[#1F71E8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Bell</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectDetectionMode('motion')}
                className={`flex-1 py-2 px-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  isMotion
                    ? 'bg-[#1F71E8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Vibration</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectDetectionMode('both')}
                className={`flex-1 py-2 px-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  isBoth
                    ? 'bg-[#1F71E8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Both</span>
              </button>
            </div>

            {/* Power Toggle Button with Clear, Dynamic Mode-Aware Label */}
            <button
              type="button"
              id="btn-power-toggle-sensor"
              onClick={onToggleArm}
              className={`w-full py-3.5 px-4 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer ${
                isSensorOn
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : isBoth
                  ? 'bg-[#137333] hover:bg-emerald-700 text-white'
                  : 'bg-[#1F71E8] hover:bg-blue-700 text-white'
              }`}
            >
              {isSensorOn ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>
                    {isBoth
                      ? 'Turn Off Both Sensors'
                      : isSound
                      ? 'Turn Off Bell Sensor'
                      : 'Turn Off Vibration Sensor'}
                  </span>
                </>
              ) : (
                <>
                  {isBoth ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isSound ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                  <span>
                    {isBoth
                      ? 'Turn On Both Sensors (Dual System)'
                      : isSound
                      ? 'Turn On Bell Sensor'
                      : 'Turn On Vibration Sensor'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Sensor Readouts Meters */}
        <div className="w-full space-y-3">
          {/* 1. Bell Sensor ONLY */}
          {isSound && (
            <LiveAcousticMeter
              soundData={soundData}
              acousticState={acousticState}
              thresholdYellowDb={config?.thresholdYellowDb || 68}
              thresholdRedDb={config?.thresholdRedDb || 82}
              isArmed={isArmed}
              isPaused={isPaused}
              isCompact={false}
            />
          )}

          {/* 2. Vibration Sensor ONLY */}
          {isMotion && (
            <LiveMotionMeter
              motion={motion}
              sensorState={sensorState}
              thresholdYellow={config?.thresholdYellow || 1.5}
              thresholdRed={config?.thresholdRed || 2.5}
              sustainedDuration={sustainedDuration}
              triggerProgress={triggerProgress}
              isArmed={isArmed}
              isPaused={isPaused}
              baselineGravity={config?.baselineGravity || 9.81}
              onCalibrate={onCalibrate}
              isCompact={false}
            />
          )}

          {/* 3. BOTH Sensors */}
          {isBoth && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <LiveAcousticMeter
                soundData={soundData}
                acousticState={acousticState}
                thresholdYellowDb={config?.thresholdYellowDb || 68}
                thresholdRedDb={config?.thresholdRedDb || 82}
                isArmed={isArmed}
                isPaused={isPaused}
                isCompact={true}
              />
              <LiveMotionMeter
                motion={motion}
                sensorState={sensorState}
                thresholdYellow={config?.thresholdYellow || 1.5}
                thresholdRed={config?.thresholdRed || 2.5}
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
