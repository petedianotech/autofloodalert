import React from 'react';
import {
  Activity,
  Bell,
  Volume2,
  Play,
  Square,
  Pause,
  Settings2,
  Gauge,
  Waves,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { MotionData, AcousticData, AcousticSensorState, MotionSensorState, SensorConfig, SensorDetectionMode, WakeLockState } from '../types';
import { LiveMotionMeter } from './LiveMotionMeter';
import { LiveAcousticMeter } from './LiveAcousticMeter';
import { BatteryOptimizationCard } from './BatteryOptimizationCard';
import { NotificationEnableCard } from './NotificationEnableCard';
import { useTranslation } from '../services/i18n';

interface SensorNodeViewProps {
  config: SensorConfig;
  onConfigChange: (cfg: Partial<SensorConfig>) => void;
  motion: MotionData;
  sustainedDuration: number;
  triggerProgress: number;
  sensorState: MotionSensorState;
  soundData: AcousticData;
  acousticState: AcousticSensorState;
  isArmed: boolean;
  isPaused: boolean;
  activeDetectionMode: SensorDetectionMode;
  onSetDetectionMode: (mode: SensorDetectionMode) => void;
  onArm: () => void;
  onDisarm: () => void;
  onPause: () => void;
  onResume: () => void;
  onCalibrate: () => void;
  wakeLockState: WakeLockState;
  onToggleWakeLock: () => void;
  isAdmin?: boolean;
}

export const SensorNodeView: React.FC<SensorNodeViewProps> = ({
  config,
  onConfigChange,
  motion,
  sustainedDuration,
  triggerProgress,
  sensorState,
  soundData,
  acousticState,
  isArmed,
  isPaused,
  activeDetectionMode,
  onSetDetectionMode,
  onArm,
  onDisarm,
  onPause,
  onResume,
  onCalibrate,
  wakeLockState,
  onToggleWakeLock,
  isAdmin = false,
}) => {
  const { t } = useTranslation();

  const isBoth = activeDetectionMode === 'both';
  const isMotion = activeDetectionMode === 'motion' || isBoth;
  const isAcoustic = activeDetectionMode === 'acoustic' || isBoth;

  return (
    <div className="space-y-4 pb-24 select-none">
      <NotificationEnableCard isDarkMode={false} />
      <BatteryOptimizationCard />

      {/* Detection mode selector: Bell | Vibration | Both */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Settings2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Detection Mode</h3>
            <p className="text-[11px] text-slate-500 font-medium">Choose sensors to arm</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: 'acoustic' as const, label: 'Bell', icon: Bell },
              { id: 'motion' as const, label: 'Vibration', icon: Activity },
              { id: 'both' as const, label: 'Both', icon: Zap },
            ] as const
          ).map(({ id, label, icon: Icon }) => {
            const selected = activeDetectionMode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSetDetectionMode(id)}
                className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer min-h-[64px] border ${
                  selected
                    ? 'bg-[#1F71E8] text-white border-[#1F71E8] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-[#1F71E8]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Arm / Disarm controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isArmed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isArmed ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {isArmed ? 'Sensors Armed' : 'Sensors Disarmed'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {isArmed
                  ? isBoth
                    ? 'Bell + Vibration listening'
                    : activeDetectionMode === 'motion'
                    ? 'Vibration listening'
                    : 'Bell listening'
                  : 'Tap Arm to start monitoring'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isArmed && (
              <button
                type="button"
                onClick={isPaused ? onResume : onPause}
                className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center cursor-pointer"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={isArmed ? onDisarm : onArm}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer min-h-[40px] ${
                isArmed
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isArmed ? (
                <>
                  <Square className="w-3.5 h-3.5" />
                  Disarm
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Arm
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live metrics — show 4 when Both is selected */}
      {isBoth ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700">Vibration Δ</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tabular-nums">
              {motion.delta?.toFixed(2) ?? '0.00'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">m/s² above gravity</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700">Sustained</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tabular-nums">
              {sustainedDuration.toFixed(1)}s
            </p>
            <p className="text-[10px] text-slate-500 font-medium">continuous movement</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-700">Sound Level</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tabular-nums">
              {soundData.db?.toFixed(0) ?? '0'} dB
            </p>
            <p className="text-[10px] text-slate-500 font-medium">current dB SPL</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-700">Resonance</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tabular-nums">
              {soundData.resonance?.toFixed(0) ?? '0'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">bell frequency match</p>
          </div>
        </div>
      ) : isMotion ? (
        <LiveMotionMeter
          motion={motion}
          sustainedDuration={sustainedDuration}
          triggerProgress={triggerProgress}
          sensorState={sensorState}
          config={config}
        />
      ) : (
        <LiveAcousticMeter soundData={soundData} acousticState={acousticState} config={config} />
      )}

      {/* Thresholds quick view */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
        <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Thresholds</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {isMotion && (
            <>
              <div className="flex justify-between p-2 rounded-lg bg-amber-50 border border-amber-100">
                <span className="font-medium text-amber-800">Yellow Δ</span>
                <span className="font-bold text-amber-900">{config.thresholdYellow ?? 1.5} m/s²</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-red-50 border border-red-100">
                <span className="font-medium text-red-800">Red Δ</span>
                <span className="font-bold text-red-900">{config.thresholdRed ?? 2.5} m/s²</span>
              </div>
            </>
          )}
          {isAcoustic && (
            <>
              <div className="flex justify-between p-2 rounded-lg bg-amber-50 border border-amber-100">
                <span className="font-medium text-amber-800">Yellow dB</span>
                <span className="font-bold text-amber-900">{config.thresholdYellowDb ?? 68} dB</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-red-50 border border-red-100">
                <span className="font-medium text-red-800">Red dB</span>
                <span className="font-bold text-red-900">{config.thresholdRedDb ?? 82} dB</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Wake lock */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Keep Screen Awake</h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {wakeLockState.isActive ? 'Screen will stay on while armed' : 'Screen may sleep'}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleWakeLock}
          className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
            wakeLockState.isActive
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {wakeLockState.isActive ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  );
};
