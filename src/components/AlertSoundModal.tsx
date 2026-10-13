import React, { useState, useEffect } from 'react';
import {
  X,
  Music,
  Check,
  Play,
  Square,
  Volume2,
} from 'lucide-react';
import { sirenService, AlertSoundType } from '../services/audioSiren';

interface AlertSoundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertSoundModal: React.FC<AlertSoundModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState<AlertSoundType>(() =>
    sirenService.getSoundType()
  );
  const [isPlayingTest, setIsPlayingTest] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedType(sirenService.getSoundType());
    } else {
      // Stop preview when closing modal
      sirenService.stopEmergencySiren();
      setIsPlayingTest(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectSoundType = (type: AlertSoundType) => {
    setSelectedType(type);
    sirenService.setSoundType(type);

    // If already playing preview, restart with new sound
    if (isPlayingTest) {
      sirenService.stopEmergencySiren();
      setTimeout(() => {
        sirenService.startEmergencySiren();
      }, 60);
    }
  };

  const handleToggleTestPlay = () => {
    if (isPlayingTest) {
      sirenService.stopEmergencySiren();
      setIsPlayingTest(false);
    } else {
      sirenService.unlockAudio();
      sirenService.startEmergencySiren();
      setIsPlayingTest(true);
    }
  };

  const soundOptions: Array<{
    id: AlertSoundType;
    title: string;
    description: string;
    tag: string;
  }> = [
    {
      id: 'siren',
      title: 'High-Pitch Siren (Default)',
      description: 'Urgent emergency siren sweep (1100Hz - 1600Hz) with fast oscillation',
      tag: 'Recommended',
    },
    {
      id: 'bell',
      title: 'Rapid Alarm Bell',
      description: 'Sharp, rapid pulsing chime for high-alert notification',
      tag: 'Fast Pulse',
    },
    {
      id: 'horn',
      title: 'Deep Acoustic Horn',
      description: 'Resonant low-tone horn blast with heavy penetration power',
      tag: 'Low Frequency',
    },
  ];

  return (
    <div
      id="screen-alert-sound-settings"
      className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-full w-full overflow-hidden select-none animate-in fade-in duration-200"
    >
      {/* Full-Screen Top Header Bar */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition active:scale-95 cursor-pointer shrink-0"
            title="Back"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-[#1C1B1F] leading-tight truncate">
              Alert Siren Sound
            </h1>
            <p className="text-xs text-[#49454F] font-medium truncate">
              Emergency flood warning sirens &amp; ringtones
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 cursor-pointer"
        >
          Done
        </button>
      </header>

      {/* Main Full-Screen Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-24">
        <div className="max-w-xl mx-auto w-full bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4 text-[#1C1B1F]">

        {/* Test Playback Banner */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#1C1B1F] block">
              {isPlayingTest ? 'Testing Alert Sound...' : 'Test Selected Sound'}
            </span>
            <span className="text-[11px] text-[#49454F] block">
              Plays at current volume setting
            </span>
          </div>

          <button
            type="button"
            id="btn-test-alert-sound"
            onClick={handleToggleTestPlay}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer shrink-0 ${
              isPlayingTest
                ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                : 'bg-[#1F71E8] hover:bg-blue-700 text-white'
            }`}
          >
            {isPlayingTest ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Test</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Sound</span>
              </>
            )}
          </button>
        </div>

        {/* Sound Selection List */}
        <div className="space-y-2">
          <span className="text-xs font-extrabold text-[#49454F] px-1 uppercase tracking-wide">
            Select Tone
          </span>

          {soundOptions.map((option) => {
            const isSelected = selectedType === option.id;
            return (
              <div
                key={option.id}
                onClick={() => handleSelectSoundType(option.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer select-none ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[#1C1B1F] leading-tight">
                          {option.title}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
                            isSelected
                              ? 'bg-blue-200 text-blue-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {option.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#49454F] mt-0.5 leading-snug">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Done Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-full bg-[#1C1B1F] hover:bg-black text-white text-xs font-bold shadow-xs active:scale-98 transition cursor-pointer"
          >
            Save & Done
          </button>
        </div>
        </div>
      </main>
    </div>
  );
};
