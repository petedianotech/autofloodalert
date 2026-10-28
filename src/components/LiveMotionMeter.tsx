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
  isDarkMode?: boolean;
  onSimulateTest?: (severity?: 'yellow' | 'red') => void;
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
  onSimulateTest,
  onCalibrate,
}) => {
  const redLimit = thresholdRed || threshold || 1.6;
  const yellowLimit = thresholdYellow || redLimit * 0.5;

  const [isCalibrating, setIsCalibrating] = useState(false);

  const delta = motion?.delta || 0;
  const isRed = delta >= redLimit && isArmed && !isPaused;
  const isYellow = delta >= yellowLimit && !isRed && isArmed && !isPaused;
  const isLatched = sensorState?.sessionAlertFired && isArmed;

  // Gauge bar calculations (0.0 to 3.2 m/s²)
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
      className="bg-white rounded-[24px] border border-[#E7E0EC] p-5 shadow-xs space-y-4 select-none"
    >
      {/* 1. Card Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E7E0EC]">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold transition-colors ${
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
              <AlertOctagon className="w-6 h-6" />
            ) : isYellow ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <Activity className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1C1B1F] leading-tight">
              Vibration Sensor
            </h3>
            <p className="text-xs text-[#49454F] font-medium mt-0.5">
              Warning: {yellowLimit.toFixed(1)} m/s² &bull; Alarm: {redLimit.toFixed(1)} m/s²
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {isRed ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE8E6] border border-[#FAD2CF] text-[#BA1A1A] font-bold text-xs">
            <AlertOctagon className="w-3.5 h-3.5" />
            Alarm Active
          </span>
        ) : isYellow ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF7E0] border border-[#FEEFC3] text-[#934D00] font-bold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            Warning Active
          </span>
        ) : isLatched ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF7E0] border border-[#FEEFC3] text-[#934D00] font-bold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Alert Sent (Latched)
          </span>
        ) : isArmed && !isPaused ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] font-bold text-xs">
            <span className="w-2 h-2 rounded-full bg-[#137333] animate-ping" />
            Monitoring Vibration
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E7E0EC] text-[#49454F] font-bold text-xs">
            Sensor Off
          </span>
        )}
      </div>

      {/* 2. Simplified Vibration Delta Metric Display */}
      <div className="bg-[#F8FAFC] border border-[#E7E0EC] rounded-[20px] p-5 text-center space-y-3.5">
        <span className="text-xs font-bold text-[#49454F] uppercase tracking-wider block">
          Vibration Movement (Delta)
        </span>

        <div className="flex items-baseline justify-center gap-1.5">
          <span
            id="motion-delta-value"
            className={`text-5xl sm:text-6xl font-mono font-bold tracking-tight transition-colors ${
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
          <span className="text-sm font-bold text-[#49454F]">m/s²</span>
        </div>

        {/* Level Indicator Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-3 bg-[#E7E0EC] rounded-full overflow-hidden relative">
            {/* Yellow Warning Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#934D00] z-10"
              style={{ left: `${yellowMarkerPercent}%` }}
              title={`Warning: ${yellowLimit} m/s²`}
            />
            {/* Red Alarm Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#BA1A1A] z-10"
              style={{ left: `${redMarkerPercent}%` }}
              title={`Alarm: ${redLimit} m/s²`}
            />
            {/* Level Fill */}
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

          <div className="flex justify-between text-[11px] font-bold text-[#49454F]">
            <span className="text-[#1C1B1F]">0.0 (Still)</span>
            <span className="text-[#934D00]">{yellowLimit.toFixed(1)} m/s² Warning</span>
            <span className="text-[#BA1A1A]">{redLimit.toFixed(1)} m/s² Alarm</span>
          </div>
        </div>

        {/* Live Status Summary Banner */}
        <div
          className={`p-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
            isLatched
              ? 'bg-[#FEF7E0] border border-[#FEEFC3] text-[#934D00]'
              : isRed
              ? 'bg-[#FCE8E6] border border-[#FAD2CF] text-[#BA1A1A]'
              : isYellow
              ? 'bg-[#FEF7E0] border border-[#FEEFC3] text-[#934D00]'
              : isArmed && !isPaused
              ? 'bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333]'
              : 'bg-slate-100 text-[#49454F]'
          }`}
        >
          {isLatched ? (
            <span>Flood alert sent and latched (1 alert per session). Turn sensor off and on to reset.</span>
          ) : isRed ? (
            <span>Flood vibration detected! Evacuate to designated safe high ground immediately.</span>
          ) : isYellow ? (
            <span>Elevated river vibration detected. Please stay alert.</span>
          ) : isArmed && !isPaused ? (
            <span>Still &mdash; Monitoring for flood vibration. No movement detected.</span>
          ) : (
            <span>Sensor is turned off. Tap &quot;Turn On Sensor Station&quot; to begin.</span>
          )}
        </div>
      </div>

      {/* 3. Calibration & Test Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-[#E7E0EC]">
        {/* Baseline Calibration */}
        {onCalibrate && isArmed && (
          <button
            type="button"
            id="btn-calibrate-motion"
            onClick={handleCalibrateClick}
            disabled={isCalibrating}
            className="w-full sm:w-auto px-3.5 py-2 rounded-full bg-[#E0EFFF] hover:bg-[#D2E7FC] border border-[#C2E7FF] text-xs font-bold text-[#1F71E8] flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
            title="Calibrate still rest position"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin' : ''}`} />
            <span>{isCalibrating ? 'Calibrating...' : `Calibrate Zero (${baselineGravity.toFixed(1)} m/s²)`}</span>
          </button>
        )}

        {/* Manual Test Buttons */}
        {onSimulateTest && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => onSimulateTest('yellow')}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-full bg-[#FEF7E0] hover:bg-[#FEEFC3] border border-[#FEEFC3] text-xs font-bold text-[#934D00] flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Test Warning</span>
            </button>
            <button
              type="button"
              onClick={() => onSimulateTest('red')}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-full bg-[#FCE8E6] hover:bg-[#FAD2CF] border border-[#FAD2CF] text-xs font-bold text-[#BA1A1A] flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Test Alarm</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
