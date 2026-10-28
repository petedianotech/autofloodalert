import React, { useState } from 'react';
import { MotionData, MotionSensorState } from '../types';
import { Activity, AlertTriangle, AlertOctagon, RotateCcw, CheckCircle2 } from 'lucide-react';

interface LiveMotionMeterProps {
  motion: MotionData;
  sensorState?: MotionSensorState;
  thresholdYellow?: number;
  thresholdRed?: number;
  threshold?: number;
  continuousDuration?: number;
  sustainedDuration?: number;
  triggerProgress?: number;
  isArmed: boolean;
  isPaused: boolean;
  baselineGravity: number;
  isCompact?: boolean;
  onCalibrate?: () => Promise<number>;
}

export const LiveMotionMeter: React.FC<LiveMotionMeterProps> = ({
  motion,
  sensorState,
  thresholdYellow = 0.8,
  thresholdRed = 1.6,
  threshold = 1.6,
  isArmed,
  isPaused,
  baselineGravity,
  isCompact = false,
  onCalibrate,
}) => {
  const redLimit = thresholdRed || threshold || 1.6;
  const yellowLimit = thresholdYellow || redLimit * 0.5;

  const [isCalibrating, setIsCalibrating] = useState(false);

  const delta = motion?.delta || 0;
  const isRed = delta >= redLimit && isArmed && !isPaused;
  const isYellow = delta >= yellowLimit && !isRed && isArmed && !isPaused;
  const isLatched = sensorState?.sessionAlertFired && isArmed;

  // Gauge bar calculations (0.0 to 3.0 m/s²)
  const maxDisplayDelta = Math.max(3.0, redLimit * 1.8);
  const gaugePercent = isArmed && !isPaused ? Math.min(100, Math.max(0, (delta / maxDisplayDelta) * 100)) : 0;
  const yellowMarkerPercent = (yellowLimit / maxDisplayDelta) * 100;
  const redMarkerPercent = (redLimit / maxDisplayDelta) * 100;

  const handleCalibrateClick = async () => {
    if (!onCalibrate || isCalibrating) return;
    setIsCalibrating(true);
    try {
      await onCalibrate();
    } finally {
      setIsCalibrating(false);
    }
  };

  return (
    <div
      id="live-motion-meter"
      className={`bg-white rounded-[20px] border border-[#E7E0EC] shadow-xs select-none transition-all flex flex-col justify-between ${
        isCompact ? 'p-3 space-y-2' : 'p-4 sm:p-5 space-y-3.5'
      }`}
    >
      {/* 1. Header Row */}
      <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-[#E7E0EC]">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`rounded-xl flex items-center justify-center shrink-0 font-bold transition-colors ${
              isCompact ? 'w-8 h-8' : 'w-9 h-9'
            } ${
              isRed
                ? 'bg-[#FCE8E6] text-[#BA1A1A]'
                : isYellow
                ? 'bg-[#FEF7E0] text-[#934D00]'
                : isLatched
                ? 'bg-[#FEF7E0] text-[#934D00]'
                : isArmed
                ? 'bg-[#E0EFFF] text-[#1F71E8]'
                : 'bg-[#E7E0EC] text-[#49454F]'
            }`}
          >
            {isRed ? (
              <AlertOctagon className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
            ) : isYellow ? (
              <AlertTriangle className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
            ) : (
              <Activity className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
            )}
          </div>
          <div className="min-w-0">
            <h3 className={`font-bold text-[#1C1B1F] leading-tight truncate ${isCompact ? 'text-xs' : 'text-sm sm:text-base'}`}>
              Vibration Sensor
            </h3>
            {!isCompact && (
              <p className="text-[11px] text-[#49454F] font-medium mt-0.5 truncate">
                Warning: {yellowLimit.toFixed(1)} &bull; Alarm: {redLimit.toFixed(1)} m/s²
              </p>
            )}
          </div>
        </div>

        {/* Status Pill */}
        {isRed ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FCE8E6] border border-[#FAD2CF] text-[#BA1A1A] font-bold text-[10px] shrink-0">
            Alarm
          </span>
        ) : isYellow ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF7E0] border border-[#FEEFC3] text-[#934D00] font-bold text-[10px] shrink-0">
            Warning
          </span>
        ) : isLatched ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF7E0] border border-[#FEEFC3] text-[#934D00] font-bold text-[10px] shrink-0">
            Latched
          </span>
        ) : isArmed && !isPaused ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] font-bold text-[10px] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#137333] animate-ping" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E7E0EC] text-[#49454F] font-bold text-[10px] shrink-0">
            Off
          </span>
        )}
      </div>

      {/* 2. Compact Vibration Delta Display */}
      <div className={`bg-[#F8FAFC] border border-[#E7E0EC] rounded-[16px] text-center ${isCompact ? 'p-2.5 space-y-1.5' : 'p-3.5 sm:p-4 space-y-2.5'}`}>
        <span className="text-[10px] font-bold text-[#49454F] uppercase tracking-wider block">
          Vibration Delta
        </span>

        <div className="flex items-baseline justify-center gap-1">
          <span
            id="motion-delta-value"
            className={`font-mono font-bold tracking-tight transition-colors ${
              isCompact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
            } ${
              !isArmed || isPaused
                ? 'text-slate-400'
                : isRed
                ? 'text-[#BA1A1A]'
                : isYellow
                ? 'text-[#934D00]'
                : 'text-[#1F71E8]'
            }`}
          >
            {isArmed && !isPaused ? delta.toFixed(2) : '0.00'}
          </span>
          <span className="text-xs font-bold text-[#49454F]">m/s²</span>
        </div>

        {/* Compact Level Bar */}
        <div className="space-y-1">
          <div className="w-full h-2 bg-[#E7E0EC] rounded-full overflow-hidden relative">
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#934D00] z-10"
              style={{ left: `${yellowMarkerPercent}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#BA1A1A] z-10"
              style={{ left: `${redMarkerPercent}%` }}
            />
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                isRed
                  ? 'bg-[#BA1A1A]'
                  : isYellow
                  ? 'bg-[#934D00]'
                  : 'bg-[#1F71E8]'
              }`}
              style={{ width: `${gaugePercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] font-bold text-[#49454F]">
            <span>0.0</span>
            <span className="text-[#934D00]">{yellowLimit.toFixed(1)} W</span>
            <span className="text-[#BA1A1A]">{redLimit.toFixed(1)} A</span>
          </div>
        </div>

        {/* Status text */}
        <div
          className={`py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors truncate ${
            isLatched
              ? 'bg-[#FEF7E0] text-[#934D00]'
              : isRed
              ? 'bg-[#FCE8E6] text-[#BA1A1A]'
              : isYellow
              ? 'bg-[#FEF7E0] text-[#934D00]'
              : isArmed && !isPaused
              ? 'bg-[#E6F4EA] text-[#137333]'
              : 'bg-slate-100 text-[#49454F]'
          }`}
        >
          {isLatched
            ? 'Alert sent & latched'
            : isRed
            ? 'Alarm: Flood Vibration!'
            : isYellow
            ? 'Warning: High Vibration'
            : isArmed && !isPaused
            ? 'Monitoring River Tremor'
            : 'Sensor Off'}
        </div>
      </div>

      {/* 3. Calibrate Zero action (Compact) */}
      {onCalibrate && isArmed && (
        <button
          type="button"
          id="btn-calibrate-motion"
          onClick={handleCalibrateClick}
          disabled={isCalibrating}
          className="w-full py-1.5 px-2 rounded-full bg-[#E0EFFF] hover:bg-[#D2E7FC] border border-[#C2E7FF] text-[11px] font-bold text-[#1F71E8] flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs"
          title="Calibrate still rest position"
        >
          <RotateCcw className={`w-3 h-3 ${isCalibrating ? 'animate-spin' : ''}`} />
          <span>{isCalibrating ? 'Calibrating...' : `Calibrate Zero (${baselineGravity.toFixed(1)})`}</span>
        </button>
      )}
    </div>
  );
};
