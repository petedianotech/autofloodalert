import React from 'react';
import { Info, RefreshCw, LayoutDashboard, Activity, Bell, MapPin } from 'lucide-react';
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
  isAdmin = false,
  onOpenAuthModal,
  onOpenAboutModal,
  currentMode,
  onSelectMode,
  isArmed,
  isPaused,
  activeAlertCount = 0,
  onRefresh,
  isRefreshing = false,
}) => {
  const { t } = useTranslation();

  // Get initials for user avatar badge
  const getInitials = () => {
    if (!currentUser?.name) return 'U';
    const parts = currentUser.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return currentUser.name.slice(0, 2).toUpperCase();
  };

  interface NavTab {
    id: NodeMode;
    label: string;
    icon: React.ForwardRefExoticComponent<any>;
    statusDot?: string | null;
    badge?: number | null;
  }

  const adminTabs: NavTab[] = [
    { id: 'admin', label: t.navDashboard, icon: LayoutDashboard },
    {
      id: 'sensor',
      label: t.navSensor,
      icon: Activity,
      statusDot: isArmed ? (isPaused ? 'bg-[#B06000]' : 'bg-[#137333]') : null,
    },
    {
      id: 'receiver',
      label: t.navAlerts,
      icon: Bell,
      badge: activeAlertCount > 0 ? activeAlertCount : null,
    },
    { id: 'village', label: t.navVillage, icon: MapPin },
  ];

  const villagerTabs: NavTab[] = [
    { id: 'village', label: t.navVillage, icon: MapPin },
    {
      id: 'receiver',
      label: t.navAlerts,
      icon: Bell,
      badge: activeAlertCount > 0 ? activeAlertCount : null,
    },
  ];

  const desktopTabs = isAdmin ? adminTabs : villagerTabs;

  return (
    <header
      id="app-top-bar"
      className="sticky top-0 z-30 bg-[#FEF7FF]/95 backdrop-blur-md px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 border-b border-slate-200/80 select-none shadow-xs"
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: App PWA Icon + App Name & Club Branding */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/icon.svg"
            alt="Automatic Flood Alert Icon"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl shadow-xs shrink-0 object-cover border border-blue-200/70"
          />
          <div className="min-w-0">
            {/* Top Line: App Name */}
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm md:text-base text-[#1C1B1F] leading-snug">
              <span className="truncate">{t.appName}</span>
              <span
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 inline-block shrink-0 shadow-2xs"
                title={t.systemLive}
              />
            </div>
            {/* Bottom Line: Dzenje CDSS ADDA STEM CLUB */}
            <p className="text-[10px] sm:text-xs text-[#49454F] font-semibold leading-tight mt-0.5 truncate">
              {t.clubName}
            </p>
          </div>
        </div>

        {/* Center: Tablet & Desktop Navigation Tabs */}
        {onSelectMode && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/80 shadow-2xs">
            {desktopTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectMode(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative ${
                    isActive
                      ? 'bg-[#1F71E8] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.statusDot && (
                    <span className={`w-1.5 h-1.5 rounded-full ${tab.statusDot}`} />
                  )}
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right: Refresh, About & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 1. About & Legal Info Button */}
          {onOpenAboutModal && (
            <button
              type="button"
              id="btn-topbar-about-info"
              onClick={onOpenAboutModal}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer border border-slate-200 shadow-2xs"
              title={t.about}
            >
              <Info className="w-4 h-4 text-blue-700" />
            </button>
          )}

          {/* 2. Manual Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              id="btn-topbar-refresh"
              onClick={onRefresh}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer border border-slate-200 shadow-2xs"
              title={t.refresh}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
            </button>
          )}

          {/* 3. Profile / Sign In */}
          <button
            type="button"
            id="btn-topbar-user-profile"
            onClick={onOpenAuthModal}
            className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 sm:gap-2 text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer border ${
              currentUser
                ? 'bg-[#E8DEF8] text-[#1D192B] border-purple-200 hover:bg-[#DBCDEE]'
                : 'bg-white text-[#1F71E8] border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
            title={currentUser ? `${t.signedInAs} ${currentUser.name}` : t.signIn}
          >
            {currentUser ? (
              <>
                <div className="w-5 h-5 rounded-full bg-[#6750A4] text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">
                  {getInitials()}
                </div>
                <span className="max-w-[80px] sm:max-w-[120px] truncate text-xs font-bold">
                  {currentUser.name.split(' ')[0]}
                </span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{t.signIn}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
