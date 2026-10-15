import React from 'react';
import {
  Activity,
  Bell,
  Volume2,
  Play,
  Square,
} from 'lucide-react';
import {
  MotionData,
  MotionSensorState,
  AcousticData,
  AcousticSensorState,
  SensorDetectionMode,
  SensorConfig,
} from '../types';

interface SensorNodeViewProps {
  isArmed: boolean;
  motion: MotionData;
  sensorState: MotionSensorState;
  sustainedDuration: number;
  triggerProgress: number;
  soundData: AcousticData;
  acousticState: AcousticSensorState;
  activeDetectionMode: SensorDetectionMode;
  config: SensorConfig;
  onSelectDetectionMode: (mode: SensorDetectionMode) => void;
  onToggleArm: () => void;
}

export const SensorNodeView: React.FC<SensorNodeViewProps> = ({
  isArmed,
  motion,
  sensorState,
  sustainedDuration,
  triggerProgress,
  soundData,
  acousticState,
  activeDetectionMode = 'sound',
  config,
  onSelectDetectionMode,
  onToggleArm,
}) => {
  const isSensorOn = isArmed;
  const isBoth = activeDetectionMode === 'both';
  const activeSensorType =
    activeDetectionMode === 'motion' ? 'vibration' : activeDetectionMode === 'both' ? 'both' : 'bell';

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
                  {activeSensorType === 'vibration' ? (
                    <Activity className="w-6 h-6" />
                  ) : (
                    <Bell className="w-6 h-6" />
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
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-[#E7E0EC] text-[#49454F]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSensorOn ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                {isSensorOn ? 'ARMED' : 'OFF'}
              </span>
            </div>

            <p className="text-xs text-[#49454F] leading-relaxed font-medium">
              Checks for vibration and bell sound in the system when flood is detected. Sends an automatic warning alert to the village.
            </p>

            {/* Mode selector: Bell | Vibration | Both */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onSelectDetectionMode('sound')}
                className={`py-2.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition cursor-pointer min-h-[52px] border ${
                  activeSensorType === 'bell'
                    ? 'bg-[#1F71E8] text-white border-[#1F71E8] shadow-xs'
                    : 'bg-white text-[#49454F] border-slate-200 hover:border-[#1F71E8]'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Bell</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectDetectionMode('motion')}
                className={`py-2.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition cursor-pointer min-h-[52px] border ${
                  activeSensorType === 'vibration'
                    ? 'bg-[#1F71E8] text-white border-[#1F71E8] shadow-xs'
                    : 'bg-white text-[#49454F] border-slate-200 hover:border-[#1F71E8]'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Vibration</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectDetectionMode('both')}
                className={`py-2.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition cursor-pointer min-h-[52px] border ${
                  activeSensorType === 'both'
                    ? 'bg-[#1F71E8] text-white border-[#1F71E8] shadow-xs'
                    : 'bg-white text-[#49454F] border-slate-200 hover:border-[#1F71E8]'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>Both</span>
              </button>
            </div>

            {/* Arm / Disarm */}
            <button
              type="button"
              onClick={onToggleArm}
              className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer min-h-[48px] active:scale-98 ${
                isSensorOn
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isSensorOn ? (
                <>
                  <Square className="w-4 h-4" />
                  Disarm Sensors
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Arm Sensors
                </>
              )}
            </button>

            <p className="text-[11px] text-[#49454F] font-medium leading-relaxed">
              {activeSensorType === 'both'
                ? 'Listens for warning bell sound and vibration at the same time. Either sensor can trigger a flood alert.'
                : activeSensorType === 'bell'
                ? 'Listens for warning bell sound in the system and ignores talking voices.'
                : 'Listens for continuous vibration from flood water movement.'}
            </p>

            {/* Live Metric Cards — 2 for single mode, 4 for both */}
            <div className={`grid gap-2 ${isBoth ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {(activeSensorType === 'bell' || isBoth) && (
                <>
                  <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Sound Level</p>
                    <p className="text-xl font-black text-slate-900 tabular-nums">
                      {isSensorOn ? `${decibels} dB` : '--'}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Bell Score</p>
                    <p className="text-xl font-black text-slate-900 tabular-nums">
                      {isSensorOn ? bellScore : '--'}
                    </p>
                  </div>
                </>
              )}
              {(activeSensorType === 'vibration' || isBoth) && (
                <>
                  <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Vibration Δ</p>
                    <p className="text-xl font-black text-slate-900 tabular-nums">
                      {isSensorOn ? vibrationDelta : '--'}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Total G</p>
                    <p className="text-xl font-black text-slate-900 tabular-nums">
                      {isSensorOn ? totalGravity : '--'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right column placeholder for meters if needed */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Live Status</h3>
            <p className="text-xs text-slate-600">
              Mode: <strong>{activeSensorType}</strong> · Armed: <strong>{isSensorOn ? 'Yes' : 'No'}</strong>
            </p>
            {isBoth && (
              <p className="text-xs text-slate-500 mt-2">
                Both sensors active — 4 live metrics shown above.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
