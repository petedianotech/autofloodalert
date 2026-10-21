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
  currentMode,
  onSelectMode,
  activeAlertCount = 0,
  onRefresh,
  isRefreshing = false,
}) => {
  const { t, isChichewa, toggleLanguage } = useTranslation(isAdmin);

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
  }

  const adminTabs: NavTab[] = [
    { id: 'admin', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'sensor', label: t.navSensor, icon: Activity },
    { id: 'receiver', label: t.navAlerts, icon: Bell },
    { id: 'village', label: t.navVillage, icon: MapPin },
  ];

  const villagerTabs: NavTab[] = [
    { id: 'village', label: t.navVillage, icon: MapPin },
    { id: 'receiver', label: t.navAlerts, icon: Bell },
  ];

  const desktopTabs = isAdmin ? adminTabs : villagerTabs;

  return (
    <header
      id="app-top-bar"
      className="sticky top-0 z-30 bg-white px-4 sm:px-6 lg:px-8 py-3 border-b border-slate-200 shadow-sm"
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: App Branding */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/icon.svg"
            alt="App Icon"
            className="w-10 h-10 rounded-xl shadow-xs shrink-0 object-cover"
          />
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
              {t.appName}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              {t.clubName}
            </p>
          </div>
        </div>

        {/* Center: Navigation */}
        {onSelectMode && (
          <nav className="hidden md:flex items-center gap-1">
            {desktopTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectMode(tab.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'receiver' && activeAlertCount > 0 && (
                     <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeAlertCount}</span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right: Language Switcher (Users only), Refresh, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* English / Chichewa Language Switch Toggle (Users UI Only - Flag Only) */}
          {!isAdmin && (
            <button
              type="button"
              id="btn-language-toggle"
              onClick={toggleLanguage}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 flex items-center justify-center transition cursor-pointer shadow-2xs shrink-0"
              title={
                isChichewa
                  ? 'Sinthani kupita ku Chingerezi (Switch to English)'
                  : 'Sinthani ku Chichewa (Switch to Chichewa)'
              }
              aria-label={
                isChichewa
                  ? 'Sinthani kupita ku Chingerezi (Switch to English)'
                  : 'Sinthani ku Chichewa (Switch to Chichewa)'
              }
            >
              {isChichewa ? (
                /* Malawi Flag */
                <span className="inline-flex items-center justify-center shrink-0 overflow-hidden rounded-[3px] shadow-2xs border border-slate-300/60 w-6 h-4">
                  <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
                    <rect width="60" height="13.33" fill="#000000" />
                    <rect y="13.33" width="60" height="13.34" fill="#DA121A" />
                    <rect y="26.67" width="60" height="13.33" fill="#007A3D" />
                    <circle cx="30" cy="13.33" r="5" fill="#DA121A" />
                    <g stroke="#DA121A" strokeWidth="0.8">
                      {[...Array(11)].map((_, i) => {
                        const rad = ((i * 180) / 10 * Math.PI) / 180;
                        return (
                          <line
                            key={i}
                            x1={30 - Math.cos(rad) * 6}
                            y1={13.33 - Math.sin(rad) * 6}
                            x2={30 - Math.cos(rad) * 8}
                            y2={13.33 - Math.sin(rad) * 8}
                          />
                        );
                      })}
                    </g>
                  </svg>
                </span>
              ) : (
                /* Britain Flag */
                <span className="inline-flex items-center justify-center shrink-0 overflow-hidden rounded-[3px] shadow-2xs border border-slate-300/60 w-6 h-4">
                  <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
                    <path d="M0,0 h60 v40 h-60 z" fill="#012169" />
                    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="6" />
                    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="3" />
                    <path d="M30,0 v40 M0,20 h60" stroke="#FFFFFF" strokeWidth="10" />
                    <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="6" />
                  </svg>
                </span>
              )}
            </button>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            id="btn-topbar-refresh"
            onClick={onRefresh}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* User Profile / Auth Button */}
          <button
            type="button"
            id="btn-topbar-user-profile"
            onClick={onOpenAuthModal}
            className="h-9 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold text-xs transition cursor-pointer active:scale-95 shadow-xs"
          >
            {getInitials()}
          </button>
        </div>
      </div>
    </header>
  );
};
