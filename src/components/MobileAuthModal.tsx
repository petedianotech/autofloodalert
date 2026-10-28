import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  LogIn,
  LogOut,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Check,
  Phone,
  Smartphone,
  Shield,
  SlidersHorizontal,
  Hand,
  Globe,
  Radio,
  Award,
  Lock,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, isAppAdmin } from '../types';
import { firebaseFloodService } from '../services/firebaseService';

interface MobileAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  isDarkMode?: boolean;
  onSignedIn?: (isAdmin: boolean) => void;
  onOpenAboutLegal?: (tab?: 'thanks' | 'about' | 'privacy' | 'terms') => void;
}

const POPULAR_VILLAGES = [
  'Dzenje Village',
  'Machokola Village',
];

export const MobileAuthModal: React.FC<MobileAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignedIn,
  onOpenAboutLegal,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [village, setVillage] = useState(currentUser?.village || 'Dzenje Village');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(currentUser?.smsAlertsEnabled !== false);
  const [swipeGesturesEnabled, setSwipeGesturesEnabled] = useState(
    Boolean(currentUser?.swipeGesturesEnabled ?? false)
  );
  const [alertLanguage, setAlertLanguage] = useState<'en' | 'ny'>('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setName(currentUser.name);
      if (currentUser.village) setVillage(currentUser.village);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.smsAlertsEnabled !== undefined) setSmsAlertsEnabled(currentUser.smsAlertsEnabled);
      if (currentUser.swipeGesturesEnabled !== undefined) {
        setSwipeGesturesEnabled(Boolean(currentUser.swipeGesturesEnabled));
      }
      if (currentUser.alertLanguage) setAlertLanguage(currentUser.alertLanguage);
    }
  }, [currentUser]);

  const isAdmin = isAppAdmin(currentUser);

  if (!isOpen) return null;

  const handleContinueAsGuest = () => {
    try {
      localStorage.setItem('flood_welcome_chosen', 'guest');
    } catch {
      // ignore
    }
    onSignedIn?.(false);
    onClose();
  };

  const handleVillageSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!village.trim()) {
      setError('Please enter or choose your village');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      try {
        localStorage.setItem('flood_welcome_chosen', 'signed_in');
      } catch {
        // ignore
      }
      const profile = await firebaseFloodService.signInWithNameAndVillage(
        name.trim(),
        village.trim(),
        phone.trim(),
        smsAlertsEnabled,
        undefined,
        alertLanguage
      );
      const isUserAdmin = isAppAdmin(profile);
      if (isUserAdmin) {
        setSuccessMsg(`Welcome Admin (${profile.name})!`);
      } else {
        setSuccessMsg(`Welcome, ${profile.name}!`);
      }
      setTimeout(() => {
        onClose();
        onSignedIn?.(isUserAdmin);
        setSuccessMsg(null);
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      try {
        localStorage.setItem('flood_welcome_chosen', 'signed_in');
      } catch {
        // ignore
      }
      const targetVillage = village.trim() || 'Dzenje Village';
      const profile = await firebaseFloodService.signInWithGoogle(
        targetVillage,
        phone.trim(),
        smsAlertsEnabled,
        alertLanguage
      );
      const isUserAdmin = isAppAdmin(profile);
      if (isUserAdmin) {
        setSuccessMsg(`Welcome Admin (${profile.name})!`);
      } else {
        setSuccessMsg(`Welcome, ${profile.name}!`);
      }
      setTimeout(() => {
        onClose();
        onSignedIn?.(isUserAdmin);
        setSuccessMsg(null);
      }, 600);
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('unauthorized-domain') ||
        msg.includes('popup') ||
        msg.includes('restricted') ||
        msg.includes('invalid')
      ) {
        if (!name) setName('Peter Damiano');
        setError(
          'Google OAuth requires authorized domains in Firebase. Please use Quick Resident Registration below to enter your Full Name & Village for instant access!'
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await firebaseFloodService.signOutUser();
      setName('');
      setVillage('Dzenje Village');
      setPhone('');
      setSuccessMsg('Signed out successfully.');
      setTimeout(() => {
        onClose();
        onSignedIn?.(false);
        setSuccessMsg(null);
      }, 500);
    } catch (err) {
      setError('Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVillageOnly = async (newVillage: string) => {
    setVillage(newVillage);
    if (currentUser) {
      try {
        await firebaseFloodService.updateProfileData({ village: newVillage });
        setSuccessMsg(`Village updated to ${newVillage}`);
        setTimeout(() => setSuccessMsg(null), 1800);
      } catch {
        // ignore
      }
    }
  };

  const handleToggleSwipeGestures = async (enabled: boolean) => {
    setSwipeGesturesEnabled(enabled);
    if (currentUser) {
      try {
        await firebaseFloodService.updateProfileData({ swipeGesturesEnabled: enabled });
        setSuccessMsg(enabled ? 'Swipe gestures enabled' : 'Swipe gestures turned off');
        setTimeout(() => setSuccessMsg(null), 1800);
      } catch {
        // ignore
      }
    }
  };

  const handleUpdateLanguageOnly = async (newLang: 'en' | 'ny') => {
    setAlertLanguage(newLang);
    if (currentUser) {
      try {
        await firebaseFloodService.updateProfileData({ alertLanguage: newLang });
        setSuccessMsg(newLang === 'ny' ? 'Alert language set to Chichewa' : 'Alert language set to English');
        setTimeout(() => setSuccessMsg(null), 1800);
      } catch {
        // ignore
      }
    }
  };

  const handleSavePhoneAndSms = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      await firebaseFloodService.updateProfileData({
        phone: phone.trim(),
        smsAlertsEnabled,
        swipeGesturesEnabled,
        alertLanguage,
      });
      setSuccessMsg('Profile settings saved successfully!');
      setTimeout(() => setSuccessMsg(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (userName?: string) => {
    if (!userName) return 'CD';
    const parts = userName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Authentication & Profile"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-lg w-full max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Professional Modal Header */}
        <header className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                {currentUser ? 'Your Profile & Settings' : 'Automatic Flood Alert'}
              </h2>
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 font-medium">
                <span>{currentUser ? 'Dzenje CDSS STEM Club' : 'Sign In'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={currentUser ? onClose : handleContinueAsGuest}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">

        {/* Content Area */}
        {currentUser ? (
          /* =========================================================================
             VIEW 1: CLEAN PROFILE & SETTINGS VIEW
             ========================================================================= */
          <div className="p-5 space-y-4">
            {/* User Identity Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5 shadow-2xs">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#1F71E8] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                  {getInitials(currentUser.name)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-base text-slate-900 truncate">
                    {currentUser.name}
                  </h4>
                  {isAdmin ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      Village Admin
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                      Resident
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate font-semibold text-[#1F71E8]">{currentUser.village}</span>
                  {currentUser.email && (
                    <span className="text-slate-400 text-[11px] truncate">• {currentUser.email}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Gesture Navigation Setting (OFF by Default, User Controlled) */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Hand className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Screen Swipe Gestures
                    </span>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Swipe left or right across the screen to switch tabs. (Disabled by default to prevent accidental page turns).
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleSwipeGestures(!swipeGesturesEnabled)}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                    swipeGesturesEnabled ? 'bg-[#1F71E8]' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={swipeGesturesEnabled}
                >
                  <div
                    className={`w-5.5 h-5.5 rounded-full bg-white shadow-xs transition-transform transform ${
                      swipeGesturesEnabled ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Quick Village Switcher */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Your Village
              </span>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_VILLAGES.map((v) => {
                  const isSelected = currentUser.village === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleUpdateVillageOnly(v)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#1F71E8] text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-[#1F71E8]'
                      }`}
                    >
                      <span className="truncate">{v}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>



            {/* Phone Number & SMS Alerts */}
            <form onSubmit={handleSavePhoneAndSms} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  SMS Flood Alert Phone Number
                </span>
                {currentUser.phone ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Optional
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <input
                  id="input-profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="099..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 outline-none focus:border-[#1F71E8] focus:ring-1 focus:ring-[#1F71E8]"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsAlertsEnabled}
                  onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1F71E8] focus:ring-[#1F71E8] border-slate-300"
                />
                <span>Receive emergency SMS alerts when river rises</span>
              </label>

              {/* Alert Language Preference */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">
                    Alert &amp; SMS Language / Chilankhulo
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {alertLanguage === 'ny' ? '🇲🇼 Chichewa' : '🇬🇧 English (Default)'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateLanguageOnly('en')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      alertLanguage === 'en'
                        ? 'bg-[#1F71E8] text-white border-[#1F71E8] shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>🇬🇧 English (Default)</span>
                    {alertLanguage === 'en' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateLanguageOnly('ny')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      alertLanguage === 'ny'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>🇲🇼 Chichewa</span>
                    {alertLanguage === 'ny' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-save-phone-sms"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#1F71E8] hover:bg-blue-700 text-white shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save Profile Settings</span>
              </button>
            </form>

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* User Profile Legal & Thanks Access (Hidden for Admins) */}
            {!isAdmin && onOpenAboutLegal && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => onOpenAboutLegal('thanks')}
                onKeyDown={(e) => { if (e.key === 'Enter') onOpenAboutLegal('thanks'); }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 flex items-center justify-between cursor-pointer transition shadow-2xs active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">App Information &amp; Legal Policies</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Thanks, About, Privacy &amp; Terms</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                id="btn-sign-out"
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-black text-white shadow-2xs transition active:scale-98 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
             VIEW 2: REDESIGNED CLEAN & DIRECT SIGN IN
             ========================================================================= */
          <div className="p-5 space-y-4">
            {/* Registration Benefits & Guest Notice */}
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-950 leading-relaxed">
              <strong>Why register?</strong> Registering allows you to mark your family safe, submit flood sighting reports, and receive emergency SMS siren alerts. Guests can view alerts and shelters in read-only mode.
            </div>

            {/* Quick Google Sign In */}
            <div>
              <button
                id="btn-google-sign-in"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer min-h-[44px]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#1F71E8]" />
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Elegant Divider */}
            <div className="relative flex items-center justify-center py-0.5">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                or quick resident registration
              </span>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold flex items-center gap-2 border border-red-200 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Direct Resident Form */}
            <form onSubmit={handleVillageSignIn} className="space-y-2.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input-auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Peter Damiano"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 outline-none focus:border-[#1F71E8] focus:bg-white focus:ring-1 focus:ring-[#1F71E8]"
                  />
                </div>
              </div>

              {/* Village */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Village Name
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Mulanje District</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    id="input-auth-village"
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Dzenje Village"
                    className="w-full pl-9.5 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 outline-none focus:border-[#1F71E8] focus:bg-white focus:ring-1 focus:ring-[#1F71E8]"
                  />
                </div>

                {/* Quick Village Pills */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Quick select:</span>
                  {POPULAR_VILLAGES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setVillage(p)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition active:scale-95 cursor-pointer ${
                        village === p
                          ? 'bg-[#1F71E8] text-white border-[#1F71E8] shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number (Optional) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Phone Number (Optional for SMS Siren Alerts)
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="input-auth-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="099..."
                    className="w-full pl-9.5 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 outline-none focus:border-[#1F71E8] focus:bg-white focus:ring-1 focus:ring-[#1F71E8]"
                  />
                </div>
              </div>

              {/* Alert Language Selection */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Receive Alerts In (SMS &amp; In-App)
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">English by default</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertLanguage('en')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      alertLanguage === 'en'
                        ? 'bg-[#1F71E8] text-white border-[#1F71E8] shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>🇬🇧 English (Default)</span>
                    {alertLanguage === 'en' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAlertLanguage('ny')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      alertLanguage === 'ny'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>🇲🇼 Chichewa</span>
                    {alertLanguage === 'ny' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Enter Button */}
              <button
                id="btn-submit-village-auth"
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#1F71E8] hover:bg-blue-700 text-white shadow-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer mt-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Enter Flood Alert Network</span>
                  </>
                )}
              </button>
            </form>

            {/* Guest Access Link */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                id="btn-choice-continue-guest"
                onClick={handleContinueAsGuest}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                <span>Continue as Guest (Read-Only)</span>
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
