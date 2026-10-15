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
} from 'lucide-react';
import { UserProfile, isAppAdmin } from '../types';
import { firebaseFloodService } from '../services/firebaseService';

interface MobileAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  isDarkMode?: boolean;
  onSignedIn?: (isAdmin: boolean) => void;
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
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [village, setVillage] = useState(currentUser?.village || 'Dzenje Village');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(currentUser?.smsAlertsEnabled !== false);
  const [swipeGesturesEnabled, setSwipeGesturesEnabled] = useState(
    Boolean(currentUser?.swipeGesturesEnabled ?? false)
  );
  const [alertLanguage, setAlertLanguage] = useState<'en' | 'ny'>(currentUser?.alertLanguage || 'en');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed');
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
        setSuccessMsg(newLang === 'ny' ? 'Chilankhulo chasinthidwa kukhala Chichewa' : 'Alert language set to English');
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
      id="screen-mobile-auth"
      className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-full w-full overflow-hidden select-none animate-in fade-in duration-200"
    >
      {/* Full-Screen Top Header Bar */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="btn-close-auth-modal"
            type="button"
            onClick={currentUser ? onClose : handleContinueAsGuest}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95 cursor-pointer shrink-0"
            title="Back"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
              {currentUser ? 'Your Profile & Settings' : 'Sign In to Flood Alert'}
            </h1>
            <p className="text-xs text-slate-500 font-medium truncate">
              {currentUser ? 'Dzenje CDSS STEM Club Network' : 'Dzenje Early Warning Community'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={currentUser ? onClose : handleContinueAsGuest}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 cursor-pointer"
        >
          {currentUser ? 'Done' : 'Guest'}
        </button>
      </header>

      {/* Main Full-Screen Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-24">
        <div className="max-w-xl mx-auto w-full bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">

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

            {/* Language Selection */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                Alert Language / Chilankhulo
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateLanguageOnly('ny')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    alertLanguage === 'ny'
                      ? 'bg-[#1F71E8] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-[#1F71E8]'
                  }`}
                >
                  <span>Chichewa</span>
                  {alertLanguage === 'ny' && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateLanguageOnly('en')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    alertLanguage === 'en'
                      ? 'bg-[#1F71E8] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-[#1F71E8]'
                  }`}
                >
                  <span>English</span>
                  {alertLanguage === 'en' && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
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
                  placeholder="e.g. 0999123456 or +265999123456"
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

              <button
                id="btn-save-phone-sms"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#1F71E8] hover:bg-blue-700 text-white shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save Phone & SMS Settings
              </button>
            </form>

            {/* Sign Out */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-red-50 text-red-700 border border-slate-200 hover:border-red-200 flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {successMsg}
              </div>
            )}
          </div>
        ) : (
          /* SIGN IN VIEW */
          <div className="p-5 space-y-4">
            <div className="text-center space-y-1 pb-2">
              <div className="w-14 h-14 rounded-2xl bg-[#1F71E8] text-white flex items-center justify-center mx-auto shadow-xs">
                <Shield className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Join Village Network</h2>
              <p className="text-xs text-slate-500">Dzenje & Machokola flood early warning</p>
            </div>

            <form onSubmit={handleVillageSignIn} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 outline-none focus:border-[#1F71E8] focus:ring-1 focus:ring-[#1F71E8]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Village</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {POPULAR_VILLAGES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVillage(v)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                        village === v
                          ? 'bg-[#1F71E8] text-white'
                          : 'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0999..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 outline-none focus:border-[#1F71E8]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Alert Language</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertLanguage('en')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold ${
                      alertLanguage === 'en' ? 'bg-[#1F71E8] text-white' : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertLanguage('ny')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold ${
                      alertLanguage === 'ny' ? 'bg-[#1F71E8] text-white' : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    Chichewa
                  </button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={smsAlertsEnabled}
                  onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1F71E8]"
                />
                Receive SMS flood alerts
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm bg-[#1F71E8] hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Sign in with Name
              </button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center"><span className="px-2 bg-white text-xs text-slate-400">or</span></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign in with Google
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {successMsg}
              </div>
            )}
          </div>
        )}
        </div>
      </main>
    </div>
  );
};
