import React from 'react';
import { AcousticData, AcousticSensorState } from '../types';
import { Bell, AlertTriangle, AlertOctagon, Volume2, CheckCircle2, UserX, Wind } from 'lucide-react';

interface LiveAcousticMeterProps {
  soundData: AcousticData;
  acousticState?: AcousticSensorState;
  thresholdYellowDb?: number;
  thresholdRedDb?: number;
  isArmed: boolean;
  isPaused: boolean;
  isDarkMode?: boolean;
  onSimulateSoundTest?: (severity?: 'yellow' | 'red') => void;
}

export const LiveAcousticMeter: React.FC<LiveAcousticMeterProps> = ({
  soundData,
  acousticState,
  thresholdYellowDb = 48,
  thresholdRedDb = 60,
  isArmed,
  isPaused,
  onSimulateSoundTest,
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
      className="bg-white rounded-[24px] border border-[#E7E0EC] p-5 shadow-xs space-y-4 select-none"
    >
      {/* 1. Header Row */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E7E0EC]">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold transition-colors ${
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
              <AlertOctagon className="w-6 h-6" />
            ) : isYellowActive ? (
              <AlertTriangle className="w-6 h-6" />
            ) : isVoiceRejected ? (
              <UserX className="w-6 h-6" />
            ) : isWhistleRejected ? (
              <Wind className="w-6 h-6" />
            ) : (
              <Bell className="w-6 h-6" />
            )}
          </div>

          <div>
            <h3 className="font-bold text-base text-[#1C1B1F] leading-tight">
              Bell Sound Sensor
            </h3>
            <p className="text-xs text-[#49454F] font-medium mt-0.5">
              Warning: {thresholdYellowDb} dB &bull; Alarm: {thresholdRedDb} dB
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {isRed ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE8E6] border border-[#FAD2CF] text-[#BA1A1A] font-bold text-xs">
            <AlertOctagon className="w-3.5 h-3.5" />
            Alarm Active
          </span>
        ) : isYellowActive ? (
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
            Listening for Bell
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E7E0EC] text-[#49454F] font-bold text-xs">
            Sensor Off
          </span>
        )}
      </div>

      {/* 2. Simplified Sound & Bell Readout */}
      <div className="bg-[#F8FAFC] border border-[#E7E0EC] rounded-[20px] p-5 text-center space-y-3.5">
        <span className="text-xs font-bold text-[#49454F] uppercase tracking-wider block">
          Bell Detection & Sound Level
        </span>

        {/* Big Decibels & Bell Match Score */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-baseline justify-center gap-1.5">
            <span
              className={`text-5xl sm:text-6xl font-mono font-bold tracking-tight transition-colors ${
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
            <span className="text-sm font-bold text-[#49454F]">dB</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-white border border-[#E7E0EC] text-xs font-bold text-[#1C1B1F] shadow-2xs">
            <span>Bell Match: </span>
            <span
              className={
                bellScore >= 50
                  ? 'text-[#137333]'
                  : bellScore >= 30
                  ? 'text-[#934D00]'
                  : 'text-[#49454F]'
              }
            >
              {isArmed && !isPaused ? `${bellScore}%` : '--'}
            </span>
          </div>
        </div>

        {/* Sound Level Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-3 bg-[#E7E0EC] rounded-full overflow-hidden relative">
            {/* Warning Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#934D00] z-10"
              style={{ left: `${yellowMarkerPercent}%` }}
              title={`Warning: ${thresholdYellowDb} dB`}
            />
            {/* Alarm Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#BA1A1A] z-10"
              style={{ left: `${redMarkerPercent}%` }}
              title={`Alarm: ${thresholdRedDb} dB`}
            />
            {/* Level Fill */}
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

          <div className="flex justify-between text-[11px] font-bold text-[#49454F]">
            <span className="text-[#1C1B1F]">30 dB (Quiet)</span>
            <span className="text-[#934D00]">{thresholdYellowDb} dB Warning</span>
            <span className="text-[#BA1A1A]">{thresholdRedDb} dB Alarm</span>
            <span className="text-[#1C1B1F]">90 dB</span>
          </div>
        </div>

        {/* Live Filter / Detection Status Banner */}
        <div
          className={`p-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
            isLatched
              ? 'bg-[#FEF7E0] border border-[#FEEFC3] text-[#934D00]'
              : isRed
              ? 'bg-[#FCE8E6] border border-[#FAD2CF] text-[#BA1A1A]'
              : isYellowActive
              ? 'bg-[#FEF7E0] border border-[#FEEFC3] text-[#934D00]'
              : isBellDetected
              ? 'bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333]'
              : isVoiceRejected
              ? 'bg-[#E0EFFF] border border-[#C2E7FF] text-[#1F71E8]'
              : isWhistleRejected
              ? 'bg-[#E0EFFF] border border-[#C2E7FF] text-[#1F71E8]'
              : isArmed && !isPaused
              ? 'bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333]'
              : 'bg-slate-100 text-[#49454F]'
          }`}
        >
          {isLatched ? (
            <span>Flood bell alert sent and latched (1 alert per session). Turn off and on to reset.</span>
          ) : isRed ? (
            <span>Emergency warning bell ringing detected! Evacuate to designated safe high ground immediately.</span>
          ) : isYellowActive ? (
            <span>Emergency warning bell sound detected. Please stay alert.</span>
          ) : isBellDetected ? (
            <span>Bell ringing sound detected.</span>
          ) : isVoiceRejected ? (
            <span>Human speech detected &mdash; safely filtered out (ignored).</span>
          ) : isWhistleRejected ? (
            <span>Whistle sound detected &mdash; safely filtered out (ignored).</span>
          ) : isArmed && !isPaused ? (
            <span>Listening for flood warning bell. Room is quiet.</span>
          ) : (
            <span>Sensor is turned off. Tap &quot;Turn On Sensor Station&quot; to begin.</span>
          )}
        </div>
      </div>

      {/* 3. Manual Test Controls */}
      {onSimulateSoundTest && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-[#E7E0EC]">
          <span className="text-xs font-bold text-[#49454F]">
            Manual Bell Test:
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => onSimulateSoundTest('yellow')}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-full bg-[#FEF7E0] hover:bg-[#FEEFC3] border border-[#FEEFC3] text-xs font-bold text-[#934D00] flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Test Bell Warning</span>
            </button>
            <button
              type="button"
              onClick={() => onSimulateSoundTest('red')}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-full bg-[#FCE8E6] hover:bg-[#FAD2CF] border border-[#FAD2CF] text-xs font-bold text-[#BA1A1A] flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Test Bell Alarm</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
