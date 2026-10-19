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

/** Simple inline Malawi flag (black / red / green horizontal bands + sun) */
const MalawiFlagIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 36 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="36" height="8" y="0" fill="#000000" />
    <rect width="36" height="8" y="8" fill="#CE1126" />
    <rect width="36" height="8" y="16" fill="#339E35" />
    {/* Simplified rising sun in the red band */}
    <circle cx="18" cy="12" r="3.2" fill="#000000" />
    <g fill="#CE1126">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect
          key={deg}
          x="17.2"
          y="6.5"
          width="1.6"
          height="3.5"
          transform={`rotate(${deg} 18 12)`}
        />
      ))}
    </g>
  </svg>
);

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
  const { t, toggleLanguage, isChichewa, language } = useTranslation();

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
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {activeAlertCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right: Malawi flag language toggle (before refresh) + Refresh + User */}
        <div className="flex items-center gap-2">
          {/* Malawi flag button — toggles Chichewa ↔ English */}
          <button
            type="button"
            id="btn-toggle-language"
            onClick={toggleLanguage}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer border border-slate-200"
            title={isChichewa ? t.switchToEnglish : t.switchToChichewa}
            aria-label={isChichewa ? 'Switch to English' : 'Switch to Chichewa'}
          >
            <MalawiFlagIcon className="w-6 h-4 rounded-sm shadow-sm" />
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs transition cursor-pointer hover:bg-blue-700"
          >
            {getInitials()}
          </button>
        </div>
      </div>
    </header>
  );
};
