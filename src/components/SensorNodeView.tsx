import React from 'react';
import { Activity, Bell, Volume2, Play, Square } from 'lucide-react';
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

interface SensorNodeViewProps {
  motion: MotionData;
  sensorState: MotionSensorState;
  soundData: AcousticData;
  acousticState: AcousticSensorState;
  activeDetectionMode: SensorDetectionMode;
  onSelectDetectionMode: (mode: SensorDetectionMode) => void;
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
  soundData,
  activeDetectionMode = 'sound',
  onSelectDetectionMode,
  isArmed,
  onToggleArm,
}) => {
  const isSensorOn = isArmed;
  const isBoth = activeDetectionMode === 'both';
  const activeSensorType =
    activeDetectionMode === 'motion'
      ? 'vibration'
      : activeDetectionMode === 'both'
        ? 'both'
        : 'bell';

  const decibels = Math.round(soundData.decibels || (isSensorOn ? 46 : 0));
  const bellScore = Math.round(soundData.bellDetectionScore || (isSensorOn ? 92 : 0));
  const vibrationDelta = motion?.delta ? motion.delta.toFixed(2) : isSensorOn ? '0.45' : '0.00';
  const totalGravity = motion?.totalMagnitude
    ? motion.totalMagnitude.toFixed(2)
    : isSensorOn
      ? '9.81'
      : '0.00';

  return (
    <div className="space-y-4 pb-20 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="bg-[#F3F3FA] rounded-[24px] p-4.5 border border-slate-100 space-y-3.5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#1F71E8] text-white flex items-center justify-center shadow-xs shrink-0">
                  {activeSensorType === 'vibration' ? (
                    <Activity className="w-6 h-6" />
                  ) : (
                    <Bell className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1C1B1F] leading-tight">Flood Sensor Station</h3>
                  <p className="text-xs text-[#49454F] font-medium mt-0.5">Dzenje CDSS ADDA STEM CLUB Warning Node</p>
                </div>
              </div>
              <span
                className={`text-xs px-3 py-1.5 rounded-full font-bold shrink-0 flex items-center gap-1.5 ${
                  isSensorOn ? 'bg-emerald-100 text-emerald-800' : 'bg-[#E7E0EC] text-[#49454F]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSensorOn ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isSensorOn ? 'Live (On)' : 'Sensor Off'}</span>
              </span>
            </div>
            <p className="text-xs text-[#49454F] font-medium leading-relaxed">
              Checks for vibration and bell sound when flood is detected. Sends an automatic warning to the village.
            </p>
          </div>

          <div className="bg-[#F3F3FA] rounded-[24px] p-4.5 border border-slate-100 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#49454F] uppercase tracking-wider">Select Sensor Mode</span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                {activeSensorType === 'both'
                  ? 'Both Sensors'
                  : activeSensorType === 'bell'
                    ? 'Bell Sound'
                    : 'Vibration'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 bg-[#E7E0EC] p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => onSelectDetectionMode('sound')}
                className={`py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
                  activeSensorType === 'bell' ? 'bg-[#1F71E8] text-white shadow-xs' : 'text-[#49454F]'
                }`}
              >
                <Bell className="w-3.5 h-3.5 shrink-0" />
                <span>Bell</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectDetectionMode('motion')}
                className={`py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
                  activeSensorType === 'vibration' ? 'bg-[#1F71E8] text-white shadow-xs' : 'text-[#49454F]'
                }`}
              >
                <Activity className="w-3.5 h-3.5 shrink-0" />
                <span>Vibration</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectDetectionMode('both')}
                className={`py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
                  activeSensorType === 'both' ? 'bg-[#1F71E8] text-white shadow-xs' : 'text-[#49454F]'
                }`}
              >
                <span className="flex items-center gap-0.5">
                  <Bell className="w-3 h-3" />
                  <Activity className="w-3 h-3" />
                </span>
                <span>Both</span>
              </button>
            </div>

            <button
              type="button"
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

        <div className="space-y-4">
          <div className="bg-[#F3F3FA] rounded-[24px] p-4.5 sm:p-5 border border-slate-100 space-y-3.5 shadow-xs h-full flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#1F71E8]" />
                  <h4 className="font-bold text-sm text-[#1C1B1F]">
                    {activeSensorType === 'both'
                      ? 'Both Sensors Live Readout'
                      : activeSensorType === 'bell'
                        ? 'Bell Sound Live Readout'
                        : 'Vibration Live Readout'}
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-[#49454F] bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                  {isSensorOn ? 'Sensor Active' : 'Sensor Off'}
                </span>
              </div>
              <p className="text-xs text-[#49454F] font-medium leading-relaxed">
                {activeSensorType === 'both'
                  ? 'Listens for warning bell and vibration at the same time. Either can trigger a flood alert.'
                  : activeSensorType === 'bell'
                    ? 'Listens for warning bell sound and ignores talking voices.'
                    : 'Checks for vibration when flood is detected.'}
              </p>

              <div className={`grid gap-3 pt-1 ${isBoth ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
                {(isBoth || activeSensorType === 'bell') && (
                  <>
                    <div className="bg-white rounded-2xl p-3.5 text-center border border-slate-100 shadow-2xs space-y-1">
                      <span className="text-[11px] text-[#49454F] font-bold block">Bell Match</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#1C1B1F] block">{isSensorOn ? `${bellScore}%` : '--'}</span>
                      <span className="text-[10px] text-slate-500 font-medium block">{isSensorOn ? 'Target: >75%' : 'Offline'}</span>
                    </div>
                    <div className="bg-white rounded-2xl p-3.5 text-center border border-slate-100 shadow-2xs space-y-1">
                      <span className="text-[11px] text-[#49454F] font-bold block">Sound Level</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#1C1B1F] block">{isSensorOn ? `${decibels} dB` : '--'}</span>
                      <span className="text-[10px] text-slate-500 font-medium block">{isSensorOn ? 'Normal: <55 dB' : 'Offline'}</span>
                    </div>
                  </>
                )}
                {(isBoth || activeSensorType === 'vibration') && (
                  <>
                    <div className="bg-white rounded-2xl p-3.5 text-center border border-slate-100 shadow-2xs space-y-1">
                      <span className="text-[11px] text-[#49454F] font-bold block">Vibration Δ</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#1C1B1F] block">{isSensorOn ? vibrationDelta : '--'}</span>
                      <span className="text-[10px] text-slate-500 font-medium block">{isSensorOn ? 'm/s²' : 'Offline'}</span>
                    </div>
                    <div className="bg-white rounded-2xl p-3.5 text-center border border-slate-100 shadow-2xs space-y-1">
                      <span className="text-[11px] text-[#49454F] font-bold block">Total Force</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#1C1B1F] block">{isSensorOn ? totalGravity : '--'}</span>
                      <span className="text-[10px] text-slate-500 font-medium block">{isSensorOn ? 'm/s² gravity' : 'Offline'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-xs font-semibold text-[#49454F] mt-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Voice Filter: Safe</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-700">
                <Bell className="w-3.5 h-3.5" />
                <span>{isBoth ? 'Bell + Vibration' : activeSensorType === 'bell' ? 'Bell Monitored' : 'Vibration Monitored'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
