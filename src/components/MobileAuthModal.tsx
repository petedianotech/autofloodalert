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
  Info,
  FileText,
  Lock,
  Award,
} from 'lucide-react';
import { UserProfile, isAppAdmin } from '../types';
import { firebaseFloodService } from '../services/firebaseService';

interface MobileAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  isDarkMode?: boolean;
  onSignedIn?: (isAdmin: boolean) => void;
  onOpenAboutModal?: (tab?: 'thanks' | 'about' | 'privacy' | 'terms') => void;
}

const POPULAR_VILLAGES = ['Dzenje Village', 'Machokola Village'];

export const MobileAuthModal: React.FC<MobileAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignedIn,
  onOpenAboutModal,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [village, setVillage] = useState(currentUser?.village || 'Dzenje Village');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(currentUser?.smsAlertsEnabled !== false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setVillage(currentUser.village || 'Dzenje Village');
      setPhone(currentUser.phone || '');
      setSmsAlertsEnabled(currentUser.smsAlertsEnabled !== false);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const getInitials = (n: string) => {
    const parts = (n || 'U').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (n || 'U').slice(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await firebaseFloodService.signOut();
      onClose();
    } catch {
      setErrorMsg('Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await firebaseFloodService.updateProfileData({
        phone: phone.trim(),
        smsAlertsEnabled,
      });
      setSuccessMsg('Profile settings saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const profile = await firebaseFloodService.signInWithGoogle(village);
      const isUserAdmin = isAppAdmin(profile);
      setSuccessMsg(isUserAdmin ? `Welcome Admin (${profile.name})!` : `Welcome, ${profile.name}!`);
      onSignedIn?.(isUserAdmin);
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNameVillageSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const profile = await firebaseFloodService.signInWithNameAndVillage(
        name.trim(),
        village,
        phone.trim() || undefined
      );
      const isUserAdmin = isAppAdmin(profile);
      setSuccessMsg(isUserAdmin ? `Welcome Admin (${profile.name})!` : `Welcome, ${profile.name}!`);
      onSignedIn?.(isUserAdmin);
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Authentication & Profile"
    >
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] overflow-hidden flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">
            {currentUser ? 'Your Profile & Settings' : 'Sign In to Flood Alert'}
          </h3>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {currentUser ? (
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#1F71E8] text-white font-bold text-base flex items-center justify-center shrink-0">
                  {getInitials(currentUser.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base text-slate-900 truncate">{currentUser.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span className="truncate font-semibold text-[#1F71E8]">{currentUser.village}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="input-profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="099..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-[#1F71E8] focus:ring-1 focus:ring-[#1F71E8]"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsAlertsEnabled}
                    onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1F71E8]"
                  />
                  <span>Receive emergency SMS alerts when river rises</span>
                </label>
                <button
                  id="btn-save-phone-sms"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#1F71E8] hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Profile Settings</span>
                </button>
              </form>

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-bold border border-red-200">
                  {errorMsg}
                </div>
              )}

              {onOpenAboutModal && (
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Legal & About</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" id="btn-profile-about" onClick={() => onOpenAboutModal('about')} className="py-2.5 px-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-1.5 cursor-pointer">
                      <Info className="w-3.5 h-3.5 text-[#1F71E8]" /><span>About</span>
                    </button>
                    <button type="button" id="btn-profile-privacy" onClick={() => onOpenAboutModal('privacy')} className="py-2.5 px-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-1.5 cursor-pointer">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" /><span>Privacy</span>
                    </button>
                    <button type="button" id="btn-profile-terms" onClick={() => onOpenAboutModal('terms')} className="py-2.5 px-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-1.5 cursor-pointer">
                      <FileText className="w-3.5 h-3.5 text-amber-600" /><span>Terms</span>
                    </button>
                    <button type="button" id="btn-profile-thanks" onClick={() => onOpenAboutModal('thanks')} className="py-2.5 px-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-1.5 cursor-pointer">
                      <Award className="w-3.5 h-3.5 text-violet-600" /><span>Thanks</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                id="btn-sign-out"
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /><span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-950">
                <strong>Why register?</strong> Mark your family safe, submit flood reports, and receive emergency SMS alerts.
              </div>

              <button
                id="btn-google-sign-in"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 flex items-center justify-center gap-2.5 cursor-pointer min-h-[44px]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Continue with Google</span>}
              </button>

              <div className="relative flex items-center justify-center py-0.5">
                <div className="border-t border-slate-200 w-full" />
                <span className="absolute bg-white px-2 text-[10px] text-slate-400 font-bold">OR</span>
              </div>

              <form onSubmit={handleNameVillageSignIn} className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-[#1F71E8]"
                  required
                />
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Village / community name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-[#1F71E8]"
                />
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_VILLAGES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVillage(v)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer ${
                        village === v
                          ? 'bg-[#1F71E8] text-white border-[#1F71E8]'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#1F71E8] hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                  <span>Sign In</span>
                </button>
              </form>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-bold border border-red-200">
                  {errorMsg}
                </div>
              )}

              {onOpenAboutModal && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 justify-center">
                  <button type="button" onClick={() => onOpenAboutModal('privacy')} className="text-[11px] font-bold text-slate-500 hover:text-[#1F71E8] cursor-pointer">Privacy</button>
                  <span className="text-slate-300">·</span>
                  <button type="button" onClick={() => onOpenAboutModal('terms')} className="text-[11px] font-bold text-slate-500 hover:text-[#1F71E8] cursor-pointer">Terms</button>
                  <span className="text-slate-300">·</span>
                  <button type="button" onClick={() => onOpenAboutModal('about')} className="text-[11px] font-bold text-slate-500 hover:text-[#1F71E8] cursor-pointer">About</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
