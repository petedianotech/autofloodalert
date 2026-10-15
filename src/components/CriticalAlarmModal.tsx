import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Volume2,
  VolumeX,
  Power,
  Check,
  MapPin,
  ExternalLink,
  Share2,
  Activity,
  BellRing,
  BellOff,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Package,
  CheckCircle2,
  Mic,
  Send,
  X,
} from 'lucide-react';
import { FloodAlert } from '../types';
import { sirenService } from '../services/audioSiren';

interface CriticalAlarmModalProps {
  activeAlert: FloodAlert | null;
  onDismiss: (alertId: string) => void;
  onTurnOffSensorAndDismiss?: (alertId: string) => void;
  isSoundEnabled: boolean;
  onOpenCheckIn?: () => void;
  onOpenVoiceSOS?: () => void;
  onOpenSmsModal?: () => void;
  isAdmin?: boolean;
}

export const CriticalAlarmModal: React.FC<CriticalAlarmModalProps> = ({
  activeAlert,
  onDismiss,
  onTurnOffSensorAndDismiss,
  isSoundEnabled,
  onOpenCheckIn,
  onOpenVoiceSOS,
  onOpenSmsModal,
  isAdmin = false,
}) => {
  const [isMuted, setIsMuted] = useState(!isSoundEnabled);
  const [copied, setCopied] = useState(false);
  const [showFloodActions, setShowFloodActions] = useState(true);
  const [showPrepareActions, setShowPrepareActions] = useState(false);

  const isYellow = activeAlert?.severity === 'yellow';

  useEffect(() => {
    if (!activeAlert || isMuted || isAdmin) {
      sirenService.stopAllAlarms();
      return;
    }

    if (activeAlert.severity === 'yellow') {
      sirenService.stopEmergencySiren();
      sirenService.startWarningChime();
    } else {
      sirenService.stopWarningChime();
      sirenService.startEmergencySiren();
    }

    return () => {
      sirenService.stopAllAlarms();
    };
  }, [activeAlert, isMuted, isAdmin]);

  const handleTurnOffSensorAndStop = () => {
    sirenService.stopAllAlarms();
    if (activeAlert) {
      if (onTurnOffSensorAndDismiss) {
        onTurnOffSensorAndDismiss(activeAlert.id);
      } else {
        onDismiss(activeAlert.id);
      }
    }
  };

  const handleStopAlertOnly = () => {
    sirenService.stopAllAlarms();
    if (activeAlert) {
      onDismiss(activeAlert.id);
    }
  };

  const locationFullString =
    activeAlert?.location?.fullAddress ||
    activeAlert?.locationLabel ||
    `${activeAlert?.riverName || 'Ruo River'}, ${activeAlert?.village || 'Dzenje Village'}, ${activeAlert?.traditionalAuthority || 'T/A Mabuka'}, ${activeAlert?.district || 'Mulanje'}`;

  const shareText = isYellow
    ? `⚠️ FLOOD WARNING (WATER RISING)\n📍 River & Area: ${locationFullString}\n⏰ Time: ${activeAlert?.formattedTime || 'Just now'}\n\n👉 What to do: River water is rising. Pack essential items, keep phones charged, and be ready to move to high ground!`
    : `🚨 URGENT FLOOD ALARM (DANGER!)\n📍 River & Area: ${locationFullString}\n⏰ Time: ${activeAlert?.formattedTime || 'Just now'}\n\n🚨 ACTION NEEDED: Flood water detected! Move your family and animals to safe high ground IMMEDIATELY!`;

  const handleShareOrCopy = async () => {
    if (!activeAlert) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: isYellow ? '⚠️ Flood Warning - Water Rising' : '🚨 URGENT FLOOD ALARM - Move to High Ground!',
          text: shareText,
        });
        return;
      } catch {
        // Fallback
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // ignore
    }
  };

  if (!activeAlert) return null;

  // Admin View
  if (isAdmin) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin Flood Alert"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto select-none"
      >
        <div className="w-full max-w-md rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="bg-red-600 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="font-bold text-base leading-tight">Flood Detected &bull; Sensor Active</h2>
                <p className="text-xs text-red-100 font-medium">Dzenje CDSS STEM Station Control</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleStopAlertOnly}
              className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs">
                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                <span>{activeAlert.riverName || 'Ruo River'} Sensor Station</span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">{locationFullString}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                <span>Time: <strong>{activeAlert.formattedTime || 'Just now'}</strong></span>
                <span className="text-amber-700 font-bold">Admin Override Active</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleTurnOffSensorAndStop}
                className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Power className="w-4 h-4 shrink-0" />
                <span>Turn Off River Sensor &amp; Reset Alarm</span>
              </button>

              {onOpenSmsModal && (
                <button
                  type="button"
                  onClick={() => {
                    handleStopAlertOnly();
                    onOpenSmsModal();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-[#006A4E] hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>Send SMS Warning to Village (Textbee)</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleStopAlertOnly}
                className="w-full py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Dismiss Alert</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Resident / Public Alarm Modal (Pristine Professional Material 3 UI)
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Critical Flood Alert"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto select-none"
    >
      <div className="w-full max-w-lg rounded-[32px] bg-white text-slate-900 border border-slate-200 shadow-2xl relative overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <div className={`p-5 sm:p-6 text-white flex items-center justify-between shrink-0 ${
          isYellow ? 'bg-amber-600' : 'bg-red-600'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              {isYellow ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : <AlertOctagon className="w-6 h-6 animate-bounce" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full text-white inline-block mb-1">
                {isYellow ? 'Flood Advisory Warning' : 'Critical Emergency Alarm'}
              </span>
              <h2 className="font-bold text-base sm:text-lg leading-tight truncate">
                {isYellow ? 'River Water Level Rising' : 'Move to Safe High Ground Now!'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="px-3 py-1.5 rounded-full bg-black/25 hover:bg-black/40 text-white border border-white/20 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
              title={isMuted ? 'Turn Sound On' : 'Silence Siren'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-amber-200" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-white animate-bounce" />
                  <span>Siren On</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {/* Location & Time Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                <span>{activeAlert.riverName || 'Ruo River'} Sensor Station</span>
              </div>

              {(activeAlert.mapsUrl || (activeAlert.latitude && activeAlert.longitude)) && (
                <a
                  href={
                    activeAlert.mapsUrl ||
                    `https://www.google.com/maps?q=${activeAlert.latitude || -16.0315},${activeAlert.longitude || 35.5000}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full inline-flex items-center gap-1 transition-colors shrink-0"
                >
                  <span>View Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <p className="text-slate-700 text-xs font-medium leading-relaxed">
              {locationFullString}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
              <span>Time: <strong>{activeAlert.formattedTime || 'Just now'}</strong></span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Live Sensor Monitored
              </span>
            </div>
          </div>

          {/* Safety Action Guide Dropdown 1 */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
            <button
              type="button"
              onClick={() => setShowFloodActions(!showFloodActions)}
              className="w-full p-3.5 flex items-center justify-between gap-2 text-left cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-900">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>Immediate Safety Steps:</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <span>{showFloodActions ? 'Hide' : 'Show'}</span>
                {showFloodActions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showFloodActions && (
              <div className="px-4 pb-4 pt-1 border-t border-slate-200 bg-white">
                <ul className="space-y-2 text-xs text-slate-700 leading-relaxed font-medium">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span><strong>Go to High Ground:</strong> Evacuate to your designated village safe ground or church hall right away.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span><strong>Never Cross Fast River Water:</strong> Moving flood water is extremely dangerous and deceptive.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span><strong>Assist Vulnerable Neighbors:</strong> Help elderly residents, children, and those needing mobility assistance.</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <div className="grid grid-cols-2 gap-2">
              {onOpenCheckIn && (
                <button
                  type="button"
                  onClick={() => {
                    handleStopAlertOnly();
                    onOpenCheckIn();
                  }}
                  className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Mark I Am Safe</span>
                </button>
              )}

              {onOpenVoiceSOS && (
                <button
                  type="button"
                  onClick={() => {
                    handleStopAlertOnly();
                    onOpenVoiceSOS();
                  }}
                  className="py-3 px-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition"
                >
                  <Mic className="w-4 h-4 shrink-0" />
                  <span>Record Voice SOS</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleStopAlertOnly}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <BellOff className="w-4 h-4 text-slate-500" />
              <span>I Understand &bull; Silence My Phone Siren</span>
            </button>
          </div>

        </div>

        {/* Footer Share */}
        <footer className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={handleShareOrCopy}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Warning Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Share Warning to Family &amp; Neighbors</span>
              </>
            )}
          </button>
        </footer>

      </div>
    </div>
  );
};
