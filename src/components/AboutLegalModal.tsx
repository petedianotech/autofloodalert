import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  Info,
  ShieldCheck,
  Award,
  Users,
  Building,
  GraduationCap,
  HeartHandshake,
  FileText,
  Lock,
  ExternalLink,
  Smartphone,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Trash2,
  Bell,
  Mic,
  Activity,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { apkService, ApkConfig } from '../services/apkService';

interface AboutLegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'about' | 'privacy' | 'terms' | 'download';
}

export const AboutLegalModal: React.FC<AboutLegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'about',
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'privacy' | 'terms' | 'download'>(initialTab);
  const [apkConfig, setApkConfig] = useState<ApkConfig>(() => apkService.getConfig());
  const [copiedLink, setCopiedLink] = useState(false);
  const [clearDataSuccess, setClearDataSuccess] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    return apkService.subscribe((cfg) => {
      setApkConfig(cfg);
    });
  }, []);

  const handleDownloadApk = () => {
    const url = apkConfig.downloadUrl || 'https://github.com/dzenje-stem-club/flood-alert/releases';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyApkLink = async () => {
    const url = apkConfig.downloadUrl || 'https://github.com/dzenje-stem-club/flood-alert/releases';
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleClearCachedData = () => {
    if (window.confirm('Clear cached flood alerts and offline settings on this device? Your account profile in Firebase will remain safe.')) {
      try {
        localStorage.removeItem('flood_alerts_cache');
        localStorage.removeItem('flood_reports_cache');
        sessionStorage.clear();
        setClearDataSuccess(true);
        setTimeout(() => setClearDataSuccess(false), 3000);
      } catch {
        // ignore
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="screen-about-legal"
      className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-full w-full overflow-hidden select-none animate-in fade-in duration-200"
    >
      {/* Full-Screen Top Header Bar */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            id="btn-close-about-screen"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
            title="Back to App"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
              {activeTab === 'about' && 'About Project'}
              {activeTab === 'privacy' && 'Privacy & Data Protection'}
              {activeTab === 'terms' && 'Terms of Use'}
              {activeTab === 'download' && 'Download Android App (APK)'}
            </h1>
            <p className="text-xs text-slate-500 font-medium truncate">
              Dzenje CDSS ADDA STEM Club Innovation &bull; Mulanje, Malawi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadApk}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download APK</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </header>

      {/* Modern Tab Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2">
        <div className="max-w-4xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>About Project</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy &amp; Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('download')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'download'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download APK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Use</span>
          </button>
        </div>
      </div>

      {/* Main Full-Screen Scrolling Body (No awkward modal cutoffs) */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* =========================================================================
             TAB 1: ABOUT PROJECT
             ========================================================================= */}
          {activeTab === 'about' && (
            <div className="space-y-5">
              {/* Hero Banner */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Award className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 inline-block mb-1.5">
                      Community Disaster Risk Reduction Innovation
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Automatic Flood Alert System
                    </h2>
                    <p className="text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                      Conceived, designed, and built by the high school innovators of{' '}
                      <strong className="text-blue-900 font-bold">Dzenje CDSS ADDA STEM CLUB</strong>{' '}
                      in Mulanje District, Southern Region of Malawi.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-1">
                      Our Mission
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      To protect human lives, children, homes, and livestock along the Ruo River basin and surrounding flood-prone villages through low-cost, offline-resilient early warning hardware and instant mobile alarms.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-1">
                      Real-World Deployment
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Tested with river vibration sensors, acoustic warning chimes, emergency SMS broadcasts in Chichewa and English, and real-time community headcounts across Dzenje and Machokola villages.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contributors and Leadership */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Club Leadership &amp; Contributors
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full inline-block mb-2">
                        Lead Developer
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">Peter Damiano</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Software &amp; System Architect</p>
                    </div>
                    <a
                      href="https://peterdamiano.vercel.app"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
                    >
                      <span>peterdamiano.vercel.app</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-2">
                        Club Patron
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">Mr. H. Skinner</h4>
                      <p className="text-xs text-slate-500 mt-0.5">STEM Club Mentor &amp; Science Teacher</p>
                    </div>
                    <span className="mt-3 text-xs text-slate-400 font-medium">Guiding project development</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full inline-block mb-2">
                        Club Members
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">ADDA STEM Club Students</h4>
                      <p className="text-xs text-slate-500 mt-0.5">30 Active Student Innovators</p>
                    </div>
                    <span className="mt-3 text-xs text-slate-400 font-medium">Testing &amp; village fieldwork</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                    <HeartHandshake className="w-4 h-4 text-amber-700" />
                    <span>Special Head Teacher Mentorship &bull; Mr. Palapandu</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Sincere appreciation to our head teacher Mr. Palapandu for his steadfast encouragement of youth in science and his guiding motto:
                  </p>
                  <blockquote className="mt-1 font-bold italic text-slate-900 text-xs">
                    &ldquo;You will never fail until you stop trying.&rdquo;
                  </blockquote>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
             TAB 2: PRIVACY & DATA PROTECTION (COMPREHENSIVE & POLISHED)
             ========================================================================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              {/* Privacy Highlights Header */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Privacy &amp; Data Protection Constitution
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                      This system is built solely for humanitarian disaster warning and community protection. We believe privacy is a fundamental human right.
                    </p>
                  </div>
                </div>

                {/* 3 Core Guarantees */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1.5" />
                    <h4 className="font-bold text-xs text-emerald-950">No Advertising or Sale</h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                      Your data is never sold, leased, or shared with commercial entities or advertisers.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                    <Activity className="w-5 h-5 text-blue-600 mb-1.5" />
                    <h4 className="font-bold text-xs text-blue-950">Local-First Sensor Analysis</h4>
                    <p className="text-[11px] text-blue-800 mt-0.5 leading-snug">
                      River vibration and acoustic sound monitoring are analyzed entirely on-device in real time.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80">
                    <Lock className="w-5 h-5 text-purple-600 mb-1.5" />
                    <h4 className="font-bold text-xs text-purple-950">Voluntary Emergency GPS</h4>
                    <p className="text-[11px] text-purple-800 mt-0.5 leading-snug">
                      Location coordinates are only attached when you actively choose to send a safety check-in or SOS.
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Privacy Breakdown Accordion-style cards */}
              <div className="space-y-3.5">
                {/* 1. What data is collected */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900">
                      1. Information You Provide to the App
                    </h3>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                    <p>
                      <strong>Name &amp; Village:</strong> Used to display in the community roll-call so village elders, disaster committees, and neighbors know which households are accounted for.
                    </p>
                    <p>
                      <strong>Phone Number (Optional):</strong> Used strictly to dispatch emergency Chichewa or English flood alert SMS messages via the Textbee SMS gateway when rivers swell.
                    </p>
                    <p>
                      <strong>Safety Check-In Status:</strong> Such as &ldquo;I am Safe&rdquo;, &ldquo;Evacuated to Shelter&rdquo;, or &ldquo;Trapped / Need Rescue&rdquo;.
                    </p>
                  </div>
                </div>

                {/* 2. Device Sensors (Mic & Accelerometer) */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Mic className="w-4 h-4 text-purple-600" />
                    <h3 className="font-bold text-sm text-slate-900">
                      2. Sensor Privacy &bull; Microphone &amp; Motion Accelerometer
                    </h3>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                    <p>
                      <strong>River Acoustic Watchdog (Microphone):</strong> When acoustic sensor mode is active, the app inspects sound frequencies locally on your device to recognize the sharp resonance of warning bells and rushing flood waters. <em>No speech or private conversations are ever recorded, saved, or uploaded to any server.</em>
                    </p>
                    <p>
                      <strong>Voice SOS Button:</strong> Audio is only recorded when you explicitly press the red Voice SOS button, allowing rescue workers to hear your exact situation.
                    </p>
                    <p>
                      <strong>Motion &amp; Vibration Sensor:</strong> Processes local accelerometer readings to detect ground vibrations from heavy water flow. Readings are discarded immediately after processing.
                    </p>
                  </div>
                </div>

                {/* 3. GPS Location Privacy */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-slate-900">
                      3. GPS Location Coordinates
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The app does not track your background location. GPS coordinates are requested only when you submit an emergency Voice SOS or a Flood Check-In with &ldquo;Attach GPS&rdquo; selected. These coordinates are pinned on the admin rescue map so rescue teams can navigate to your location quickly.
                  </p>
                </div>

                {/* 4. Local Storage and Data Controls */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="w-4 h-4 text-slate-600" />
                    <h3 className="font-bold text-sm text-slate-900">
                      4. Your Data Controls &amp; Cache Reset
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    You have full control over the data stored on this device. You can clear your local cache, dismiss alerts, or sign out at any time.
                  </p>

                  {clearDataSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Cached offline data has been cleared from this device.</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleClearCachedData}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Cached Local Data</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
             TAB 3: DOWNLOAD APK (SIMPLIFIED & ELEGANT)
             ========================================================================= */}
          {activeTab === 'download' && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Smartphone className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold text-slate-900">
                          Official Android Native App (APK)
                        </h2>
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                          {apkConfig.version}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                        Free direct download for Android phones. Plays loud emergency sirens even when locked, inactive, or offline.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Simplified Download Button */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      id="btn-full-download-apk"
                      onClick={handleDownloadApk}
                      className="flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-md transition cursor-pointer"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download Android APK ({apkConfig.fileSize || '8.5 MB'})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyApkLink}
                      className="py-3.5 px-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 active:scale-98 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-500" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 text-center font-medium">
                    Verified Release &bull; Package: <code className="font-mono text-slate-700">com.dzenjecdsstem.floodalert</code>
                  </p>
                </div>

                {/* 3 Simple Install Steps */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">
                    How to Install in 3 Easy Steps:
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        1
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">Download</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Tap the blue download button above to save the APK file.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        2
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">Open &amp; Allow</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Open your phone's notification or Downloads and choose &ldquo;Install&rdquo;.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        3
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">Ready for Alerts</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Open the app once to enable loud sirens and background alarms.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
             TAB 4: TERMS OF USE
             ========================================================================= */}
          {activeTab === 'terms' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Community Disaster Warning Terms of Use
                </h3>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <strong className="text-slate-900 block text-xs mb-0.5">1. Purpose</strong>
                  This application is a student STEM project created for disaster risk reduction along the Ruo River and surrounding communities in Mulanje, Malawi.
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <strong className="text-slate-900 block text-xs mb-0.5">2. Physical Safety Priority</strong>
                  Always prioritize immediate physical evacuation to high ground when flood waters rise or warning bells ring. Never enter rushing river water to retrieve possessions or record video.
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <strong className="text-slate-900 block text-xs mb-0.5">3. Genuine Emergency Use</strong>
                  The Emergency Voice SOS and high-water sighting reporting buttons must only be used during genuine emergency events to keep rescue channels clear for vulnerable residents.
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <strong className="text-slate-900 block text-xs mb-0.5">4. Free &amp; Open Community Service</strong>
                  This service is provided completely free of charge to all residents, schools, and village disaster committees.
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
