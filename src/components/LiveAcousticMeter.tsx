import React from 'react';
import { AcousticData, AcousticSensorState } from '../types';
import { Bell, AlertTriangle, AlertOctagon, UserX, Wind } from 'lucide-react';

interface LiveAcousticMeterProps {
  soundData: AcousticData;
  acousticState?: AcousticSensorState;
  thresholdYellowDb?: number;
  thresholdRedDb?: number;
  isArmed: boolean;
  isPaused: boolean;
  isCompact?: boolean;
}

export const LiveAcousticMeter: React.FC<LiveAcousticMeterProps> = ({
  soundData,
  acousticState,
  thresholdYellowDb = 48,
  thresholdRedDb = 60,
  isArmed,
  isPaused,
  isCompact = false,
}) => {
  const decibels = soundData?.decibels || 30;
  const bellScore = soundData?.bellDetectionScore || 0;
  const isBellDetected = soundData?.isBellRingingDetected || false;
  const isVoiceRejected = soundData?.voiceRejectionActive || false;
  const isWhistleRejected = soundData?.whistleRejectionActive || false;

  const isRed = isBellDetected && decibels >= thresholdRedDb && isArmed && !isPaused;
  const isYellowActive = isBellDetected && decibels >= thresholdYellowDb && !isRed && isArmed && !isPaused;
  const isLatched = acousticState?.sessionAlertFired && isArmed;

  // Decibel gauge percentage (30 dB to 90 dB range)
  const dbPercent = isArmed && !isPaused ? Math.min(100, Math.max(0, ((decibels - 30) / (90 - 30)) * 100)) : 0;
  const yellowMarkerPercent = ((thresholdYellowDb - 30) / 60) * 100;
  const redMarkerPercent = ((thresholdRedDb - 30) / 60) * 100;

  return (
    <div
      id="live-acoustic-meter-card"
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
                : isYellowActive
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
            ) : isYellowActive ? (
              <AlertTriangle className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
            ) : isVoiceRejected ? (
              <UserX className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
            ) : isWhistleRejected ? (
              <Wind className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
            ) : (
              <Bell className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
            )}
          </div>

          <div className="min-w-0">
            <h3 className={`font-bold text-[#1C1B1F] leading-tight truncate ${isCompact ? 'text-xs' : 'text-sm sm:text-base'}`}>
              Bell Sensor
            </h3>
            {!isCompact && (
              <p className="text-[11px] text-[#49454F] font-medium mt-0.5 truncate">
                Warning: {thresholdYellowDb} &bull; Alarm: {thresholdRedDb} dB
              </p>
            )}
          </div>
        </div>

        {/* Status Pill */}
        {isRed ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FCE8E6] border border-[#FAD2CF] text-[#BA1A1A] font-bold text-[10px] shrink-0">
            Alarm
          </span>
        ) : isYellowActive ? (
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

      {/* 2. Compact Sound & Bell Display */}
      <div className={`bg-[#F8FAFC] border border-[#E7E0EC] rounded-[16px] text-center ${isCompact ? 'p-2.5 space-y-1.5' : 'p-3.5 sm:p-4 space-y-2.5'}`}>
        <span className="text-[10px] font-bold text-[#49454F] uppercase tracking-wider block">
          Bell Sound Level
        </span>

        {/* Decibels & Match */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="flex items-baseline justify-center gap-1">
            <span
              className={`font-mono font-bold tracking-tight transition-colors ${
                isCompact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
              } ${
                !isArmed || isPaused
                  ? 'text-slate-400'
                  : isRed
                  ? 'text-[#BA1A1A]'
                  : isYellowActive
                  ? 'text-[#934D00]'
                  : 'text-[#1F71E8]'
              }`}
            >
              {isArmed && !isPaused ? decibels : '--'}
            </span>
            <span className="text-xs font-bold text-[#49454F]">dB</span>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              bellScore >= 50
                ? 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]'
                : bellScore >= 30
                ? 'bg-[#FEF7E0] text-[#934D00] border-[#FEEFC3]'
                : 'bg-white text-[#49454F] border-[#E7E0EC]'
            }`}
          >
            {isArmed && !isPaused ? `${bellScore}% Bell` : '--'}
          </span>
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
                  : isYellowActive
                  ? 'bg-[#934D00]'
                  : 'bg-[#137333]'
              }`}
              style={{ width: `${dbPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] font-bold text-[#49454F]">
            <span>30 dB</span>
            <span className="text-[#934D00]">{thresholdYellowDb} W</span>
            <span className="text-[#BA1A1A]">{thresholdRedDb} A</span>
          </div>
        </div>

        {/* Status text */}
        <div
          className={`py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors truncate ${
            isLatched
              ? 'bg-[#FEF7E0] text-[#934D00]'
              : isRed
              ? 'bg-[#FCE8E6] text-[#BA1A1A]'
              : isYellowActive
              ? 'bg-[#FEF7E0] text-[#934D00]'
              : isBellDetected
              ? 'bg-[#E6F4EA] text-[#137333]'
              : isVoiceRejected
              ? 'bg-[#E0EFFF] text-[#1F71E8]'
              : isWhistleRejected
              ? 'bg-[#E0EFFF] text-[#1F71E8]'
              : isArmed && !isPaused
              ? 'bg-[#E6F4EA] text-[#137333]'
              : 'bg-slate-100 text-[#49454F]'
          }`}
        >
          {isLatched
            ? 'Alert sent & latched'
            : isRed
            ? 'Alarm: Bell Ringing!'
            : isYellowActive
            ? 'Warning: Bell Sound'
            : isBellDetected
            ? 'Bell Detected'
            : isVoiceRejected
            ? 'Voice Ignored'
            : isWhistleRejected
            ? 'Whistle Ignored'
            : isArmed && !isPaused
            ? 'Listening for Bell'
            : 'Sensor Off'}
        </div>
      </div>
    </div>
  );
};
