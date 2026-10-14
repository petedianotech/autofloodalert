import React from 'react';
import { UserProfile, NodeMode } from '../types';
import { useTranslation } from '../services/i18n';

interface TopBarProps {
  currentUser: UserProfile | null;
  isAdmin?: boolean;
  onOpenAuthModal: () => void;
  onOpenVoiceSOS?: () => void;
  onOpenAboutModal?: () => void;
  selectedVillage?: string;
  currentMode?: NodeMode;
  onSelectMode?: (mode: NodeMode) => void;
  isDarkMode?: boolean;
  isArmed?: boolean;
  isPaused?: boolean;
  sensorState?: any;
  wakeLockState?: any;
  isFirebaseConnected?: boolean;
  onOpenFirebaseModal?: () => void;
  activeAlertCount?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  onOpenAuthModal,
}) => {
  const { t } = useTranslation();

  const getInitials = () => {
    if (!currentUser?.name) return 'U';
    const parts = currentUser.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return currentUser.name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      id="app-top-bar"
      className="sticky top-0 z-30 bg-white border-b border-slate-200/90 select-none"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Branding */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/icon.svg"
            alt=""
            className="w-9 h-9 rounded-xl shrink-0 object-cover border border-slate-200"
          />
          <div className="min-w-0">
            <h1 className="font-semibold text-sm sm:text-base text-slate-900 leading-tight truncate">
              {t.appName}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium leading-tight truncate">
              {t.clubName}
            </p>
          </div>
        </div>

        {/* Sign in / profile only */}
        <button
          type="button"
          id="btn-topbar-user-profile"
          onClick={onOpenAuthModal}
          className={`h-9 px-3 sm:px-3.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition active:scale-[0.98] cursor-pointer border ${
            currentUser
              ? 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
              : 'bg-[#1F71E8] text-white border-transparent hover:bg-[#1a63cc]'
          }`}
          title={currentUser ? `${t.signedInAs} ${currentUser.name}` : t.signIn}
        >
          {currentUser ? (
            <>
              <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {getInitials()}
              </div>
              <span className="max-w-[90px] sm:max-w-[140px] truncate hidden xs:inline sm:inline">
                {currentUser.name.split(' ')[0]}
              </span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  opacity="0.9"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  opacity="0.9"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  opacity="0.9"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  opacity="0.9"
                />
              </svg>
              <span>{t.signIn}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
