import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  X,
  CheckCircle2,
  MapPin,
  AlertOctagon,
  LifeBuoy,
  ShieldCheck,
  Loader2,
  Trash2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { ResidentSafetyReport, SafetyStatusType, UserProfile } from '../types';
import { firebaseFloodService } from '../services/firebaseService';
import { locationService } from '../services/locationService';

interface DirectVoiceSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  isDarkMode?: boolean;
  onSuccess?: (report: ResidentSafetyReport) => void;
}

export const DirectVoiceSOSModal: React.FC<DirectVoiceSOSModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<SafetyStatusType>('needs_help');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'submitting' | 'confirmed' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Cached base64 audio and duration for retrying if network failed
  const [cachedAudioBase64, setCachedAudioBase64] = useState<string | undefined>();
  const [cachedDurationSec, setCachedDurationSec] = useState<number>(0);

  // GPS Coordinates
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [gpsAccuracy, setGpsAccuracy] = useState<number | undefined>();
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'ready' | 'unavailable'>('acquiring');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioMimeTypeRef = useRef<string>('audio/webm');

  // Background GPS Acquisition
  const acquireGps = () => {
    setGpsStatus('acquiring');
    locationService.getDeviceGpsCoordinates({ enableHighAccuracy: true, timeout: 8000 })
      .then((coords) => {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        setGpsAccuracy(coords.accuracy);
        setGpsStatus('ready');
      })
      .catch((err) => {
        console.warn('High accuracy GPS background acquisition failed, trying standard...', err);
        locationService.getDeviceGpsCoordinates({ enableHighAccuracy: false, timeout: 8000 })
          .then((coords) => {
            setLatitude(coords.latitude);
            setLongitude(coords.longitude);
            setGpsAccuracy(coords.accuracy);
            setGpsStatus('ready');
          })
          .catch(() => {
            setGpsStatus('unavailable');
          });
      });
  };

  useEffect(() => {
    if (!isOpen) return;
    acquireGps();
  }, [isOpen]);

  // Start recording on modal open
  useEffect(() => {
    if (!isOpen) {
      stopAndCleanup();
      return;
    }

    setDeliveryStatus('idle');
    setIsSubmitting(false);
    setErrorMessage(null);
    setMicError(null);
    setRecordingSeconds(0);
    setSelectedStatus('needs_help');
    setCachedAudioBase64(undefined);
    setCachedDurationSec(0);

    startRecordingNow();

    return () => {
      stopAndCleanup();
    };
  }, [isOpen]);

  const stopAndCleanup = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const startRecordingNow = async () => {
    try {
      setMicError(null);
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Microphone recording is not supported on this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }
      audioMimeTypeRef.current = mimeType || 'audio/webm';

      if (typeof MediaRecorder === 'undefined') {
        throw new Error('Voice recorder is not available on this device.');
      }

      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 29) {
            handleStopAndSend();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn('Direct voice SOS mic error:', err);
      setMicError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission blocked. Please allow microphone access in your browser or phone settings to record voice.'
          : 'Could not access microphone on this device.'
      );
      setIsRecording(false);
    }
  };

  const executeSend = async (audioData?: string, duration?: number) => {
    setIsSubmitting(true);
    setDeliveryStatus('submitting');
    setErrorMessage(null);

    const userName = currentUser?.name || 'Resident';
    const village = currentUser?.village || 'Dzenje Village';
    const statusLabel =
      selectedStatus === 'needs_help'
        ? 'Emergency Rescue Needed (Voice SOS)'
        : selectedStatus === 'in_flooding'
        ? 'In Flooding (Voice Message)'
        : 'Safe Update (Voice Message)';

    const mapsUrl =
      latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : undefined;

    try {
      const report = await firebaseFloodService.submitSafetyReport({
        userId: currentUser?.uid || 'user_' + Math.random().toString(36).substring(2, 8),
        userName,
        village,
        status: selectedStatus,
        statusLabel,
        peopleCount: 1,
        message:
          selectedStatus === 'needs_help'
            ? '🚨 IMMEDIATE RESCUE SOS — Resident sent urgent voice recording from high water.'
            : selectedStatus === 'safe'
            ? '✅ Resident reported safe status with voice confirmation.'
            : '⚠️ Water rising — Resident sent urgent voice notice.',
        latitude,
        longitude,
        mapsUrl,
        voiceAudioBase64: audioData,
        voiceDurationSec: duration || 1,
        hasVoiceNote: Boolean(audioData),
      });

      setDeliveryStatus('confirmed');
      setIsSubmitting(false);
      if (onSuccess) onSuccess(report);

      // Auto close after 2.5s on confirmed delivery
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error('Failed to submit direct voice SOS:', err);
      setIsSubmitting(false);
      setDeliveryStatus('failed');
      setErrorMessage(
        'Delivery failed: Could not reach the community database. Please check your data connection and tap Retry.'
      );
    }
  };

  const handleStopAndSend = async () => {
    if (isSubmitting) return;

    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const durationSec = recordingSeconds || 1;
    let base64Audio: string | undefined = undefined;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        await new Promise<void>((resolve) => {
          if (!mediaRecorderRef.current) return resolve();
          mediaRecorderRef.current.onstop = async () => {
            const blob = new Blob(audioChunksRef.current, {
              type: audioMimeTypeRef.current || 'audio/webm',
            });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              base64Audio = reader.result as string;
              resolve();
            };
            reader.onerror = () => resolve();
          };
          mediaRecorderRef.current.stop();
        });
      } catch (err) {
        console.warn('Error stopping media recorder:', err);
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);

    setCachedAudioBase64(base64Audio);
    setCachedDurationSec(durationSec);

    await executeSend(base64Audio, durationSec);
  };

  const handleRetry = () => {
    executeSend(cachedAudioBase64, cachedDurationSec);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Emergency Voice SOS"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Professional Modal Header */}
        <header className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                Emergency Voice SOS
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate">
                Direct Line to Village Rescue &bull; Dzenje CDSS ADDA STEM
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-slate-900">

        {/* Confirmed Delivery State */}
        {deliveryStatus === 'confirmed' ? (
          <div className="p-8 text-center space-y-3.5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Delivery Confirmed!</h2>
            <p className="text-sm text-slate-600 max-w-xs mx-auto font-medium leading-relaxed">
              Your voice note and location have been successfully delivered to the village emergency dispatch. Stay on high ground.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-6 rounded-full bg-slate-900 text-white text-xs font-bold transition hover:bg-black cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Live Audio Visualizer / Status */}
            <div className="text-center space-y-2 py-1">
              <div
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white ring-4 ring-red-200'
                    : micError
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {isRecording ? (
                  <Mic className="w-9 h-9 animate-pulse text-white" />
                ) : micError ? (
                  <MicOff className="w-9 h-9 text-slate-400" />
                ) : (
                  <Mic className="w-9 h-9 text-red-600" />
                )}
              </div>

              {isRecording ? (
                <div className="space-y-1">
                  <div className="text-sm font-bold text-red-600 flex items-center justify-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <span>Recording Voice ({recordingSeconds}s / 30s)</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    State your name, exact location, and the help you need.
                  </p>
                </div>
              ) : micError ? (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium space-y-2">
                  <p>{micError}</p>
                  <button
                    type="button"
                    onClick={startRecordingNow}
                    className="py-1 px-3 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 cursor-pointer"
                  >
                    Retry Microphone Access
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium">
                  Connecting to audio hardware...
                </p>
              )}
            </div>

            {/* Error Banner with Retry Button (if submission failed) */}
            {deliveryStatus === 'failed' && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Sending SOS Now</span>
                </button>
              </div>
            )}

            {/* Emergency Type Selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Emergency Situation:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('needs_help')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border text-center cursor-pointer min-h-[44px] ${
                    selectedStatus === 'needs_help'
                      ? 'bg-red-50 border-red-500 text-red-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                  <span className="truncate w-full text-xs">Need Rescue</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('in_flooding')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border text-center cursor-pointer min-h-[44px] ${
                    selectedStatus === 'in_flooding'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <LifeBuoy className="w-4 h-4 text-amber-600" />
                  <span className="truncate w-full text-xs">Water Rising</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('safe')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border text-center cursor-pointer min-h-[44px] ${
                    selectedStatus === 'safe'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="truncate w-full text-xs">I Am Safe</span>
                </button>
              </div>
            </div>

            {/* Resident & GPS Status Bar */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between text-xs">
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">
                  {currentUser?.name || 'Resident'}
                </p>
                <p className="text-xs text-slate-500 truncate font-medium">
                  {currentUser?.village || 'Dzenje Village'}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 shrink-0">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>
                  {gpsStatus === 'ready'
                    ? `GPS Connected (±${gpsAccuracy || 10}m)`
                    : gpsStatus === 'acquiring'
                    ? 'Acquiring GPS...'
                    : 'Village Location'}
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                id="btn-direct-voice-send-now"
                onClick={handleStopAndSend}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Voice SOS to Dispatch...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Stop &amp; Send Voice SOS</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 py-1 transition cursor-pointer font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <span className="text-[11px] text-slate-500 font-medium">
                  Direct urgent broadcast to rescue team
                </span>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
